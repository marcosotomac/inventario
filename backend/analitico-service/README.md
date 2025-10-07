# Microservicio Analítico

Microservicio para análisis de datos usando AWS Athena con FastAPI.

## Características

- ✅ Integración con AWS Athena
- ✅ Consultas SQL analíticas
- ✅ KPIs y métricas de negocio
- ✅ Vistas SQL predefinidas
- ✅ Documentación automática con FastAPI/Swagger
- ✅ Dockerizado

## Variables de Entorno

```bash
AWS_REGION=us-east-1
AWS_PROFILE=default
ATHENA_DATABASE=inventario_db
ATHENA_OUTPUT_LOCATION=s3://inventario-athena-results/
```

## Configuración AWS

Este servicio requiere:

1. AWS credentials configuradas en `~/.aws/credentials`
2. Bucket S3 para resultados de Athena
3. Catálogo AWS Glue con tablas de productos, órdenes y clientes
4. Permisos IAM para Athena, S3 y Glue

## Endpoints

### Health & Status

- `GET /health` - Health check y estado de Athena

### Análisis de Inventario

- `GET /api/rotacion-stock` - Índice de rotación de productos
- `GET /api/productos-mas-vendidos?limit=20` - Top productos vendidos
- `GET /api/productos-bajo-stock?umbral=50` - Productos con stock crítico

### Análisis de Ventas

- `GET /api/ventas-por-categoria` - Ventas agregadas por categoría
- `GET /api/tendencias-temporales` - Tendencias mensuales
- `GET /api/rentabilidad-proveedores` - Rentabilidad por proveedor

### Análisis de Clientes

- `GET /api/clientes-top?limit=20` - Mejores clientes

### Dashboard

- `GET /api/dashboard-kpis` - KPIs principales

### Consultas Personalizadas

- `POST /api/consulta-personalizada` - Ejecutar SQL personalizado

## Vistas SQL Incluidas

1. **productos_stock_critico** - Productos con niveles de stock bajo
2. **rentabilidad_categoria** - Análisis de rentabilidad por categoría

## Consultas Predefinidas

El archivo `queries.sql` incluye:

1. Top 50 Productos Más Vendidos
2. Análisis de Ventas Mensuales
3. Proveedores con Mejor Desempeño
4. Clientes VIP (Top Compradores)

## Documentación API

- Swagger UI: `http://localhost:9000/docs`
- ReDoc: `http://localhost:9000/redoc`

## Uso Local

```bash
# Configurar AWS credentials
aws configure --profile default

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python app.py

# O con uvicorn
uvicorn app:app --reload --port 9000
```

## Docker

```bash
# Build
docker build -t analitico-service .

# Run (montar credentials)
docker run -p 9000:9000 \
  -v ~/.aws:/root/.aws:ro \
  -e AWS_PROFILE=default \
  analitico-service
```

## Ejemplos de Uso

```bash
# KPIs del dashboard
curl http://localhost:9000/api/dashboard-kpis

# Productos más vendidos
curl http://localhost:9000/api/productos-mas-vendidos?limit=10

# Rotación de stock
curl http://localhost:9000/api/rotacion-stock

# Ventas por categoría
curl http://localhost:9000/api/ventas-por-categoria

# Rentabilidad de proveedores
curl http://localhost:9000/api/rentabilidad-proveedores
```

## Notas Importantes

- El servicio puede funcionar sin Athena configurado (retorna datos de ejemplo)
- Para producción, configurar correctamente AWS Glue Catalog
- Los resultados de Athena se cachean en S3
- Considerar costos de consultas Athena en producción
