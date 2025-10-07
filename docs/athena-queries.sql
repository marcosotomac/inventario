-- ============================================
-- CONSULTAS ATHENA PARA SISTEMA DE INVENTARIOS
-- ============================================

-- CONSULTA 1: Top 50 Productos Más Vendidos
-- Análisis de productos con mayores ventas totales
SELECT 
    p.nombre,
    p.categoria,
    p.proveedor,
    SUM(CAST(d.cantidad AS INTEGER)) as cantidad_vendida,
    SUM(CAST(d.subtotal AS DOUBLE)) as ingresos_totales,
    COUNT(DISTINCT d.orden_id) as num_ordenes,
    AVG(CAST(d.precio_unitario AS DOUBLE)) as precio_promedio
FROM productos p
INNER JOIN detalles_orden d ON CAST(p.id AS VARCHAR) = CAST(d.producto_id AS VARCHAR)
GROUP BY p.nombre, p.categoria, p.proveedor
ORDER BY cantidad_vendida DESC
LIMIT 50;

-- CONSULTA 2: Análisis de Ventas Mensuales
-- Tendencia de ventas agrupadas por mes
SELECT 
    DATE_FORMAT(FROM_ISO8601_TIMESTAMP(o.fecha_orden), '%Y-%m') as mes,
    COUNT(DISTINCT o.id) as num_ordenes,
    SUM(CAST(o.total AS DOUBLE)) as ingresos_totales,
    AVG(CAST(o.total AS DOUBLE)) as ticket_promedio,
    COUNT(DISTINCT o.cliente_id) as clientes_unicos
FROM ordenes o
GROUP BY DATE_FORMAT(FROM_ISO8601_TIMESTAMP(o.fecha_orden), '%Y-%m')
ORDER BY mes DESC;

-- CONSULTA 3: Proveedores con Mejor Desempeño
-- Top proveedores por ingresos generados
SELECT 
    p.proveedor,
    COUNT(DISTINCT p.id) as productos_ofrecidos,
    SUM(CAST(d.cantidad AS INTEGER)) as unidades_vendidas,
    SUM(CAST(d.subtotal AS DOUBLE)) as ingresos_generados,
    AVG(CAST(p.precio AS DOUBLE)) as precio_promedio_productos,
    COUNT(DISTINCT d.orden_id) as ordenes_totales
FROM productos p
INNER JOIN detalles_orden d ON CAST(p.id AS VARCHAR) = CAST(d.producto_id AS VARCHAR)
WHERE p.proveedor IS NOT NULL AND p.proveedor != ''
GROUP BY p.proveedor
HAVING SUM(CAST(d.subtotal AS DOUBLE)) > 100000
ORDER BY ingresos_generados DESC;

-- CONSULTA 4: Clientes VIP (Top Compradores)
-- Mejores clientes por gasto total y frecuencia
SELECT 
    c.id,
    c.nombre,
    c.email,
    c.ciudad,
    c.pais,
    COUNT(o.id) as total_ordenes,
    SUM(CAST(o.total AS DOUBLE)) as gasto_total,
    AVG(CAST(o.total AS DOUBLE)) as ticket_promedio,
    MAX(o.fecha_orden) as ultima_compra,
    MIN(o.fecha_orden) as primera_compra
FROM clientes c
INNER JOIN ordenes o ON CAST(c.id AS VARCHAR) = CAST(o.cliente_id AS VARCHAR)
GROUP BY c.id, c.nombre, c.email, c.ciudad, c.pais
HAVING COUNT(o.id) > 5
ORDER BY gasto_total DESC
LIMIT 100;

-- ============================================
-- VISTAS ATHENA
-- ============================================

-- VISTA 1: Productos con Stock Crítico
-- Vista de productos que requieren reabastecimiento
CREATE OR REPLACE VIEW productos_stock_critico AS
SELECT 
    p.id,
    p.nombre,
    p.categoria,
    CAST(p.stock AS INTEGER) as stock,
    p.proveedor,
    CAST(p.precio AS DOUBLE) as precio,
    CASE 
        WHEN CAST(p.stock AS INTEGER) = 0 THEN 'SIN_STOCK'
        WHEN CAST(p.stock AS INTEGER) < 20 THEN 'CRITICO'
        WHEN CAST(p.stock AS INTEGER) < 50 THEN 'BAJO'
        ELSE 'NORMAL'
    END as nivel_stock
FROM productos p
WHERE CAST(p.stock AS INTEGER) < 100
ORDER BY stock ASC;

-- VISTA 2: Análisis de Rentabilidad por Categoría
-- Métricas de rendimiento por categoría de producto
CREATE OR REPLACE VIEW rentabilidad_categoria AS
SELECT 
    p.categoria,
    COUNT(DISTINCT p.id) as total_productos,
    SUM(CAST(p.stock AS INTEGER)) as stock_total,
    COUNT(DISTINCT d.orden_id) as ordenes_totales,
    SUM(CAST(d.cantidad AS INTEGER)) as unidades_vendidas,
    SUM(CAST(d.subtotal AS DOUBLE)) as ingresos_totales,
    AVG(CAST(d.precio_unitario AS DOUBLE)) as precio_promedio,
    SUM(CAST(d.subtotal AS DOUBLE)) / NULLIF(COUNT(DISTINCT d.orden_id), 0) as ingreso_por_orden
FROM productos p
LEFT JOIN detalles_orden d ON CAST(p.id AS VARCHAR) = CAST(d.producto_id AS VARCHAR)
GROUP BY p.categoria
ORDER BY ingresos_totales DESC;

-- ============================================
-- CONSULTAS ADICIONALES ÚTILES
-- ============================================

-- Inventario Total por Categoría
SELECT 
    categoria,
    COUNT(*) as num_productos,
    SUM(CAST(stock AS INTEGER)) as stock_total,
    AVG(CAST(precio AS DOUBLE)) as precio_promedio,
    SUM(CAST(stock AS INTEGER) * CAST(precio AS DOUBLE)) as valor_inventario
FROM productos
GROUP BY categoria
ORDER BY valor_inventario DESC;

-- Estados de Órdenes
SELECT 
    estado,
    COUNT(*) as num_ordenes,
    SUM(CAST(total AS DOUBLE)) as monto_total,
    AVG(CAST(total AS DOUBLE)) as ticket_promedio
FROM ordenes
GROUP BY estado
ORDER BY num_ordenes DESC;

-- Métodos de Pago Más Usados
SELECT 
    metodo_pago,
    COUNT(*) as num_ordenes,
    SUM(CAST(total AS DOUBLE)) as monto_total,
    AVG(CAST(total AS DOUBLE)) as ticket_promedio
FROM ordenes
WHERE metodo_pago IS NOT NULL
GROUP BY metodo_pago
ORDER BY num_ordenes DESC;

-- Proveedores Activos con Mejores Calificaciones
SELECT 
    nombre,
    CAST(calificacion AS DOUBLE) as calificacion,
    estado,
    estado_entrega,
    CAST(estadisticas_total_ordenes AS INTEGER) as total_ordenes,
    CAST(estadisticas_monto_total AS DOUBLE) as monto_total,
    categorias
FROM proveedores
WHERE estado = 'ACTIVO'
ORDER BY calificacion DESC, total_ordenes DESC
LIMIT 20;

-- Distribución de Clientes por País
SELECT 
    pais,
    COUNT(*) as num_clientes,
    COUNT(DISTINCT o.id) as total_ordenes,
    SUM(CAST(o.total AS DOUBLE)) as gasto_total
FROM clientes c
LEFT JOIN ordenes o ON CAST(c.id AS VARCHAR) = CAST(o.cliente_id AS VARCHAR)
WHERE pais IS NOT NULL AND pais != ''
GROUP BY pais
ORDER BY num_clientes DESC;

-- ============================================
-- OPTIMIZACIÓN Y MANTENIMIENTO
-- ============================================

-- Verificar tamaño de tablas
SELECT 
    table_name,
    COUNT(*) as row_count
FROM information_schema.columns
WHERE table_schema = 'inventario_db'
GROUP BY table_name;

-- Particiones (si se implementan)
-- MSCK REPAIR TABLE productos;
-- MSCK REPAIR TABLE ordenes;
