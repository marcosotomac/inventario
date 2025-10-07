# Microservicio de Integración

Microservicio que consolida datos de los otros microservicios usando FastAPI.

## Características

- ✅ Integración con Productos, Órdenes y Proveedores
- ✅ Endpoints consolidados
- ✅ Sin base de datos propia
- ✅ Documentación automática con FastAPI/Swagger
- ✅ Dockerizado

## Endpoints

### Health & Status

- `GET /health` - Health check
- `GET /api/services-status` - Estado de todos los servicios

### Consolidación de Datos

- `GET /api/orden-completa/{orden_id}` - Orden con info de productos y proveedor
- `GET /api/producto-completo/{producto_id}` - Producto con info del proveedor
- `GET /api/dashboard-resumen` - Resumen para dashboard
- `GET /api/ordenes-recientes?limit=10` - Órdenes recientes
- `GET /api/productos-bajo-stock?stock_minimo=50` - Productos con stock bajo
- `GET /api/proveedores-activos` - Proveedores activos

## Variables de Entorno

```bash
PRODUCTOS_SERVICE_URL=http://productos-service:5001
ORDENES_SERVICE_URL=http://ordenes-service:8080
PROVEEDORES_SERVICE_URL=http://proveedores-service:3000
```

## Documentación API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Uso Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python app.py

# O con uvicorn
uvicorn app:app --reload --port 8000
```

## Docker

```bash
docker build -t integracion-service .
docker run -p 8000:8000 integracion-service
```

## Ejemplos de Uso

```bash
# Verificar estado de servicios
curl http://localhost:8000/api/services-status

# Obtener resumen del dashboard
curl http://localhost:8000/api/dashboard-resumen

# Orden completa con detalles
curl http://localhost:8000/api/orden-completa/1

# Producto con información del proveedor
curl http://localhost:8000/api/producto-completo/1

# Productos con stock bajo
curl http://localhost:8000/api/productos-bajo-stock?stock_minimo=20
```
