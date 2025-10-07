import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import { getClientes } from "../services/api";

export default function OrdenForm({
  isOpen,
  onClose,
  onSubmit,
  orden = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    cliente_id: "",
    estado: "PENDIENTE",
    total: "",
    fecha_entrega: "",
  });

  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [searchCliente, setSearchCliente] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(false);

  const estadosOrden = [
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "EN_PROCESO", label: "En Proceso" },
    { value: "ENVIADO", label: "Enviado" },
    { value: "ENTREGADO", label: "Entregado" },
    { value: "CANCELADO", label: "Cancelado" },
  ];

  useEffect(() => {
    if (isOpen) {
      loadClientes();
      if (orden) {
        setFormData({
          cliente_id: orden.cliente?.id || "",
          estado: orden.estado || "PENDIENTE",
          total: orden.total || "",
          fecha_entrega: orden.fechaEntrega
            ? orden.fechaEntrega.split("T")[0]
            : "",
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, orden]);

  // Filtrar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchCliente.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
          cliente.email.toLowerCase().includes(searchCliente.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchCliente, clientes]);

  const loadClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await getClientes();
      const clientesData = response.data.content || response.data;
      setClientes(clientesData);
      setFilteredClientes(clientesData);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar que el cliente esté seleccionado
    if (!formData.cliente_id) {
      alert("Por favor selecciona un cliente");
      return;
    }

    const dataToSubmit = {
      clienteId: parseInt(formData.cliente_id),
      estado: formData.estado,
      total: parseFloat(formData.total),
      fechaEntrega: formData.fecha_entrega,
    };

    // Debug: ver qué datos se están enviando
    console.log("Datos a enviar:", dataToSubmit);
    console.log(
      "clienteId tipo:",
      typeof dataToSubmit.clienteId,
      "valor:",
      dataToSubmit.clienteId
    );

    onSubmit(dataToSubmit);
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      estado: "PENDIENTE",
      total: "",
      fecha_entrega: "",
    });
    setSearchCliente("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orden ? "Editar Orden" : "Nueva Orden"}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        {/* Campo de búsqueda de clientes */}
        <Input
          label="Buscar Cliente"
          name="search_cliente"
          type="text"
          value={searchCliente}
          onChange={(e) => setSearchCliente(e.target.value)}
          placeholder="Buscar por nombre o email..."
          disabled={loadingClientes}
        />

        <Select
          label="Cliente"
          name="cliente_id"
          value={formData.cliente_id}
          onChange={handleChange}
          options={[
            {
              value: "",
              label:
                filteredClientes.length > 0
                  ? "Selecciona un cliente"
                  : "No hay clientes disponibles",
            },
            ...filteredClientes.map((cliente) => ({
              value: cliente.id,
              label: `${cliente.nombre} - ${cliente.email}`,
            })),
          ]}
          required
          disabled={loadingClientes}
        />

        {searchCliente && filteredClientes.length === 0 && (
          <p className="text-sm text-gray-500 -mt-3 mb-4">
            No se encontraron clientes con "{searchCliente}"
          </p>
        )}

        <Select
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          options={estadosOrden}
          required
        />

        <Input
          label="Total"
          name="total"
          type="number"
          step="0.01"
          min="0"
          value={formData.total}
          onChange={handleChange}
          placeholder="0.00"
          required
        />

        <Input
          label="Fecha de Entrega"
          name="fecha_entrega"
          type="date"
          value={formData.fecha_entrega}
          onChange={handleChange}
          required
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
            {isLoading ? "Guardando..." : orden ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
