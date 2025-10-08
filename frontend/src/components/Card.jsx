import { motion } from "framer-motion";

const Card = ({ title, children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-slate-900 rounded-lg shadow-md dark:shadow-slate-950/50 border border-gray-200 dark:border-slate-700 p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">{title}</h3>
      )}
      <div className="text-gray-700 dark:text-slate-300">{children}</div>
    </motion.div>
  );
};

export default Card;
