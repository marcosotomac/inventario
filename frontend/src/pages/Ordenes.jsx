import { useEffect, useState } from "react";
import {
  getOrdenes,
  createOrden,
  updateOrden,
  deleteOrden,
  createCliente,
  getClientes,
} from "../services/api";
import Card from "../components/Card";
import Table from "../components/Table";
import Button from "../components/Button";
import OrdenForm from "../components/OrdenForm";
import ClienteForm from "../components/ClienteForm";
import Toast from "../components/Toast";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

const Ordenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [showOrdenForm, setShowOrdenForm] = useState(false);
  const [showClienteForm, setShowClienteForm] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadOrdenes();
    loadClientes();
  }, [page]);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const response = await getOrdenes(page, 50);
      // PostgreSQL retorna { ordenes: [], totalPages, currentPage }
      const data =
        response.data.ordenes || response.data.content || response.data;
      setOrdenes(Array.isArray(data) ? data : []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      showToast("error", "Error al cargar órdenes");
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await getClientes();
      const data = response.data.content || response.data;
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    }
  };

  const handleCreateOrden = async (data) => {
    setIsSubmitting(true);
    try {
      await createOrden(data);
      showToast("success", "Orden creada exitosamente");
      setShowOrdenForm(false);
      loadOrdenes();
    } catch (error) {
      console.error("Error creando orden:", error);
      showToast("error", "Error al crear orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrden = async (data) => {
    setIsSubmitting(true);
    try {
      await updateOrden(selectedOrden.id, data);
      showToast("success", "Orden actualizada exitosamente");
      setShowOrdenForm(false);
      setSelectedOrden(null);
      loadOrdenes();
    } catch (error) {
      console.error("Error actualizando orden:", error);
      showToast("error", "Error al actualizar orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrden = async (id) => {
    if (!confirm("¿Está seguro de eliminar esta orden?")) return;

    try {
      await deleteOrden(id);
      showToast("success", "Orden eliminada exitosamente");
      loadOrdenes();
    } catch (error) {
      console.error("Error eliminando orden:", error);
      showToast("error", "Error al eliminar orden");
    }
  };

  const handleCreateCliente = async (data) => {
    setIsSubmitting(true);
    try {
      await createCliente(data);
      showToast("success", "Cliente creado exitosamente");
      setShowClienteForm(false);
      loadClientes();
    } catch (error) {
      console.error("Error creando cliente:", error);
      showToast("error", "Error al crear cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (orden) => {
    setSelectedOrden(orden);
    setShowOrdenForm(true);
  };

  const handleNewOrdenClick = () => {
    setSelectedOrden(null);
    setShowOrdenForm(true);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  const filteredOrdenes = ordenes.filter(
    (orden) =>
      orden.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado) => {
    const colors = {
      PENDIENTE: "bg-yellow-100 text-yellow-800",
      EN_PROCESO: "bg-blue-100 text-blue-800",
      ENVIADO: "bg-purple-100 text-purple-800",
      ENTREGADO: "bg-green-100 text-green-800",
      CANCELADO: "bg-red-100 text-red-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (row) => `#${row.id}`,
    },
    {
      key: "cliente",
      label: "Cliente",
      render: (row) => row.clienteNombre || "N/A",
    },
    {
      key: "fechaOrden",
      label: "Fecha Orden",
      render: (row) => new Date(row.fechaOrden).toLocaleDateString(),
    },
    {
      key: "fechaEntrega",
      label: "Fecha Entrega",
      render: (row) =>
        row.fechaEntrega
          ? new Date(row.fechaEntrega).toLocaleDateString()
          : "N/A",
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `S/ ${row.total?.toFixed(2) || "0.00"}`,
    },
    {
      key: "estado",
      label: "Estado",
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
            row.estado
          )}`}
        >
          {row.estado?.replace("_", " ")}
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
              handleDeleteOrden(row.id);
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
  const totalVentas = ordenes.reduce(
    (acc, orden) => acc + (orden.total || 0),
    0
  );
  const ordenesPendientes = ordenes.filter(
    (o) => o.estado === "PENDIENTE"
  ).length;
  const ordenesEntregadas = ordenes.filter(
    (o) => o.estado === "ENTREGADO"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Órdenes</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-200">Gestión de órdenes y clientes</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowClienteForm(true)} variant="outline">
            <UserPlus size={20} className="mr-2" />
            Nuevo Cliente
          </Button>
          <Button onClick={handleNewOrdenClick} variant="primary">
            <Plus size={20} className="mr-2" />
            Nueva Orden
          </Button>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {ordenes.length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-amber-400">
                {ordenesPendientes}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">Entregadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">
                {ordenesEntregadas}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-200">
                Ventas Totales
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-emerald-400">
                S/ {totalVentas.toFixed(2)}
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
                placeholder="Buscar órdenes por cliente o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de Órdenes */}
      <Card title={`Órdenes (${filteredOrdenes.length})`}>
        <Table columns={columns} data={filteredOrdenes} loading={loading} />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              variant="secondary"
              size="sm"
            >
              Anterior
            </Button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              variant="secondary"
              size="sm"
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      {/* Modales */}
      <OrdenForm
        isOpen={showOrdenForm}
        onClose={() => {
          setShowOrdenForm(false);
          setSelectedOrden(null);
        }}
        onSubmit={selectedOrden ? handleUpdateOrden : handleCreateOrden}
        orden={selectedOrden}
        isLoading={isSubmitting}
      />

      <ClienteForm
        isOpen={showClienteForm}
        onClose={() => setShowClienteForm(false)}
        onSubmit={handleCreateCliente}
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

export default Ordenes;
