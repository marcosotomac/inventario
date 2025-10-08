import { motion } from "framer-motion";

export default function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  rows = 3,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      {label && (
        <motion.label
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
        </motion.label>
      )}
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none ${
          error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
        }`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-1 text-sm text-red-500 dark:text-red-400"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
