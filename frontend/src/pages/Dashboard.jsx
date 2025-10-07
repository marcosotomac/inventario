import { useEffect, useState } from "react";
import {
  getDashboardResumen,
  getOrdenesRecientes,
  getDashboardKPIs,
} from "../services/api";
import Card from "../components/Card";
import {
  Package,
  ShoppingCart,
  Truck,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [kpis, setKPIs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos del servicio de integración
      const resumenResponse = await getDashboardResumen();
      setResumen(resumenResponse.data);

      // Cargar órdenes recientes
      const ordenesResponse = await getOrdenesRecientes(5);
      setOrdenesRecientes(ordenesResponse.data?.ordenes || []);

      // Cargar KPIs del servicio analítico
      try {
        const kpisResponse = await getDashboardKPIs();
        setKPIs(kpisResponse.data);
      } catch (error) {
        console.warn("KPIs no disponibles:", error);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      name: "Total Productos",
      value: resumen?.total_productos?.toLocaleString() || "0",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Total Órdenes",
      value: resumen?.total_ordenes?.toLocaleString() || "0",
      icon: ShoppingCart,
      color: "bg-green-500",
    },
    {
      name: "Proveedores",
      value: resumen?.total_proveedores?.toLocaleString() || "0",
      icon: Truck,
      color: "bg-purple-500",
    },
    {
      name: "Categorías",
      value: resumen?.total_categorias?.toLocaleString() || "0",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sistema de Gestión de Inventarios - Resumen General
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPIs Analíticos */}
      {kpis?.kpis && (
        <Card title="Indicadores de Negocio">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <p className="text-xl font-bold text-gray-900">
                ${kpis.kpis.total_ventas?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ticket Promedio</p>
              <p className="text-xl font-bold text-gray-900">
                ${kpis.kpis.ticket_promedio?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos Activos</p>
              <p className="text-xl font-bold text-gray-900">
                {kpis.kpis.productos_activos?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes Activos</p>
              <p className="text-xl font-bold text-gray-900">
                {kpis.kpis.clientes_activos?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Órdenes Recientes */}
      <Card title="Órdenes Recientes">
        {ordenesRecientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Número Orden
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordenesRecientes.map((orden) => (
                  <tr key={orden.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {orden.numeroOrden}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {orden.clienteNombre || `Cliente #${orden.clienteId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          orden.estado === "ENTREGADO"
                            ? "bg-green-100 text-green-800"
                            : orden.estado === "PROCESANDO"
                            ? "bg-blue-100 text-blue-800"
                            : orden.estado === "PENDIENTE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      ${orden.total?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            No hay órdenes recientes
          </div>
        )}
      </Card>

      {/* Información del Sistema */}
      <Card title="Estado del Sistema">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-600">
              Servicio de Productos
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-600">
              Servicio de Órdenes
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="ml-2 text-sm text-gray-600">
              Servicio de Proveedores
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
