import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import TextArea from "./TextArea";
import Button from "./Button";
import { getCategorias } from "../services/api";

export default function ProductoForm({
  isOpen,
  onClose,
  onSubmit,
  producto = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria_id: "",
    proveedor: "",
    sku: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategorias();
      if (producto) {
        setFormData({
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          precio: producto.precio || "",
          stock: producto.stock || "",
          categoria_id: producto.categoria_id || "",
          proveedor: producto.proveedor || "",
          sku: producto.sku || "",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, producto]);

  const loadCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const response = await getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      categoria_id: parseInt(formData.categoria_id),
    };
    onSubmit(dataToSubmit);
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria_id: "",
      proveedor: "",
      sku: "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={producto ? "Editar Producto" : "Nuevo Producto"}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre del producto"
          required
        />

        <TextArea
          label="Descripción"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Descripción del producto"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Precio"
            name="precio"
            type="number"
            step="0.01"
            min="0"
            value={formData.precio}
            onChange={handleChange}
            placeholder="0.00"
            required
          />

          <Input
            label="Stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <Select
          label="Categoría"
          name="categoria_id"
          value={formData.categoria_id}
          onChange={handleChange}
          options={categorias.map((cat) => ({
            value: cat.id,
            label: cat.nombre,
          }))}
          required
          disabled={loadingCategorias}
        />

        <Input
          label="Proveedor"
          name="proveedor"
          value={formData.proveedor}
          onChange={handleChange}
          placeholder="Nombre del proveedor"
        />

        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="SKU único del producto"
        />

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
            {isLoading ? "Guardando..." : producto ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
