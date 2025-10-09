import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Package, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap, 
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const TypingCarousel = ({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && displayedText === currentText) {
      setIsPaused(true);
      return;
    }

    if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setDisplayedText(currentText.substring(0, displayedText.length - 1));
      } else {
        setDisplayedText(currentText.substring(0, displayedText.length + 1));
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, isPaused, currentTextIndex, texts, speed, deleteSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="inline-block w-0.5 h-[0.9em] bg-current ml-1 align-middle"
      />
    </span>
  );
};

const LandingPage = () => {
  const { isDark } = useTheme();

  const features = [
    {
      icon: Package,
      title: "Gestión de Inventario",
      description: "Control completo de tus productos y stock en tiempo real",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Análisis Inteligente",
      description: "Insights y métricas para optimizar tus operaciones",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Reportes Avanzados",
      description: "Visualiza datos y tendencias con reportes detallados",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Seguro y Confiable",
      description: "Protección de datos con los más altos estándares",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Rápido y Eficiente",
      description: "Rendimiento optimizado para tu negocio",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Colaboración",
      description: "Trabaja en equipo de forma sincronizada",
      gradient: "from-indigo-500 to-purple-500"
    }
  ];

  const benefits = [
    "Reduce costos operativos hasta un 40%",
    "Mejora la precisión del inventario",
    "Automatiza procesos repetitivos",
    "Acceso desde cualquier dispositivo",
    "Soporte técnico 24/7",
    "Actualizaciones constantes"
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50 transition-colors overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700/60 shadow-sm dark:shadow-slate-950/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 dark:shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              InvenTrack
            </span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all"
              >
                Ingresar
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={floatingAnimation}
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 dark:from-blue-500/20 dark:to-indigo-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
            className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/20 dark:from-purple-500/20 dark:to-pink-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
            className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-indigo-200/25 to-blue-200/20 dark:from-indigo-500/15 dark:to-blue-500/10 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/20 rounded-full mb-8 border border-blue-200 dark:border-blue-400/40 shadow-sm dark:shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-100">
                Sistema de Inventario de Nueva Generación
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight min-h-[180px] md:min-h-[240px]">
              <span className="block mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-50 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Gestiona tu inventario
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                <TypingCarousel 
                  texts={[
                    "con inteligencia",
                    "en tiempo real",
                    "sin complicaciones",
                    "de forma eficiente",
                    "con precisión"
                  ]}
                  speed={100}
                  deleteSpeed={50}
                  pauseTime={2000}
                />
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-slate-300 mb-10 leading-relaxed">
              Optimiza tus operaciones, reduce costos y toma decisiones basadas en datos
              con nuestra plataforma integral de gestión de inventario.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg flex items-center gap-2"
                >
                  Comenzar ahora
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white hover:bg-gray-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all text-lg border border-gray-300 dark:border-slate-600"
              >
                Ver demo
              </motion.button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-3xl opacity-20 dark:opacity-20" />
            <div className="relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-2 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-2xl">
              <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm" />
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Productos", value: "1,234", color: "blue" },
                    { label: "Órdenes", value: "567", color: "indigo" },
                    { label: "Proveedores", value: "89", color: "purple" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="bg-white dark:bg-slate-800/90 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-600 hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <div className={`text-sm font-medium text-${stat.color}-600 dark:text-${stat.color}-400 mb-2`}>
                        {stat.label}
                      </div>
                      <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {stat.value}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-50 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Todo lo que necesitas
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300">
              Funcionalidades diseñadas para potenciar tu negocio
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative bg-white dark:bg-slate-800/90 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-slate-700"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-slate-900/70 dark:via-slate-850/50 dark:to-indigo-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-slate-50 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
                Ventajas que marcan la diferencia
              </h2>
              <p className="text-xl text-gray-600 dark:text-slate-300 mb-8">
                Únete a cientos de empresas que ya optimizaron sus operaciones
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 bg-white dark:bg-slate-800/80 p-4 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-slate-300 font-medium">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.div
                animate={floatingAnimation}
                className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 shadow-2xl"
              >
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/30">
                  <div className="text-white space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium opacity-90">Eficiencia</span>
                      <span className="text-2xl font-bold">+40%</span>
                    </div>
                    <div className="h-3 bg-white/25 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "90%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-white rounded-full shadow-sm"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-sm font-medium opacity-90">Precisión</span>
                      <span className="text-2xl font-bold">99.8%</span>
                    </div>
                    <div className="h-3 bg-white/25 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "99%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-white rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
          
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-white drop-shadow-lg" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto drop-shadow">
              Únete hoy y descubre cómo podemos ayudarte a optimizar tu gestión de inventario
            </p>
            
            <Link to="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white hover:bg-blue-50 text-blue-700 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all text-lg inline-flex items-center gap-2 group"
              >
                Comienza gratis
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              InvenTrack
            </span>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            © 2025 InvenTrack. Sistema de Gestión de Inventario Inteligente.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
