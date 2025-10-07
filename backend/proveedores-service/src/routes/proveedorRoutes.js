const express = require("express");
const router = express.Router();
const Proveedor = require("../models/Proveedor");

// Obtener todos los proveedores con paginación
router.get("/proveedores", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const proveedores = await Proveedor.find()
      .skip(skip)
      .limit(limit)
      .sort({ nombre: 1 });

    const total = await Proveedor.countDocuments();

    res.json({
      proveedores,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener proveedor por ID
router.get("/proveedores/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo proveedor
router.post("/proveedores", async (req, res) => {
  try {
    const nuevoProveedor = new Proveedor(req.body);
    const proveedorGuardado = await nuevoProveedor.save();
    res.status(201).json(proveedorGuardado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar proveedor
router.put("/proveedores/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ultimaActualizacion: Date.now() },
      { new: true, runValidators: true }
    );

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar proveedor
router.delete("/proveedores/:id", async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar proveedores
router.get("/proveedores/buscar/:termino", async (req, res) => {
  try {
    const termino = req.params.termino;
    const proveedores = await Proveedor.find({
      $or: [
        { nombre: { $regex: termino, $options: "i" } },
        { ruc: { $regex: termino, $options: "i" } },
        { categorias: { $regex: termino, $options: "i" } },
      ],
    });

    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener proveedores por estado
router.get("/proveedores/estado/:estado", async (req, res) => {
  try {
    const proveedores = await Proveedor.find({
      estado: req.params.estado.toUpperCase(),
    });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener proveedores por estado de entrega
router.get("/proveedores/entrega/:estadoEntrega", async (req, res) => {
  try {
    const proveedores = await Proveedor.find({
      estadoEntrega: req.params.estadoEntrega.toUpperCase().replace("-", "_"),
    });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar estadísticas de proveedor
router.patch("/proveedores/:id/estadisticas", async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(
      req.params.id,
      {
        $inc: {
          "estadisticas.totalOrdenes": req.body.totalOrdenes || 0,
          "estadisticas.ordenesCompletadas": req.body.ordenesCompletadas || 0,
          "estadisticas.ordenesPendientes": req.body.ordenesPendientes || 0,
          "estadisticas.montoTotal": req.body.montoTotal || 0,
        },
        ultimaActualizacion: Date.now(),
      },
      { new: true }
    );

    if (!proveedor) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
