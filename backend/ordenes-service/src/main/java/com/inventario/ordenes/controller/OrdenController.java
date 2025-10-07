package com.inventario.ordenes.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.inventario.ordenes.model.Cliente;
import com.inventario.ordenes.model.DetalleOrden;
import com.inventario.ordenes.model.Orden;
import com.inventario.ordenes.repository.ClienteRepository;
import com.inventario.ordenes.repository.OrdenRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Órdenes", description = "API de gestión de órdenes")
public class OrdenController {

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "ordenes");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ordenes")
    @Operation(summary = "Obtener todas las órdenes con paginación")
    public ResponseEntity<Map<String, Object>> getAllOrdenes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<Orden> ordenPage = ordenRepository.findAll(
                PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending()));

        Map<String, Object> response = new HashMap<>();
        response.put("ordenes", ordenPage.getContent());
        response.put("currentPage", ordenPage.getNumber());
        response.put("totalItems", ordenPage.getTotalElements());
        response.put("totalPages", ordenPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/ordenes/{id}")
    @Operation(summary = "Obtener orden por ID")
    public ResponseEntity<Orden> getOrdenById(@PathVariable Long id) {
        return ordenRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/ordenes")
    @Operation(summary = "Crear nueva orden")
    public ResponseEntity<Orden> createOrden(@RequestBody Orden orden) {
        Cliente cliente = clienteRepository.findById(orden.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        orden.setCliente(cliente);
        orden.setNumeroOrden("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        orden.setFechaOrden(LocalDateTime.now());

        // Calcular total
        double total = 0.0;
        for (DetalleOrden detalle : orden.getDetalles()) {
            detalle.setOrden(orden);
            detalle.calcularSubtotal();
            total += detalle.getSubtotal();
        }
        orden.setTotal(total);

        Orden savedOrden = ordenRepository.save(orden);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrden);
    }

    @PutMapping("/ordenes/{id}")
    @Operation(summary = "Actualizar orden")
    public ResponseEntity<Orden> updateOrden(@PathVariable Long id, @RequestBody Orden ordenDetails) {
        return ordenRepository.findById(id)
                .map(orden -> {
                    orden.setEstado(ordenDetails.getEstado());
                    orden.setMetodoPago(ordenDetails.getMetodoPago());
                    orden.setDireccionEnvio(ordenDetails.getDireccionEnvio());
                    return ResponseEntity.ok(ordenRepository.save(orden));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/ordenes/{id}")
    @Operation(summary = "Eliminar orden")
    public ResponseEntity<Map<String, String>> deleteOrden(@PathVariable Long id) {
        return ordenRepository.findById(id)
                .map(orden -> {
                    ordenRepository.delete(orden);
                    Map<String, String> response = new HashMap<>();
                    response.put("message", "Orden eliminada");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/clientes")
    @Operation(summary = "Obtener todos los clientes")
    public ResponseEntity<List<Cliente>> getAllClientes() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    @GetMapping("/clientes/{id}")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/clientes")
    @Operation(summary = "Crear nuevo cliente")
    public ResponseEntity<Cliente> createCliente(@RequestBody Cliente cliente) {
        cliente.setFechaRegistro(LocalDateTime.now());
        Cliente savedCliente = clienteRepository.save(cliente);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCliente);
    }

    @GetMapping("/ordenes/cliente/{clienteId}")
    @Operation(summary = "Obtener órdenes por cliente")
    public ResponseEntity<List<Orden>> getOrdenesByCliente(@PathVariable Long clienteId) {
        List<Orden> ordenes = ordenRepository.findByCliente_Id(clienteId);
        return ResponseEntity.ok(ordenes);
    }

    @GetMapping("/ordenes/estado/{estado}")
    @Operation(summary = "Obtener órdenes por estado")
    public ResponseEntity<List<Orden>> getOrdenesByEstado(@PathVariable String estado) {
        List<Orden> ordenes = ordenRepository.findByEstado(estado);
        return ResponseEntity.ok(ordenes);
    }
}
