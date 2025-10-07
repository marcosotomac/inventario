import axios from "axios";

// URLs base de los servicios
const BASE_URLS = {
  productos: import.meta.env.VITE_PRODUCTOS_URL || "http://localhost:5001",
  ordenes: import.meta.env.VITE_ORDENES_URL || "http://localhost:8080",
  proveedores: import.meta.env.VITE_PROVEEDORES_URL || "http://localhost:3000",
  integracion: import.meta.env.VITE_INTEGRACION_URL || "http://localhost:8000",
  analitico: import.meta.env.VITE_ANALITICO_URL || "http://localhost:9000",
};

// Crear instancias de axios para cada servicio
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // Aumentado a 30 segundos para manejar respuestas grandes
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Interceptor para errores
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("API Error:", error);
      return Promise.reject(error);
    }
  );

  return instance;
};

export const productosAPI = createAxiosInstance(BASE_URLS.productos);
export const ordenesAPI = createAxiosInstance(BASE_URLS.ordenes);
export const proveedoresAPI = createAxiosInstance(BASE_URLS.proveedores);
export const integracionAPI = createAxiosInstance(BASE_URLS.integracion);
export const analiticoAPI = createAxiosInstance(BASE_URLS.analitico);

// ============================================================================
// === PRODUCTOS SERVICE - CRUD COMPLETO ===
// ============================================================================

// GET - Listar productos con paginación
export const getProductos = (page = 1, perPage = 50) =>
  productosAPI.get(`/api/productos?page=${page}&per_page=${perPage}`);

// GET - Obtener un producto por ID
export const getProducto = (id) => productosAPI.get(`/api/productos/${id}`);

// POST - Crear nuevo producto
export const createProducto = (data) =>
  productosAPI.post("/api/productos", data);

// PUT - Actualizar producto existente
export const updateProducto = (id, data) =>
  productosAPI.put(`/api/productos/${id}`, data);

// DELETE - Eliminar producto
export const deleteProducto = (id) =>
  productosAPI.delete(`/api/productos/${id}`);

// GET - Buscar productos
export const buscarProductos = (query, categoria = "") =>
  productosAPI.get(`/api/productos/buscar?q=${query}&categoria=${categoria}`);

// GET - Listar categorías
export const getCategorias = () => productosAPI.get("/api/categorias");

// POST - Crear nueva categoría
export const createCategoria = (data) =>
  productosAPI.post("/api/categorias", data);

// ============================================================================
// === ÓRDENES SERVICE - CRUD COMPLETO ===
// ============================================================================

// GET - Listar órdenes con paginación
export const getOrdenes = (page = 0, size = 50) =>
  ordenesAPI.get(`/api/ordenes?page=${page}&size=${size}`);

// GET - Obtener una orden por ID
export const getOrden = (id) => ordenesAPI.get(`/api/ordenes/${id}`);

// POST - Crear nueva orden
export const createOrden = (data) => ordenesAPI.post("/api/ordenes", data);

// PUT - Actualizar orden existente
export const updateOrden = (id, data) =>
  ordenesAPI.put(`/api/ordenes/${id}`, data);

// DELETE - Eliminar orden
export const deleteOrden = (id) => ordenesAPI.delete(`/api/ordenes/${id}`);

// GET - Listar órdenes por estado
export const getOrdenesByEstado = (estado) =>
  ordenesAPI.get(`/api/ordenes/estado/${estado}`);

// GET - Listar órdenes por cliente
export const getOrdenesByCliente = (clienteId) =>
  ordenesAPI.get(`/api/ordenes/cliente/${clienteId}`);

// GET - Listar clientes
export const getClientes = (page = 0, size = 100) =>
  ordenesAPI.get(`/api/clientes?page=${page}&size=${size}`);

// GET - Obtener un cliente por ID
export const getCliente = (id) => ordenesAPI.get(`/api/clientes/${id}`);

// POST - Crear nuevo cliente
export const createCliente = (data) => ordenesAPI.post("/api/clientes", data);

// PUT - Actualizar cliente existente
export const updateCliente = (id, data) =>
  ordenesAPI.put(`/api/clientes/${id}`, data);

// DELETE - Eliminar cliente
export const deleteCliente = (id) => ordenesAPI.delete(`/api/clientes/${id}`);

// ============================================================================
// === PROVEEDORES SERVICE - CRUD COMPLETO ===
// ============================================================================

// GET - Listar proveedores con paginación
export const getProveedores = (page = 1, limit = 50) =>
  proveedoresAPI.get(`/api/proveedores?page=${page}&limit=${limit}`);

// GET - Obtener un proveedor por ID
export const getProveedor = (id) =>
  proveedoresAPI.get(`/api/proveedores/${id}`);

// POST - Crear nuevo proveedor
export const createProveedor = (data) =>
  proveedoresAPI.post("/api/proveedores", data);

// PUT - Actualizar proveedor existente
export const updateProveedor = (id, data) =>
  proveedoresAPI.put(`/api/proveedores/${id}`, data);

// DELETE - Eliminar proveedor
export const deleteProveedor = (id) =>
  proveedoresAPI.delete(`/api/proveedores/${id}`);

// GET - Listar proveedores por estado
export const getProveedoresByEstado = (estado) =>
  proveedoresAPI.get(`/api/proveedores/estado/${estado}`);

// GET - Buscar proveedores
export const buscarProveedores = (query) =>
  proveedoresAPI.get(`/api/proveedores/buscar?q=${query}`);

// ============================================================================
// === INTEGRACIÓN SERVICE - ENDPOINTS CONSOLIDADOS ===
// ============================================================================

// GET - Estado de servicios
export const getServicesStatus = () =>
  integracionAPI.get("/api/services-status");

// GET - Resumen para dashboard
export const getDashboardResumen = () =>
  integracionAPI.get("/api/dashboard-resumen");

// GET - Orden completa (con detalles de productos y proveedor)
export const getOrdenCompleta = (id) =>
  integracionAPI.get(`/api/orden-completa/${id}`);

// GET - Producto completo (con información de proveedor)
export const getProductoCompleto = (id) =>
  integracionAPI.get(`/api/producto-completo/${id}`);

// GET - Órdenes recientes
export const getOrdenesRecientes = (limit = 10) =>
  integracionAPI.get(`/api/ordenes-recientes?limit=${limit}`);

// GET - Productos con bajo stock
export const getProductosBajoStock = (stockMinimo = 50) =>
  integracionAPI.get(`/api/productos-bajo-stock?stock_minimo=${stockMinimo}`);

// GET - Proveedores activos
export const getProveedoresActivos = () =>
  integracionAPI.get("/api/proveedores-activos");

// ============================================================================
// === ANALÍTICO SERVICE - REPORTES Y ANÁLISIS ===
// ============================================================================
export const getDashboardKPIs = () => analiticoAPI.get("/api/dashboard-kpis");

export const getRotacionStock = () => analiticoAPI.get("/api/rotacion-stock");

export const getProductosMasVendidos = (limit = 20) =>
  analiticoAPI.get(`/api/productos-mas-vendidos?limit=${limit}`);

export const getVentasPorCategoria = () =>
  analiticoAPI.get("/api/ventas-por-categoria");

export const getRentabilidadProveedores = () =>
  analiticoAPI.get("/api/rentabilidad-proveedores");

export const getTendenciasTemporales = () =>
  analiticoAPI.get("/api/tendencias-temporales");

export const getClientesTop = (limit = 20) =>
  analiticoAPI.get(`/api/clientes-top?limit=${limit}`);

export default {
  // Productos
  getProductos,
  getProducto,
  buscarProductos,
  getCategorias,

  // Órdenes
  getOrdenes,
  getOrden,
  getClientes,
  getOrdenesByEstado,

  // Proveedores
  getProveedores,
  getProveedor,
  getProveedoresByEstado,

  // Integración
  getServicesStatus,
  getDashboardResumen,
  getOrdenCompleta,
  getProductoCompleto,
  getOrdenesRecientes,
  getProductosBajoStock,
  getProveedoresActivos,

  // Analítico
  getDashboardKPIs,
  getRotacionStock,
  getProductosMasVendidos,
  getVentasPorCategoria,
  getRentabilidadProveedores,
  getTendenciasTemporales,
  getClientesTop,
};
