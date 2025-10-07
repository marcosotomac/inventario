package com.inventario.ordenes.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.github.javafaker.Faker;
import com.inventario.ordenes.model.Cliente;
import com.inventario.ordenes.model.DetalleOrden;
import com.inventario.ordenes.model.Orden;
import com.inventario.ordenes.repository.ClienteRepository;
import com.inventario.ordenes.repository.OrdenRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private OrdenRepository ordenRepository;

    private final Faker faker = new Faker(new Locale("es"));
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        if (clienteRepository.count() == 0) {
            System.out.println("Iniciando población de base de datos...");

            // Crear 1000 clientes
            System.out.println("Creando 1000 clientes...");
            List<Cliente> clientes = new ArrayList<>();
            for (int i = 0; i < 1000; i++) {
                Cliente cliente = new Cliente();
                cliente.setNombre(faker.name().fullName());
                cliente.setEmail(faker.internet().emailAddress());
                cliente.setTelefono(faker.phoneNumber().phoneNumber());
                cliente.setDireccion(faker.address().streetAddress());
                cliente.setCiudad(faker.address().city());
                cliente.setPais(faker.address().country());
                cliente.setFechaRegistro(LocalDateTime.now().minusDays(random.nextInt(365)));
                clientes.add(cliente);

                if (i % 100 == 0) {
                    System.out.println("  Clientes creados: " + i);
                }
            }
            clienteRepository.saveAll(clientes);
            System.out.println("✓ 1000 clientes creados");

            // Crear 10000 órdenes
            System.out.println("Creando 10000 órdenes...");
            String[] estados = { "PENDIENTE", "PROCESANDO", "ENVIADO", "ENTREGADO", "CANCELADO" };
            String[] metodosPago = { "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA", "EFECTIVO", "PAYPAL" };

            for (int i = 0; i < 10000; i++) {
                Orden orden = new Orden();
                orden.setNumeroOrden("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                orden.setCliente(clientes.get(random.nextInt(clientes.size())));
                orden.setFechaOrden(LocalDateTime.now().minusDays(random.nextInt(180)));
                orden.setEstado(estados[random.nextInt(estados.length)]);
                orden.setMetodoPago(metodosPago[random.nextInt(metodosPago.length)]);
                orden.setDireccionEnvio(faker.address().fullAddress());

                // Crear 1-5 detalles por orden
                List<DetalleOrden> detalles = new ArrayList<>();
                int numDetalles = random.nextInt(5) + 1;
                double total = 0.0;

                for (int j = 0; j < numDetalles; j++) {
                    DetalleOrden detalle = new DetalleOrden();
                    detalle.setOrden(orden);
                    detalle.setProductoId((long) (random.nextInt(20000) + 1));
                    detalle.setNombreProducto(faker.commerce().productName());
                    detalle.setCantidad(random.nextInt(10) + 1);
                    detalle.setPrecioUnitario(Double.parseDouble(faker.commerce().price(10, 1000)));
                    detalle.calcularSubtotal();
                    total += detalle.getSubtotal();
                    detalles.add(detalle);
                }

                orden.setDetalles(detalles);
                orden.setTotal(total);
                ordenRepository.save(orden);

                if (i % 1000 == 0) {
                    System.out.println("  Órdenes creadas: " + i);
                }
            }
            System.out.println("✓ 10000 órdenes creadas");
            System.out.println("✓ Base de datos poblada exitosamente!");
            System.out.println("  Total clientes: " + clienteRepository.count());
            System.out.println("  Total órdenes: " + ordenRepository.count());
        }
    }
}
