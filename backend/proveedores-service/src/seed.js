const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Proveedor = require("./models/Proveedor");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://mongodb:27017/proveedores_db";

const categorias = [
  "Electrónica",
  "Ropa",
  "Alimentos",
  "Bebidas",
  "Hogar",
  "Deportes",
  "Juguetes",
  "Libros",
  "Belleza",
  "Salud",
  "Automotriz",
  "Mascotas",
  "Jardinería",
  "Oficina",
  "Música",
];

const estados = ["ACTIVO", "INACTIVO", "SUSPENDIDO"];
const estadosEntrega = ["EN_TIEMPO", "RETRASADO", "ADELANTADO", "SIN_ENTREGAS"];
const metodosPago = ["CONTADO", "CREDITO", "TRANSFERENCIA", "CHEQUE"];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ Conectado a MongoDB");

    // Limpiar colección
    await Proveedor.deleteMany({});
    console.log("✓ Colección limpiada");

    console.log("Creando 500 proveedores...");
    const proveedores = [];

    for (let i = 0; i < 500; i++) {
      const numCategorias = faker.number.int({ min: 1, max: 4 });
      const categoriasSeleccionadas = [];

      for (let j = 0; j < numCategorias; j++) {
        const categoria =
          categorias[faker.number.int({ min: 0, max: categorias.length - 1 })];
        if (!categoriasSeleccionadas.includes(categoria)) {
          categoriasSeleccionadas.push(categoria);
        }
      }

      const proveedor = {
        nombre: faker.company.name(),
        ruc: faker.string.numeric(11),
        email: faker.internet.email().toLowerCase(),
        telefono: faker.phone.number(),
        direccion: {
          calle: faker.location.streetAddress(),
          ciudad: faker.location.city(),
          estado: faker.location.state(),
          pais: faker.location.country(),
          codigoPostal: faker.location.zipCode(),
        },
        contacto: {
          nombre: faker.person.fullName(),
          cargo: faker.person.jobTitle(),
          telefono: faker.phone.number(),
          email: faker.internet.email().toLowerCase(),
        },
        categorias: categoriasSeleccionadas,
        calificacion: parseFloat(
          faker.number.float({ min: 1, max: 5, precision: 0.1 }).toFixed(1)
        ),
        estado: estados[faker.number.int({ min: 0, max: estados.length - 1 })],
        estadoEntrega:
          estadosEntrega[
            faker.number.int({ min: 0, max: estadosEntrega.length - 1 })
          ],
        condicionesPago: {
          diasCredito: faker.number.int({ min: 0, max: 90 }),
          metodoPago:
            metodosPago[
              faker.number.int({ min: 0, max: metodosPago.length - 1 })
            ],
        },
        estadisticas: {
          totalOrdenes: faker.number.int({ min: 0, max: 1000 }),
          ordenesCompletadas: faker.number.int({ min: 0, max: 800 }),
          ordenesPendientes: faker.number.int({ min: 0, max: 200 }),
          montoTotal: parseFloat(
            faker.number
              .float({ min: 10000, max: 5000000, precision: 0.01 })
              .toFixed(2)
          ),
        },
        fechaRegistro: faker.date.past({ years: 3 }),
      };

      proveedores.push(proveedor);

      if ((i + 1) % 50 === 0) {
        console.log(`  Proveedores creados: ${i + 1}`);
      }
    }

    await Proveedor.insertMany(proveedores);
    console.log("✓ 500 proveedores insertados exitosamente!");

    const total = await Proveedor.countDocuments();
    console.log(`✓ Total de proveedores en la base de datos: ${total}`);

    await mongoose.disconnect();
    console.log("✓ Desconectado de MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error al poblar la base de datos:", error);
    process.exit(1);
  }
}

seedDatabase();
