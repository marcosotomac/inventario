import { useEffect, useState } from "react";
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../services/api";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import ProveedorForm from "../components/ProveedorForm";
import Toast from "../components/Toast";
import { Search, Plus, Edit2, Trash2, Truck, Star } from "lucide-react";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showProveedorForm, setShowProveedorForm] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProveedores();
  }, [page]);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const response = await getProveedores(page, 50);
      const data = response.data.proveedores || response.data;
      setProveedores(Array.isArray(data) ? data : []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      showToast("error", "Error al cargar proveedores");
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProveedor = async (data) => {
    setIsSubmitting(true);
    try {
      await createProveedor(data);
      showToast("success", "Proveedor creado exitosamente");
      setShowProveedorForm(false);
      loadProveedores();
    } catch (error) {
      console.error("Error creando proveedor:", error);
      showToast("error", "Error al crear proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProveedor = async (data) => {
    setIsSubmitting(true);
    try {
      await updateProveedor(
        selectedProveedor._id || selectedProveedor.id,
        data
      );
      showToast("success", "Proveedor actualizado exitosamente");
      setShowProveedorForm(false);
      setSelectedProveedor(null);
      loadProveedores();
    } catch (error) {
      console.error("Error actualizando proveedor:", error);
      showToast("error", "Error al actualizar proveedor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProveedor = async (id) => {
    if (!confirm("¿Está seguro de eliminar este proveedor?")) return;

    try {
      await deleteProveedor(id);
      showToast("success", "Proveedor eliminado exitosamente");
      loadProveedores();
    } catch (error) {
      console.error("Error eliminando proveedor:", error);
      showToast("error", "Error al eliminar proveedor");
    }
  };

  const handleEditClick = (proveedor) => {
    setSelectedProveedor(proveedor);
    setShowProveedorForm(true);
  };

  const handleNewProveedorClick = () => {
    setSelectedProveedor(null);
    setShowProveedorForm(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const filteredProveedores = proveedores.filter((proveedor) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      proveedor.nombre?.toLowerCase().includes(searchLower) ||
      proveedor.direccion?.ciudad?.toLowerCase().includes(searchLower) ||
      proveedor.ciudad?.toLowerCase().includes(searchLower) ||
      proveedor.direccion?.pais?.toLowerCase().includes(searchLower) ||
      proveedor.pais?.toLowerCase().includes(searchLower) ||
      proveedor.contacto?.nombre?.toLowerCase().includes(searchLower) ||
      proveedor.ruc?.toLowerCase().includes(searchLower)
    );
  });

  const getEstadoColor = (estado) => {
    const colors = {
      activo: "bg-green-100 text-green-800",
      inactivo: "bg-red-100 text-red-800",
      pendiente: "bg-yellow-100 text-yellow-800",
    };
    return colors[estado?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "nombre",
      label: "Empresa",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.nombre}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-300">
            {row.contacto?.nombre || row.ruc || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Contacto",
      render: (row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {row.contacto?.email || row.email || "N/A"}
          </div>
          <div className="text-sm text-gray-500 dark:text-slate-300">
            {row.contacto?.telefono || row.telefono || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "ubicacion",
      label: "Ubicación",
      render: (row) => {
        const ciudad = row.direccion?.ciudad || row.ciudad;
        const pais = row.direccion?.pais || row.pais;
        return (
          <div className="text-sm text-gray-900 dark:text-white">
            {ciudad && pais ? `${ciudad}, ${pais}` : ciudad || pais || "N/A"}
          </div>
        );
      },
    },
    {
      key: "rating",
      label: "Rating",
      render: (row) => {
        const rating = row.calificacion || row.rating;
        return (
          <div className="flex items-center gap-1">
            <Star
              size={16}
              className="text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400"
            />
            <span className="text-sm font-medium dark:text-white">
              {rating ? rating.toFixed(1) : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "categorias",
      label: "Categorías",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-slate-200">
          {Array.isArray(row.categorias)
            ? row.categorias.length
            : Array.isArray(row.productos_suministrados)
            ? row.productos_suministrados.length
            : 0}{" "}
          items
        </span>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => {
        const estado = row.estado || "ACTIVO";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
              estado
            )}`}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase()}
          </span>
        );
      },
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
              handleDeleteProveedor(row._id || row.id);
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

  // Estadísticas
  const proveedoresActivos = proveedores.filter(
    (p) => p.estado?.toUpperCase() === "ACTIVO"
  ).length;
  const proveedoresInactivos = proveedores.filter(
    (p) => p.estado?.toUpperCase() === "INACTIVO"
  ).length;
  const ratingPromedio =
    proveedores.length > 0
      ? (
          proveedores.reduce(
            (acc, p) => acc + (p.calificacion || p.rating || 0),
            0
          ) / proveedores.length
        ).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Proveedores
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-200">
            Gestión de proveedores y suministros
          </p>
        </div>
        <Button onClick={handleNewProveedorClick} variant="primary">
          <Plus size={20} className="mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Total Proveedores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {proveedores.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Activos
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">
                {proveedoresActivos}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Inactivos
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {proveedoresInactivos}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Rating Promedio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ratingPromedio}
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
                placeholder="Buscar proveedores por nombre, ciudad o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de Proveedores */}
      <Card title={`Proveedores (${filteredProveedores.length})`}>
        <Table columns={columns} data={filteredProveedores} loading={loading} />

        {/* Paginación */}
        {totalPages > 1 && (
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
      <ProveedorForm
        isOpen={showProveedorForm}
        onClose={() => {
          setShowProveedorForm(false);
          setSelectedProveedor(null);
        }}
        onSubmit={
          selectedProveedor ? handleUpdateProveedor : handleCreateProveedor
        }
        proveedor={selectedProveedor}
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

export default Proveedores;
