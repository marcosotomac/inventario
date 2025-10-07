const mongoose = require("mongoose");

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    ruc: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    direccion: {
      calle: String,
      ciudad: String,
      estado: String,
      pais: String,
      codigoPostal: String,
    },
    contacto: {
      nombre: String,
      cargo: String,
      telefono: String,
      email: String,
    },
    categorias: [
      {
        type: String,
        trim: true,
      },
    ],
    calificacion: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    estado: {
      type: String,
      enum: ["ACTIVO", "INACTIVO", "SUSPENDIDO"],
      default: "ACTIVO",
    },
    estadoEntrega: {
      type: String,
      enum: ["EN_TIEMPO", "RETRASADO", "ADELANTADO", "SIN_ENTREGAS"],
      default: "SIN_ENTREGAS",
    },
    condicionesPago: {
      diasCredito: {
        type: Number,
        default: 0,
      },
      metodoPago: {
        type: String,
        enum: ["CONTADO", "CREDITO", "TRANSFERENCIA", "CHEQUE"],
        default: "CONTADO",
      },
    },
    estadisticas: {
      totalOrdenes: {
        type: Number,
        default: 0,
      },
      ordenesCompletadas: {
        type: Number,
        default: 0,
      },
      ordenesPendientes: {
        type: Number,
        default: 0,
      },
      montoTotal: {
        type: Number,
        default: 0,
      },
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
    ultimaActualizacion: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para mejorar búsquedas
proveedorSchema.index({ nombre: 1 });
proveedorSchema.index({ ruc: 1 });
proveedorSchema.index({ estado: 1 });
proveedorSchema.index({ categorias: 1 });

module.exports = mongoose.model("Proveedor", proveedorSchema);
