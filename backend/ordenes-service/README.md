# Microservicio de Órdenes

Microservicio para gestión de órdenes y clientes usando Spring Boot + PostgreSQL.

## Características

- ✅ Gestión completa de órdenes y clientes
- ✅ Relación 1-N entre órdenes y detalles
- ✅ 10,000 órdenes y 1,000 clientes de prueba
- ✅ Documentación con Swagger/OpenAPI
- ✅ Dockerizado

## Modelo de Datos

### Tablas:

1. **clientes**: id, nombre, email, telefono, direccion, ciudad, pais, fecha_registro
2. **ordenes**: id, numero_orden, cliente_id (FK), fecha_orden, estado, total, metodo_pago, direccion_envio
3. **detalles_orden**: id, orden_id (FK), producto_id, nombre_producto, cantidad, precio_unitario, subtotal

### Relaciones:

- Cliente 1 → N Órdenes
- Orden 1 → N DetallesOrden

## Endpoints

- `GET /health` - Health check
- `GET /api/ordenes` - Listar órdenes (paginado)
- `GET /api/ordenes/{id}` - Obtener orden por ID
- `POST /api/ordenes` - Crear orden
- `PUT /api/ordenes/{id}` - Actualizar orden
- `DELETE /api/ordenes/{id}` - Eliminar orden
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/{id}` - Obtener cliente por ID
- `POST /api/clientes` - Crear cliente
- `GET /api/ordenes/cliente/{clienteId}` - Órdenes por cliente
- `GET /api/ordenes/estado/{estado}` - Órdenes por estado

## Documentación API

Swagger UI disponible en: `http://localhost:8080/swagger-ui.html`

## Uso Local

```bash
# Compilar
mvn clean package

# Ejecutar
java -jar target/ordenes-service-1.0.0.jar
```

## Docker

```bash
docker build -t ordenes-service .
docker run -p 8080:8080 ordenes-service
```
