from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os
from typing import Optional

app = FastAPI(
    title="Integración Service API",
    description="Microservicio de integración que consolida datos de otros servicios",
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

# URLs de los microservicios
PRODUCTOS_SERVICE_URL = os.getenv(
    'PRODUCTOS_SERVICE_URL', 'http://productos-service:5001')
ORDENES_SERVICE_URL = os.getenv(
    'ORDENES_SERVICE_URL', 'http://ordenes-service:8080')
PROVEEDORES_SERVICE_URL = os.getenv(
    'PROVEEDORES_SERVICE_URL', 'http://proveedores-service:3000')


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "service": "integracion"}


@app.get("/api/services-status")
async def services_status():
    """Verificar el estado de todos los servicios"""
    status = {}

    async with httpx.AsyncClient(timeout=5.0) as client:
        # Productos
        try:
            response = await client.get(f"{PRODUCTOS_SERVICE_URL}/health")
            status["productos"] = {"status": "healthy",
                                   "code": response.status_code}
        except Exception as e:
            status["productos"] = {"status": "unhealthy", "error": str(e)}

        # Órdenes
        try:
            response = await client.get(f"{ORDENES_SERVICE_URL}/api/health")
            status["ordenes"] = {"status": "healthy",
                                 "code": response.status_code}
        except Exception as e:
            status["ordenes"] = {"status": "unhealthy", "error": str(e)}

        # Proveedores
        try:
            response = await client.get(f"{PROVEEDORES_SERVICE_URL}/health")
            status["proveedores"] = {
                "status": "healthy", "code": response.status_code}
        except Exception as e:
            status["proveedores"] = {"status": "unhealthy", "error": str(e)}

    return status


@app.get("/api/orden-completa/{orden_id}")
async def get_orden_completa(orden_id: int):
    """
    Obtener orden con información completa de productos y proveedor
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Obtener orden
            orden_response = await client.get(f"{ORDENES_SERVICE_URL}/api/ordenes/{orden_id}")
            if orden_response.status_code != 200:
                raise HTTPException(
                    status_code=404, detail="Orden no encontrada")

            orden = orden_response.json()

            # Enriquecer detalles con información de productos
            detalles_enriquecidos = []
            for detalle in orden.get('detalles', []):
                producto_id = detalle.get('productoId')

                # Obtener información del producto
                try:
                    producto_response = await client.get(
                        f"{PRODUCTOS_SERVICE_URL}/api/productos/{producto_id}"
                    )
                    if producto_response.status_code == 200:
                        producto = producto_response.json()
                        detalle['producto_info'] = {
                            'nombre': producto.get('nombre'),
                            'descripcion': producto.get('descripcion'),
                            'categoria': producto.get('categoria'),
                            'proveedor': producto.get('proveedor'),
                            'sku': producto.get('sku'),
                            'stock_actual': producto.get('stock')
                        }
                except:
                    detalle['producto_info'] = None

                detalles_enriquecidos.append(detalle)

            orden['detalles'] = detalles_enriquecidos

            return orden

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500, detail=f"Error al consultar servicios: {str(e)}")


@app.get("/api/producto-completo/{producto_id}")
async def get_producto_completo(producto_id: int):
    """
    Obtener producto con información del proveedor
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Obtener producto
            producto_response = await client.get(
                f"{PRODUCTOS_SERVICE_URL}/api/productos/{producto_id}"
            )
            if producto_response.status_code != 200:
                raise HTTPException(
                    status_code=404, detail="Producto no encontrado")

            producto = producto_response.json()
            proveedor_nombre = producto.get('proveedor')

            # Buscar información del proveedor
            if proveedor_nombre:
                try:
                    proveedores_response = await client.get(
                        f"{PROVEEDORES_SERVICE_URL}/api/proveedores/buscar/{proveedor_nombre}"
                    )
                    if proveedores_response.status_code == 200:
                        proveedores = proveedores_response.json()
                        if proveedores:
                            producto['proveedor_info'] = proveedores[0]
                except:
                    producto['proveedor_info'] = None

            return producto

        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500, detail=f"Error al consultar servicios: {str(e)}")


@app.get("/api/dashboard-resumen")
async def get_dashboard_resumen():
    """
    Obtener resumen consolidado para el dashboard
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        resumen = {}

        try:
            # Total de productos
            productos_response = await client.get(f"{PRODUCTOS_SERVICE_URL}/api/productos?page=1&per_page=1")
            if productos_response.status_code == 200:
                productos_data = productos_response.json()
                resumen['total_productos'] = productos_data.get('total', 0)
        except:
            resumen['total_productos'] = 0

        try:
            # Total de órdenes
            ordenes_response = await client.get(f"{ORDENES_SERVICE_URL}/api/ordenes?page=0&size=1")
            if ordenes_response.status_code == 200:
                ordenes_data = ordenes_response.json()
                resumen['total_ordenes'] = ordenes_data.get('totalItems', 0)
        except:
            resumen['total_ordenes'] = 0

        try:
            # Total de proveedores
            proveedores_response = await client.get(f"{PROVEEDORES_SERVICE_URL}/api/proveedores?page=1&limit=1")
            if proveedores_response.status_code == 200:
                proveedores_data = proveedores_response.json()
                resumen['total_proveedores'] = proveedores_data.get(
                    'totalItems', 0)
        except:
            resumen['total_proveedores'] = 0

        try:
            # Categorías
            categorias_response = await client.get(f"{PRODUCTOS_SERVICE_URL}/api/categorias")
            if categorias_response.status_code == 200:
                categorias = categorias_response.json()
                resumen['total_categorias'] = len(categorias)
        except:
            resumen['total_categorias'] = 0

        return resumen


@app.get("/api/ordenes-recientes")
async def get_ordenes_recientes(limit: int = 10):
    """
    Obtener órdenes recientes con información de cliente
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            ordenes_response = await client.get(
                f"{ORDENES_SERVICE_URL}/api/ordenes?page=0&size={limit}"
            )
            if ordenes_response.status_code == 200:
                return ordenes_response.json()
            else:
                raise HTTPException(
                    status_code=500, detail="Error al obtener órdenes")
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500, detail=f"Error al consultar servicio de órdenes: {str(e)}")


@app.get("/api/productos-bajo-stock")
async def get_productos_bajo_stock(stock_minimo: int = 50):
    """
    Obtener productos con stock bajo el mínimo especificado
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Obtener productos
            productos_response = await client.get(
                f"{PRODUCTOS_SERVICE_URL}/api/productos?page=1&per_page=100"
            )
            if productos_response.status_code == 200:
                productos_data = productos_response.json()
                productos = productos_data.get('productos', [])

                # Filtrar productos con stock bajo
                productos_bajo_stock = [
                    p for p in productos if p.get('stock', 0) < stock_minimo
                ]

                return {
                    'stock_minimo': stock_minimo,
                    'total': len(productos_bajo_stock),
                    'productos': productos_bajo_stock
                }
            else:
                raise HTTPException(
                    status_code=500, detail="Error al obtener productos")
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500, detail=f"Error al consultar servicio de productos: {str(e)}")


@app.get("/api/proveedores-activos")
async def get_proveedores_activos():
    """
    Obtener proveedores activos con su información de entrega
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            proveedores_response = await client.get(
                f"{PROVEEDORES_SERVICE_URL}/api/proveedores/estado/ACTIVO"
            )
            if proveedores_response.status_code == 200:
                return proveedores_response.json()
            else:
                raise HTTPException(
                    status_code=500, detail="Error al obtener proveedores")
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=500, detail=f"Error al consultar servicio de proveedores: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
