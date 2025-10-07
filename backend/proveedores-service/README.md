# Microservicio de Proveedores

Microservicio para gestión de proveedores usando Node.js + MongoDB.

## Características

- ✅ CRUD completo de proveedores
- ✅ Estados de entrega y calificaciones
- ✅ 500 proveedores de prueba
- ✅ Documentación con Swagger
- ✅ Dockerizado

## Modelo de Datos (MongoDB)

```json
{
  "nombre": "String",
  "ruc": "String (único)",
  "email": "String",
  "telefono": "String",
  "direccion": {
    "calle": "String",
    "ciudad": "String",
    "estado": "String",
    "pais": "String",
    "codigoPostal": "String"
  },
  "contacto": {
    "nombre": "String",
    "cargo": "String",
    "telefono": "String",
    "email": "String"
  },
  "categorias": ["String"],
  "calificacion": "Number (0-5)",
  "estado": "String (ACTIVO|INACTIVO|SUSPENDIDO)",
  "estadoEntrega": "String (EN_TIEMPO|RETRASADO|ADELANTADO|SIN_ENTREGAS)",
  "condicionesPago": {
    "diasCredito": "Number",
    "metodoPago": "String"
  },
  "estadisticas": {
    "totalOrdenes": "Number",
    "ordenesCompletadas": "Number",
    "ordenesPendientes": "Number",
    "montoTotal": "Number"
  }
}
```

## Endpoints

- `GET /health` - Health check
- `GET /api/proveedores` - Listar proveedores (paginado)
- `GET /api/proveedores/:id` - Obtener proveedor por ID
- `POST /api/proveedores` - Crear proveedor
- `PUT /api/proveedores/:id` - Actualizar proveedor
- `DELETE /api/proveedores/:id` - Eliminar proveedor
- `GET /api/proveedores/buscar/:termino` - Buscar proveedores
- `GET /api/proveedores/estado/:estado` - Proveedores por estado
- `GET /api/proveedores/entrega/:estadoEntrega` - Proveedores por estado de entrega
- `PATCH /api/proveedores/:id/estadisticas` - Actualizar estadísticas

## Documentación API

Swagger UI disponible en: `http://localhost:3000/api-docs`

## Uso Local

```bash
# Instalar dependencias
npm install

# Poblar base de datos
npm run seed

# Ejecutar servidor
npm start

# Modo desarrollo
npm run dev
```

## Docker

```bash
docker build -t proveedores-service .
docker run -p 3000:3000 proveedores-service
```
