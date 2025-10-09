package com.inventario.ordenes.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clientes", indexes = {
        @Index(name = "idx_email", columnList = "email"),
        @Index(name = "idx_nombre", columnList = "nombre"),
        @Index(name = "idx_ciudad", columnList = "ciudad"),
        @Index(name = "idx_fecha_registro", columnList = "fecha_registro")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    private String telefono;
    private String direccion;
    private String ciudad;
    private String pais;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL)
    private List<Orden> ordenes = new ArrayList<>();
}
