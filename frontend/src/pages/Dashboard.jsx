import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
        />
        <div className="ml-4 text-lg text-gray-600 dark:text-gray-300">Cargando dashboard...</div>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Sistema de Gestión de Inventarios - Resumen General
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} delay={index * 0.1}>
              <div className="flex items-center">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`p-3 rounded-lg ${stat.color}`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                    className="text-2xl font-semibold text-gray-900 dark:text-white"
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* KPIs Analíticos */}
      {kpis?.kpis && (
        <Card title="Indicadores de Negocio">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ${kpis.kpis.total_ventas?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Promedio</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ${kpis.kpis.ticket_promedio?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Productos Activos</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {kpis.kpis.productos_activos?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Activos</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {kpis.kpis.clientes_activos?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Órdenes Recientes */}
      <Card title="Órdenes Recientes">
        {ordenesRecientes.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <div className="inline-block min-w-full align-middle px-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-gray-400 uppercase">
                      Número Orden
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                      Cliente
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 dark:text-gray-400 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {ordenesRecientes.map((orden, index) => (
                    <motion.tr
                      key={orden.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ backgroundColor: "#f9fafb" }}
                      className="dark:hover:bg-gray-700"
                    >
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {orden.numeroOrden}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap hidden sm:table-cell">
                        {orden.clienteNombre || `Cliente #${orden.clienteId}`}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            orden.estado === "ENTREGADO"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : orden.estado === "PROCESANDO"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : orden.estado === "PENDIENTE"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {orden.estado}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        ${orden.total?.toFixed(2) || "0.00"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-5 h-5 mr-2" />
            No hay órdenes recientes
          </div>
        )}
      </Card>

      {/* Información del Sistema */}
      <Card title="Estado del Sistema" delay={0.6}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {["Servicio de Productos", "Servicio de Órdenes", "Servicio de Proveedores"].map((service, index) => (
            <motion.div
              key={service}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"
              />
              <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{service}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default Dashboard;
