-- Vista: Productos con Stock Crítico
CREATE OR REPLACE VIEW productos_stock_critico AS
SELECT 
    p.id,
    p.nombre,
    p.categoria,
    p.stock,
    p.proveedor,
    p.precio,
    COALESCE(SUM(d.cantidad), 0) as ventas_totales,
    CASE 
        WHEN p.stock = 0 THEN 'SIN_STOCK'
        WHEN p.stock < 20 THEN 'CRITICO'
        WHEN p.stock < 50 THEN 'BAJO'
        ELSE 'NORMAL'
    END as nivel_stock
FROM productos p
LEFT JOIN detalles_orden d ON p.id = d.producto_id
WHERE p.stock < 100
GROUP BY p.id, p.nombre, p.categoria, p.stock, p.proveedor, p.precio;

-- Vista: Análisis de Rentabilidad por Categoría
CREATE OR REPLACE VIEW rentabilidad_categoria AS
SELECT 
    p.categoria,
    COUNT(DISTINCT p.id) as total_productos,
    SUM(p.stock) as stock_total,
    COUNT(DISTINCT d.orden_id) as ordenes_totales,
    SUM(d.cantidad) as unidades_vendidas,
    SUM(d.subtotal) as ingresos_totales,
    AVG(d.precio_unitario) as precio_promedio,
    SUM(d.subtotal) / NULLIF(COUNT(DISTINCT d.orden_id), 0) as ingreso_por_orden
FROM productos p
LEFT JOIN detalles_orden d ON p.id = d.producto_id
GROUP BY p.categoria
ORDER BY ingresos_totales DESC;

-- Consulta 1: Top 50 Productos Más Vendidos
SELECT 
    p.nombre,
    p.categoria,
    p.proveedor,
    SUM(d.cantidad) as cantidad_vendida,
    SUM(d.subtotal) as ingresos_totales,
    COUNT(DISTINCT d.orden_id) as num_ordenes,
    AVG(d.precio_unitario) as precio_promedio
FROM productos p
INNER JOIN detalles_orden d ON p.id = d.producto_id
GROUP BY p.nombre, p.categoria, p.proveedor
ORDER BY cantidad_vendida DESC
LIMIT 50;

-- Consulta 2: Análisis de Ventas Mensuales
SELECT 
    DATE_FORMAT(o.fecha_orden, '%Y-%m') as mes,
    COUNT(DISTINCT o.id) as num_ordenes,
    SUM(o.total) as ingresos_totales,
    AVG(o.total) as ticket_promedio,
    COUNT(DISTINCT o.cliente_id) as clientes_unicos,
    COUNT(DISTINCT d.producto_id) as productos_vendidos
FROM ordenes o
INNER JOIN detalles_orden d ON o.id = d.orden_id
GROUP BY DATE_FORMAT(o.fecha_orden, '%Y-%m')
ORDER BY mes DESC;

-- Consulta 3: Proveedores con Mejor Desempeño
SELECT 
    p.proveedor,
    COUNT(DISTINCT p.id) as productos_ofrecidos,
    SUM(d.cantidad) as unidades_vendidas,
    SUM(d.subtotal) as ingresos_generados,
    AVG(p.precio) as precio_promedio_productos,
    COUNT(DISTINCT d.orden_id) as ordenes_totales
FROM productos p
INNER JOIN detalles_orden d ON p.id = d.producto_id
WHERE p.proveedor IS NOT NULL
GROUP BY p.proveedor
HAVING SUM(d.subtotal) > 100000
ORDER BY ingresos_generados DESC;

-- Consulta 4: Clientes VIP (Top Compradores)
SELECT 
    c.id,
    c.nombre,
    c.email,
    c.ciudad,
    c.pais,
    COUNT(o.id) as total_ordenes,
    SUM(o.total) as gasto_total,
    AVG(o.total) as ticket_promedio,
    MAX(o.fecha_orden) as ultima_compra,
    MIN(o.fecha_orden) as primera_compra,
    DATEDIFF(day, MIN(o.fecha_orden), MAX(o.fecha_orden)) as dias_como_cliente
FROM clientes c
INNER JOIN ordenes o ON c.id = o.cliente_id
GROUP BY c.id, c.nombre, c.email, c.ciudad, c.pais
HAVING COUNT(o.id) > 5
ORDER BY gasto_total DESC
LIMIT 100;
