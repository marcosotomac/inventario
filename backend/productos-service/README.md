# Microservicio de Productos

Microservicio para gestión de productos e inventario usando Flask + MySQL.

## Características

- ✅ CRUD completo de productos
- ✅ Gestión de categorías
- ✅ 20,000 registros ficticios con Faker
- ✅ Documentación con Swagger UI
- ✅ Dockerizado

## Modelo de Datos

### Tablas:
1. **categorias**: id, nombre, descripcion
2. **productos**: id, nombre, descripcion, precio, stock, categoria_id (FK), proveedor, sku, fecha_creacion, fecha_actualizacion

### Relación:
- Categoria 1 → N Productos

## Endpoints

- `GET /health` - Health check
- `GET /api/productos` - Listar productos (paginado)
- `GET /api/productos/{id}` - Obtener producto por ID
- `POST /api/productos` - Crear producto
- `PUT /api/productos/{id}` - Actualizar producto
- `DELETE /api/productos/{id}` - Eliminar producto
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría
- `GET /api/productos/buscar?q=texto&categoria=nombre` - Buscar productos

## Documentación API

Swagger UI disponible en: `http://localhost:5001/api/docs`

## Uso Local

```bash
# Instalar dependencias
pip install -r requirements.txt

# Poblar base de datos
python seed_data.py

# Ejecutar servidor
python app.py
```

## Docker

```bash
docker build -t productos-service .
docker run -p 5001:5001 productos-service
```
