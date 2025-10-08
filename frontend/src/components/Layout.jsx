import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Layout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Productos", href: "/productos", icon: Package },
    { name: "Órdenes", href: "/ordenes", icon: ShoppingCart },
    { name: "Proveedores", href: "/proveedores", icon: Truck },
    { name: "Reportes", href: "/reportes", icon: BarChart3 },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm dark:shadow-slate-900/50">
        <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">Sistema Inventario</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-700 dark:text-slate-300" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700 dark:text-slate-300" />
          )}
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 dark:bg-slate-950 shadow-xl z-50 lg:z-30 border-r border-slate-800 dark:border-slate-800 transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between px-4 h-16 bg-slate-800 dark:bg-slate-900 border-b border-slate-700"
          >
            <h1 className="text-xl font-bold text-white">Sistema Inventario</h1>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index + 0.4 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive(item.href)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "text-slate-300 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                    </motion.div>
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 border-t border-slate-700 dark:border-slate-800"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Tema</span>
              <ThemeToggle />
            </div>
            <p className="text-xs text-slate-400">CS2032 Cloud Computing</p>
            <p className="mt-1 text-xs text-slate-400">Ciclo 2025-2</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-14 lg:pt-0">
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Layout;
