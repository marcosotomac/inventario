# Documentación de Índices de Base de Datos

Este documento describe todos los índices implementados en el sistema de inventario para mejorar el rendimiento de las búsquedas.

## 📊 Servicio de Órdenes (MySQL - JPA/Hibernate)

### Tabla: `ordenes`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_numero_orden` | `numero_orden` | Búsqueda rápida de órdenes por número único de orden |
| `idx_cliente_id` | `cliente_id` | Búsqueda de todas las órdenes de un cliente específico |
| `idx_estado` | `estado` | Filtrado de órdenes por estado (PENDIENTE, PROCESANDO, etc.) |
| `idx_fecha_orden` | `fecha_orden` | Ordenamiento y filtrado por fecha de creación |
| `idx_cliente_estado` | `cliente_id, estado` | Búsqueda compuesta: órdenes de un cliente con un estado específico |

**Consultas Optimizadas:**
- `findByNumeroOrden(String numeroOrden)`
- `findByCliente_Id(Long clienteId)`
- `findByEstado(String estado)`
- Paginación ordenada por fecha

### Tabla: `clientes`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_email` | `email` | Búsqueda rápida y validación de unicidad de email |
| `idx_nombre` | `nombre` | Búsqueda de clientes por nombre |
| `idx_ciudad` | `ciudad` | Filtrado de clientes por ubicación |
| `idx_fecha_registro` | `fecha_registro` | Análisis de clientes nuevos y ordenamiento temporal |

**Consultas Optimizadas:**
- `findByEmail(String email)`
- Búsquedas por nombre parcial
- Reportes geográficos

### Tabla: `detalles_orden`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_orden_id` | `orden_id` | Obtener todos los detalles de una orden (JOIN) |
| `idx_producto_id` | `producto_id` | Análisis de productos vendidos |
| `idx_orden_producto` | `orden_id, producto_id` | Búsqueda compuesta para validación de duplicados |

**Consultas Optimizadas:**
- JOIN de órdenes con sus detalles
- Reportes de ventas por producto
- Validación de integridad

---

## 📦 Servicio de Productos (MySQL - SQLAlchemy)

### Tabla: `productos`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_producto_nombre` | `nombre` | Búsqueda de productos por nombre (autocompletado, búsqueda parcial) |
| `idx_producto_categoria_id` | `categoria_id` | Filtrado de productos por categoría (JOIN) |
| `idx_producto_sku` | `sku` | Búsqueda única por SKU |
| `idx_producto_proveedor` | `proveedor` | Filtrado de productos por proveedor |
| `idx_producto_fecha_creacion` | `fecha_creacion` | Ordenamiento por productos más recientes |
| `idx_producto_stock` | `stock` | Consultas de inventario bajo, alertas de stock |

**Consultas Optimizadas:**
- Endpoint `/api/productos/buscar?q=nombre` - usa `idx_producto_nombre`
- Filtrado por categoría - usa `idx_producto_categoria_id`
- Paginación ordenada por fecha - usa `idx_producto_fecha_creacion`
- Reportes de stock bajo - usa `idx_producto_stock`

### Tabla: `categorias`

| Índice | Columnas | Propósito |
|--------|----------|-----------|
| `idx_categoria_nombre` | `nombre` | Búsqueda y validación de unicidad de categorías |

**Consultas Optimizadas:**
- Búsqueda por nombre de categoría
- JOIN con productos

---

## 🏢 Servicio de Proveedores (MongoDB - Mongoose)

### Colección: `proveedores`

| Índice | Campo | Tipo | Propósito |
|--------|-------|------|-----------|
| `nombre` | `nombre` | Ascendente (1) | Búsqueda de proveedores por nombre |
| `ruc` | `ruc` | Ascendente (1) | Búsqueda única por RUC (identificador fiscal) |
| `estado` | `estado` | Ascendente (1) | Filtrado por estado (ACTIVO, INACTIVO, SUSPENDIDO) |
| `categorias` | `categorias` | Ascendente (1) | Búsqueda de proveedores por categorías de productos |

**Consultas Optimizadas:**
- Búsqueda por nombre
- Validación de RUC único
- Filtrado por estado activo/inactivo
- Búsqueda por categorías de suministro

---

## 🚀 Mejores Prácticas Implementadas

### 1. **Índices en Claves Foráneas**
- Todos los campos de clave foránea tienen índices (`cliente_id`, `orden_id`, `categoria_id`, `producto_id`)
- Mejora significativa en operaciones JOIN

### 2. **Índices en Campos de Búsqueda Frecuente**
- Campos de texto buscables: `nombre`, `email`, `numero_orden`, `sku`
- Campos de filtrado: `estado`, `ciudad`, `proveedor`, `categorias`

### 3. **Índices Compuestos**
- `idx_cliente_estado` (cliente_id, estado): Optimiza consultas que filtran por cliente Y estado
- `idx_orden_producto` (orden_id, producto_id): Mejora validaciones y reportes

### 4. **Índices en Campos de Ordenamiento**
- `fecha_creacion`, `fecha_orden`, `fecha_registro`
- Mejora el rendimiento de paginación ordenada

### 5. **Índices en Campos de Stock**
- `idx_producto_stock`: Permite consultas rápidas de productos con stock bajo

---

## 📈 Impacto en el Rendimiento

### Antes de Índices
- Búsquedas por nombre: **O(n)** - Escaneo completo de tabla
- JOIN de órdenes-detalles: **O(n*m)** - Productos cartesianos
- Filtrado por estado: **O(n)** - Escaneo completo

### Después de Índices
- Búsquedas por nombre: **O(log n)** - Búsqueda en árbol B+
- JOIN de órdenes-detalles: **O(log n)** - Lookup indexado
- Filtrado por estado: **O(log n + k)** - Donde k es el número de resultados

### Casos de Uso Optimizados
1. ✅ **Dashboard de órdenes**: Filtrado rápido por estado y cliente
2. ✅ **Búsqueda de productos**: Autocompletado instantáneo
3. ✅ **Reportes de ventas**: JOIN eficiente entre órdenes y detalles
4. ✅ **Alertas de inventario**: Consulta rápida de productos con stock bajo
5. ✅ **Validación de duplicados**: Verificación única de email, SKU, RUC

---

## 🔧 Mantenimiento de Índices

### MySQL (Órdenes y Productos)
Los índices se crean automáticamente cuando:
- Se ejecuta la aplicación por primera vez
- Hibernate/JPA detecta cambios en las anotaciones `@Index`
- SQLAlchemy crea/actualiza las tablas con `db.create_all()`

### MongoDB (Proveedores)
Los índices se crean automáticamente cuando:
- Mongoose inicializa el modelo por primera vez
- Se puede forzar con: `Proveedor.ensureIndexes()`

### Verificar Índices Existentes

**MySQL:**
```sql
-- Ver índices de una tabla
SHOW INDEX FROM ordenes;
SHOW INDEX FROM productos;
SHOW INDEX FROM clientes;
```

**MongoDB:**
```javascript
// Ver índices de una colección
db.proveedores.getIndexes()
```

---

## ⚠️ Consideraciones

### Ventajas de los Índices
- ✅ Búsquedas más rápidas
- ✅ Ordenamiento eficiente
- ✅ JOIN optimizados
- ✅ Mejora en la experiencia del usuario

### Desventajas a Considerar
- ⚠️ Espacio adicional en disco (típicamente 10-20% del tamaño de la tabla)
- ⚠️ Inserciones/actualizaciones ligeramente más lentas
- ⚠️ Los índices deben mantenerse actualizados

### Recomendaciones
1. **No sobre-indexar**: Demasiados índices pueden ralentizar escrituras
2. **Monitorear uso**: Revisar qué índices se usan realmente
3. **Índices compuestos**: El orden de columnas importa (más selectivo primero)
4. **Revisar planes de ejecución**: Usar EXPLAIN en MySQL para verificar

---

## 📝 Próximos Pasos

1. **Monitorear rendimiento**: Usar herramientas de profiling de base de datos
2. **Analizar consultas lentas**: Revisar slow query logs
3. **Ajustar según uso real**: Agregar/eliminar índices basado en patrones de uso
4. **Considerar índices adicionales** si aparecen nuevas búsquedas frecuentes

---

**Última actualización**: Octubre 7, 2025
**Versión**: 1.0
