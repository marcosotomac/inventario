import { motion } from "framer-motion";

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
}) {
  const baseClasses =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm hover:shadow-md dark:shadow-blue-900/30 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-900",
    secondary:
      "bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-slate-800",
    danger:
      "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white shadow-sm hover:shadow-md dark:shadow-red-900/30 focus:ring-red-500 disabled:bg-red-300 dark:disabled:bg-red-900",
    success:
      "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white shadow-sm hover:shadow-md dark:shadow-green-900/30 focus:ring-green-500 disabled:bg-green-300 dark:disabled:bg-green-900",
    outline:
      "border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:cursor-not-allowed`}
    >
      {children}
    </motion.button>
  );
}
