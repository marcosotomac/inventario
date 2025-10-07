from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import time
from typing import Optional

app = FastAPI(
    title="Analítico Service API",
    description="Microservicio analítico con AWS Athena para reportes e indicadores",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración AWS
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
ATHENA_DATABASE = os.getenv('ATHENA_DATABASE', 'inventario_db')
ATHENA_OUTPUT_LOCATION = os.getenv(
    'ATHENA_OUTPUT_LOCATION', 's3://inventario-athena-results/')
AWS_PROFILE = os.getenv('AWS_PROFILE', 'default')

# Cliente Athena
try:
    session = boto3.Session(profile_name=AWS_PROFILE)
    athena_client = session.client('athena', region_name=AWS_REGION)
except Exception as e:
    print(f"Advertencia: No se pudo inicializar cliente Athena: {e}")
    athena_client = None


def ejecutar_consulta_athena(query: str):
    """Ejecutar consulta en Athena y retornar resultados"""
    if not athena_client:
        return {
            "error": "Cliente Athena no configurado",
            "mensaje": "Configure AWS credentials con ~/.aws/credentials"
        }

    try:
        # Iniciar ejecución de consulta
        response = athena_client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': ATHENA_DATABASE},
            ResultConfiguration={'OutputLocation': ATHENA_OUTPUT_LOCATION}
        )

        query_execution_id = response['QueryExecutionId']

        # Esperar a que la consulta termine
        max_attempts = 30
        for i in range(max_attempts):
            query_status = athena_client.get_query_execution(
                QueryExecutionId=query_execution_id)
            status = query_status['QueryExecution']['Status']['State']

            if status == 'SUCCEEDED':
                break
            elif status in ['FAILED', 'CANCELLED']:
                reason = query_status['QueryExecution']['Status'].get(
                    'StateChangeReason', 'Unknown')
                return {"error": f"Query {status}", "reason": reason}

            time.sleep(1)

        if status != 'SUCCEEDED':
            return {"error": "Query timeout"}

        # Obtener resultados
        results = athena_client.get_query_results(
            QueryExecutionId=query_execution_id)

        # Procesar resultados
        columns = [col['Label'] for col in results['ResultSet']
                   ['ResultSetMetadata']['ColumnInfo']]
        rows = []

        for row in results['ResultSet']['Rows'][1:]:  # Saltar header
            row_data = {}
            for i, col in enumerate(columns):
                row_data[col] = row['Data'][i].get('VarCharValue', None)
            rows.append(row_data)

        return {
            "columns": columns,
            "data": rows,
            "row_count": len(rows)
        }

    except Exception as e:
        return {"error": str(e)}


@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "service": "analitico",
        "athena_configured": athena_client is not None
    }


@app.get("/api/rotacion-stock")
async def rotacion_stock():
    """
    Análisis de rotación de stock - productos más vendidos
    """
    query = f"""
    SELECT 
        p.nombre as producto,
        p.categoria,
        SUM(d.cantidad) as total_vendido,
        AVG(p.stock) as stock_promedio,
        CASE 
            WHEN AVG(p.stock) > 0 THEN SUM(d.cantidad) / AVG(p.stock)
            ELSE 0 
        END as rotacion
    FROM productos p
    LEFT JOIN detalles_orden d ON p.id = d.producto_id
    GROUP BY p.nombre, p.categoria
    HAVING SUM(d.cantidad) > 0
    ORDER BY rotacion DESC
    LIMIT 20
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": "Rotación de Stock - Top 20 Productos",
        "descripcion": "Productos ordenados por índice de rotación (ventas/stock promedio)",
        **resultado
    }


@app.get("/api/productos-mas-vendidos")
async def productos_mas_vendidos(limit: int = 20):
    """
    Top productos más vendidos
    """
    query = f"""
    SELECT 
        p.nombre as producto,
        p.categoria,
        p.proveedor,
        SUM(d.cantidad) as cantidad_vendida,
        SUM(d.subtotal) as ingresos_totales,
        COUNT(DISTINCT d.orden_id) as num_ordenes
    FROM productos p
    INNER JOIN detalles_orden d ON p.id = d.producto_id
    GROUP BY p.nombre, p.categoria, p.proveedor
    ORDER BY cantidad_vendida DESC
    LIMIT {limit}
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": f"Top {limit} Productos Más Vendidos",
        **resultado
    }


@app.get("/api/ventas-por-categoria")
async def ventas_por_categoria():
    """
    Análisis de ventas por categoría
    """
    query = """
    SELECT 
        p.categoria,
        COUNT(DISTINCT p.id) as num_productos,
        SUM(d.cantidad) as unidades_vendidas,
        SUM(d.subtotal) as ingresos_totales,
        AVG(d.precio_unitario) as precio_promedio
    FROM productos p
    INNER JOIN detalles_orden d ON p.id = d.producto_id
    GROUP BY p.categoria
    ORDER BY ingresos_totales DESC
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": "Ventas por Categoría",
        "descripcion": "Análisis agregado de ventas agrupadas por categoría de producto",
        **resultado
    }


@app.get("/api/productos-bajo-stock")
async def productos_bajo_stock(umbral: int = 50):
    """
    Productos con stock crítico
    """
    query = f"""
    SELECT 
        p.nombre,
        p.categoria,
        p.stock,
        p.proveedor,
        p.precio,
        COALESCE(SUM(d.cantidad), 0) as ventas_totales
    FROM productos p
    LEFT JOIN detalles_orden d ON p.id = d.producto_id
    WHERE p.stock < {umbral}
    GROUP BY p.nombre, p.categoria, p.stock, p.proveedor, p.precio
    ORDER BY p.stock ASC
    LIMIT 50
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": f"Productos con Stock Crítico (< {umbral} unidades)",
        "umbral": umbral,
        **resultado
    }


@app.get("/api/rentabilidad-proveedores")
async def rentabilidad_proveedores():
    """
    Análisis de rentabilidad por proveedor
    """
    query = """
    SELECT 
        p.proveedor,
        COUNT(DISTINCT p.id) as productos_ofrecidos,
        SUM(d.cantidad) as unidades_vendidas,
        SUM(d.subtotal) as ingresos_totales,
        AVG(d.precio_unitario) as precio_promedio,
        COUNT(DISTINCT d.orden_id) as ordenes_totales
    FROM productos p
    INNER JOIN detalles_orden d ON p.id = d.producto_id
    WHERE p.proveedor IS NOT NULL
    GROUP BY p.proveedor
    ORDER BY ingresos_totales DESC
    LIMIT 30
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": "Rentabilidad por Proveedor - Top 30",
        "descripcion": "Proveedores ordenados por ingresos totales generados",
        **resultado
    }


@app.get("/api/tendencias-temporales")
async def tendencias_temporales():
    """
    Análisis de tendencias de ventas por mes
    """
    query = """
    SELECT 
        DATE_FORMAT(o.fecha_orden, '%Y-%m') as mes,
        COUNT(DISTINCT o.id) as num_ordenes,
        SUM(o.total) as ingresos_totales,
        AVG(o.total) as ticket_promedio,
        COUNT(DISTINCT o.cliente_id) as clientes_unicos
    FROM ordenes o
    GROUP BY DATE_FORMAT(o.fecha_orden, '%Y-%m')
    ORDER BY mes DESC
    LIMIT 12
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": "Tendencias Temporales - Últimos 12 Meses",
        **resultado
    }


@app.get("/api/clientes-top")
async def clientes_top(limit: int = 20):
    """
    Mejores clientes por volumen de compra
    """
    query = f"""
    SELECT 
        c.nombre as cliente,
        c.email,
        c.ciudad,
        COUNT(o.id) as num_ordenes,
        SUM(o.total) as gasto_total,
        AVG(o.total) as ticket_promedio,
        MAX(o.fecha_orden) as ultima_compra
    FROM clientes c
    INNER JOIN ordenes o ON c.id = o.cliente_id
    GROUP BY c.nombre, c.email, c.ciudad
    ORDER BY gasto_total DESC
    LIMIT {limit}
    """

    resultado = ejecutar_consulta_athena(query)
    return {
        "titulo": f"Top {limit} Mejores Clientes",
        **resultado
    }


@app.get("/api/dashboard-kpis")
async def dashboard_kpis():
    """
    KPIs principales para el dashboard
    """
    # Esta es una versión simplificada que puede ejecutarse sin Athena
    # En producción, estos datos vendrían de consultas Athena reales

    if not athena_client:
        return {
            "mensaje": "Datos de ejemplo (Athena no configurado)",
            "kpis": {
                "total_ventas": 15500000.50,
                "total_ordenes": 10000,
                "ticket_promedio": 1550.00,
                "productos_activos": 20000,
                "clientes_activos": 1000,
                "proveedores_activos": 500,
                "tasa_conversion": 0.45,
                "stock_total": 2500000
            }
        }

    # Aquí irían las consultas reales a Athena
    return {
        "kpis": {
            "total_ventas": 0,
            "total_ordenes": 0,
            "ticket_promedio": 0,
            "productos_activos": 0
        }
    }


@app.post("/api/consulta-personalizada")
async def consulta_personalizada(query: str):
    """
    Ejecutar consulta SQL personalizada en Athena
    """
    if not athena_client:
        raise HTTPException(
            status_code=503,
            detail="Servicio Athena no disponible. Configure AWS credentials."
        )

    resultado = ejecutar_consulta_athena(query)
    return resultado

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
