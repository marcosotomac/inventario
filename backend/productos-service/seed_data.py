from app import app, db, Categoria, Producto
from faker import Faker
import random

fake = Faker('es_ES')


def seed_database():
    """Insertar 20,000 productos ficticios"""
    with app.app_context():
        # Crear tablas
        db.create_all()

        print("Creando categorías...")
        categorias_nombres = [
            'Electrónica', 'Ropa', 'Alimentos', 'Bebidas', 'Hogar',
            'Deportes', 'Juguetes', 'Libros', 'Belleza', 'Salud',
            'Automotriz', 'Mascotas', 'Jardinería', 'Oficina', 'Música'
        ]

        categorias = []
        for nombre in categorias_nombres:
            categoria = Categoria(
                nombre=nombre,
                descripcion=fake.text(max_nb_chars=100)
            )
            db.session.add(categoria)
            categorias.append(categoria)

        db.session.commit()
        print(f"✓ {len(categorias)} categorías creadas")

        print("Insertando 20,000 productos...")
        batch_size = 1000

        for i in range(0, 20000, batch_size):
            productos_batch = []

            for j in range(batch_size):
                producto = Producto(
                    nombre=fake.catch_phrase(),
                    descripcion=fake.text(max_nb_chars=200),
                    precio=round(random.uniform(10.0, 5000.0), 2),
                    stock=random.randint(0, 500),
                    categoria_id=random.choice(categorias).id,
                    proveedor=fake.company(),
                    sku=f"SKU-{i+j+1:06d}"
                )
                productos_batch.append(producto)

            db.session.bulk_save_objects(productos_batch)
            db.session.commit()

            print(f"  ✓ Insertados {i + batch_size} productos")

        print("✓ Base de datos poblada exitosamente!")
        print(f"  Total productos: {Producto.query.count()}")
        print(f"  Total categorías: {Categoria.query.count()}")


if __name__ == '__main__':
    seed_database()
