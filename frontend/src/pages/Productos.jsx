import { useEffect, useState } from "react";
import {
  getProductos,
  getCategorias,
  createProducto,
  updateProducto,
  deleteProducto,
  createCategoria,
  buscarProductos,
} from "../services/api";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import ProductoForm from "../components/ProductoForm";
import CategoriaForm from "../components/CategoriaForm";
import Toast from "../components/Toast";
import { Search, Plus, Edit2, Trash2, Package, FolderPlus } from "lucide-react";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showProductoForm, setShowProductoForm] = useState(false);
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProductos();
    loadCategorias();
  }, [page]); // Solo recargar cuando cambia la página

  useEffect(() => {
    // Debounce: esperar 500ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchProductos();
      } else {
        loadProductos(); // Si no hay búsqueda, cargar todos
      }
    }, 500);

    // Limpiar timeout si el usuario sigue escribiendo
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await getProductos(page, 50);
      const data = response.data.productos || response.data;
      setProductos(Array.isArray(data) ? data : []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error cargando productos:", error);
      showToast("error", "Error al cargar productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProductos = async () => {
    try {
      setLoading(true);
      const response = await buscarProductos(searchTerm);
      const data = response.data;
      setProductos(Array.isArray(data) ? data : []);
      setTotalPages(1); // Resultados de búsqueda en una sola página
    } catch (error) {
      console.error("Error buscando productos:", error);
      showToast("error", "Error al buscar productos");
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await getCategorias();
      const data = response.data;
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando categorías:", error);
      setCategorias([]);
    }
  };

  const handleCreateProducto = async (data) => {
    setIsSubmitting(true);
    try {
      await createProducto(data);
      showToast("success", "Producto creado exitosamente");
      setShowProductoForm(false);
      setSearchTerm(""); // Limpiar búsqueda

      // Si no estamos en página 1, ir a página 1 (el useEffect recargará)
      if (page !== 1) {
        setPage(1);
      } else {
        // Si ya estamos en página 1, recargar manualmente
        await loadProductos();
      }
    } catch (error) {
      console.error("Error creando producto:", error);
      showToast("error", "Error al crear producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProducto = async (data) => {
    setIsSubmitting(true);
    try {
      await updateProducto(selectedProducto.id, data);
      showToast("success", "Producto actualizado exitosamente");
      setShowProductoForm(false);
      setSelectedProducto(null);
      loadProductos();
    } catch (error) {
      console.error("Error actualizando producto:", error);
      showToast("error", "Error al actualizar producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProducto = async (id) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return;

    try {
      await deleteProducto(id);
      showToast("success", "Producto eliminado exitosamente");
      loadProductos();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      showToast("error", "Error al eliminar producto");
    }
  };

  const handleCreateCategoria = async (data) => {
    setIsSubmitting(true);
    try {
      await createCategoria(data);
      showToast("success", "Categoría creada exitosamente");
      setShowCategoriaForm(false);
      loadCategorias();
    } catch (error) {
      console.error("Error creando categoría:", error);
      showToast("error", "Error al crear categoría");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (producto) => {
    setSelectedProducto(producto);
    setShowProductoForm(true);
  };

  const handleNewProductClick = () => {
    setSelectedProducto(null);
    setShowProductoForm(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Resetear a página 1 cuando se busca
  };

  // Ya no necesitamos filtro local, la búsqueda se hace en el backend
  const displayProductos = productos;

  const columns = [
    { key: "sku", label: "SKU" },
    { key: "nombre", label: "Producto" },
    { key: "categoria", label: "Categoría" },
    { key: "proveedor", label: "Proveedor" },
    {
      key: "precio",
      label: "Precio",
      render: (row) => `S/ ${row.precio.toFixed(2)}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.stock > 50
              ? "bg-green-100 text-green-800"
              : row.stock > 20
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.stock}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "Acciones",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(row);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Editar"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProducto(row.id);
            }}
            className="text-red-600 hover:text-red-800"
            title="Eliminar"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-200">
            Gestión de inventario de productos
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCategoriaForm(true)} variant="outline">
            <FolderPlus size={20} className="mr-2" />
            Nueva Categoría
          </Button>
          <Button onClick={handleNewProductClick} variant="primary">
            <Plus size={20} className="mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Total Productos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {productos.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Categorías</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {categorias.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Stock Bajo</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {productos.filter((p) => p.stock < 20).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Valor Total</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                S/{" "}
                {productos
                  .reduce((acc, p) => acc + p.precio * p.stock, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 dark:text-slate-400 left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, categoría, SKU o proveedor..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de Productos */}
      <Card title={`Productos (${displayProductos.length})`}>
        <Table columns={columns} data={displayProductos} loading={loading} />

        {/* Paginación - solo mostrar cuando NO hay búsqueda activa */}
        {!searchTerm && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="secondary"
              size="sm"
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Página {page} de {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="secondary"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      {/* Modales */}
      <ProductoForm
        isOpen={showProductoForm}
        onClose={() => {
          setShowProductoForm(false);
          setSelectedProducto(null);
        }}
        onSubmit={
          selectedProducto ? handleUpdateProducto : handleCreateProducto
        }
        producto={selectedProducto}
        isLoading={isSubmitting}
      />

      <CategoriaForm
        isOpen={showCategoriaForm}
        onClose={() => setShowCategoriaForm(false)}
        onSubmit={handleCreateCategoria}
        isLoading={isSubmitting}
      />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Productos;
