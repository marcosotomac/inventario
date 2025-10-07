import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import TextArea from "./TextArea";
import Button from "./Button";

export default function ProveedorForm({
  isOpen,
  onClose,
  onSubmit,
  proveedor = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    contacto_nombre: "",
    contacto_cargo: "",
    email: "",
    telefono: "",
    direccion_calle: "",
    ciudad: "",
    pais: "",
    estado: "ACTIVO",
    calificacion: "5",
    categorias: "",
  });

  const estadosProveedor = [
    { value: "ACTIVO", label: "Activo" },
    { value: "INACTIVO", label: "Inactivo" },
    { value: "PENDIENTE", label: "Pendiente" },
  ];

  useEffect(() => {
    if (isOpen) {
      if (proveedor) {
        setFormData({
          nombre: proveedor.nombre || "",
          ruc: proveedor.ruc || "",
          contacto_nombre: proveedor.contacto?.nombre || "",
          contacto_cargo: proveedor.contacto?.cargo || "",
          email: proveedor.contacto?.email || proveedor.email || "",
          telefono: proveedor.contacto?.telefono || proveedor.telefono || "",
          direccion_calle:
            proveedor.direccion?.calle || proveedor.direccion || "",
          ciudad: proveedor.direccion?.ciudad || proveedor.ciudad || "",
          pais: proveedor.direccion?.pais || proveedor.pais || "",
          estado: proveedor.estado || "ACTIVO",
          calificacion: (
            proveedor.calificacion ||
            proveedor.rating ||
            5
          ).toString(),
          categorias: Array.isArray(proveedor.categorias)
            ? proveedor.categorias.join(", ")
            : Array.isArray(proveedor.productos_suministrados)
            ? proveedor.productos_suministrados.join(", ")
            : "",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, proveedor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Transformar a estructura de MongoDB con objetos anidados
    const dataToSubmit = {
      nombre: formData.nombre,
      ruc: formData.ruc,
      contacto: {
        nombre: formData.contacto_nombre,
        cargo: formData.contacto_cargo,
        telefono: formData.telefono,
        email: formData.email,
      },
      direccion: {
        calle: formData.direccion_calle,
        ciudad: formData.ciudad,
        pais: formData.pais,
      },
      estado: formData.estado,
      calificacion: parseFloat(formData.calificacion),
      categorias: formData.categorias
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p),
    };
    onSubmit(dataToSubmit);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      ruc: "",
      contacto_nombre: "",
      contacto_cargo: "",
      email: "",
      telefono: "",
      direccion_calle: "",
      ciudad: "",
      pais: "",
      estado: "ACTIVO",
      calificacion: "5",
      categorias: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={proveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre Empresa"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre de la empresa"
            required
          />

          <Input
            label="RUC"
            name="ruc"
            value={formData.ruc}
            onChange={handleChange}
            placeholder="RUC de la empresa"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre Contacto"
            name="contacto_nombre"
            value={formData.contacto_nombre}
            onChange={handleChange}
            placeholder="Nombre del contacto"
            required
          />

          <Input
            label="Cargo Contacto"
            name="contacto_cargo"
            value={formData.contacto_cargo}
            onChange={handleChange}
            placeholder="Cargo del contacto"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@empresa.com"
            required
          />

          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+51 999 999 999"
            required
          />
        </div>

        <Input
          label="Calle/Dirección"
          name="direccion_calle"
          value={formData.direccion_calle}
          onChange={handleChange}
          placeholder="Dirección completa"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            placeholder="Ciudad"
          />

          <Input
            label="País"
            name="pais"
            value={formData.pais}
            onChange={handleChange}
            placeholder="País"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            options={estadosProveedor}
            required
          />

          <Input
            label="Calificación"
            name="calificacion"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.calificacion}
            onChange={handleChange}
            placeholder="5.0"
          />
        </div>

        <TextArea
          label="Categorías/Productos"
          name="categorias"
          value={formData.categorias}
          onChange={handleChange}
          placeholder="Categoría 1, Categoría 2, Categoría 3..."
          rows={3}
        />
        <p className="text-xs text-gray-500 -mt-3 mb-4">
          Separe las categorías con comas
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Guardando..." : proveedor ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
