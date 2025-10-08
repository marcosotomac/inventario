import { useEffect, useState } from "react";
import {
  getVentasPorCategoria,
  getProductosMasVendidos,
  getRentabilidadProveedores,
} from "../services/api";
import Card from "../components/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Package, DollarSign } from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const Reportes = () => {
  const [ventasCategoria, setVentasCategoria] = useState([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [rentabilidadProveedores, setRentabilidadProveedores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportes();
  }, []);

  const loadReportes = async () => {
    try {
      setLoading(true);

      // Cargar ventas por categoría
      try {
        const ventasResponse = await getVentasPorCategoria();
        if (ventasResponse.data?.data) {
          setVentasCategoria(ventasResponse.data.data.slice(0, 10));
        }
      } catch (error) {
        console.warn("Ventas por categoría no disponibles:", error);
      }

      // Cargar productos más vendidos
      try {
        const productosResponse = await getProductosMasVendidos(10);
        if (productosResponse.data?.data) {
          setProductosMasVendidos(productosResponse.data.data);
        }
      } catch (error) {
        console.warn("Productos más vendidos no disponibles:", error);
      }

      // Cargar rentabilidad por proveedores
      try {
        const proveedoresResponse = await getRentabilidadProveedores();
        if (proveedoresResponse.data?.data) {
          setRentabilidadProveedores(
            proveedoresResponse.data.data.slice(0, 10)
          );
        }
      } catch (error) {
        console.warn("Rentabilidad proveedores no disponible:", error);
      }
    } catch (error) {
      console.error("Error cargando reportes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-slate-200">Cargando reportes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reportes Analíticos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-slate-200">
          Análisis de ventas, inventario y rentabilidad
        </p>
      </div>

      {/* Ventas por Categoría */}
      <Card title="Ventas por Categoría">
        {ventasCategoria.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={ventasCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="ingresos_totales"
                fill="#0284c7"
                name="Ingresos Totales"
              />
              <Bar
                dataKey="unidades_vendidas"
                fill="#10b981"
                name="Unidades Vendidas"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-200">
            <Package className="w-5 h-5 mr-2" />
            Datos no disponibles (Athena no configurado)
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Productos Más Vendidos */}
        <Card title="Top 10 Productos Más Vendidos">
          {productosMasVendidos.length > 0 ? (
            <div className="space-y-3">
              {productosMasVendidos.map((producto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 text-white rounded-full bg-primary-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {producto.producto}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-300">
                        {producto.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {producto.cantidad_vendida} unidades
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-300">
                      $
                      {parseFloat(
                        producto.ingresos_totales || 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-200">
              <TrendingUp className="w-5 h-5 mr-2" />
              Datos no disponibles
            </div>
          )}
        </Card>

        {/* Rentabilidad por Proveedor */}
        <Card title="Top 10 Proveedores por Ingresos">
          {rentabilidadProveedores.length > 0 ? (
            <div className="space-y-3">
              {rentabilidadProveedores.map((proveedor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-green-600 rounded-full">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {proveedor.proveedor}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-300">
                        {proveedor.productos_ofrecidos} productos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      $
                      {parseFloat(
                        proveedor.ingresos_totales || 0
                      ).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-300">
                      {proveedor.ordenes_totales} órdenes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-slate-200">
              <DollarSign className="w-5 h-5 mr-2" />
              Datos no disponibles
            </div>
          )}
        </Card>
      </div>

      {/* Información */}
      <Card>
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300">
            📊 Nota sobre Reportes Analíticos
          </h4>
          <p className="mt-2 text-sm text-blue-700 dark:text-blue-200">
            Los reportes analíticos se generan mediante consultas a AWS Athena.
            Para visualizar datos reales, asegúrate de tener configurado:
          </p>
          <ul className="mt-2 ml-5 text-sm text-blue-700 list-disc">
            <li>AWS credentials en ~/.aws/credentials</li>
            <li>Catálogo AWS Glue con las tablas de datos</li>
            <li>Bucket S3 para almacenar resultados de Athena</li>
            <li>Sistema de ingesta ejecutándose para poblar el Data Lake</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Reportes;
