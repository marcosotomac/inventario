const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const proveedorRoutes = require("./routes/proveedorRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongodb:27017/proveedores_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✓ Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Swagger Documentation
const swaggerDocument = YAML.load("./src/swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "proveedores" });
});

app.use("/api", proveedorRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servicio de Proveedores escuchando en puerto ${PORT}`);
  console.log(
    `📚 Documentación disponible en http://localhost:${PORT}/api-docs`
  );
});

module.exports = app;
