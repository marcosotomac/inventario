from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Configuración de base de datos MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'mysql+pymysql://root:password@mysql:3306/productos_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelos


class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text)
    productos = db.relationship('Producto', backref='categoria', lazy=True)


class Producto(db.Model):
    __tablename__ = 'productos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    categoria_id = db.Column(db.Integer, db.ForeignKey(
        'categorias.id'), nullable=False)
    proveedor = db.Column(db.String(200))
    sku = db.Column(db.String(50), unique=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Swagger UI
SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "Productos Service API"}
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Endpoints


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'productos'}), 200


@app.route('/api/productos', methods=['GET'])
def get_productos():
    """Obtener todos los productos con paginación"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    # Ordenar por fecha de creación descendente (más recientes primero)
    productos = Producto.query.order_by(Producto.fecha_creacion.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'productos': [{
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': p.precio,
            'stock': p.stock,
            'categoria': p.categoria.nombre,
            'proveedor': p.proveedor,
            'sku': p.sku,
            'fecha_creacion': p.fecha_creacion.isoformat(),
            'fecha_actualizacion': p.fecha_actualizacion.isoformat()
        } for p in productos.items],
        'total': productos.total,
        'pages': productos.pages,
        'current_page': productos.page
    }), 200


@app.route('/api/productos/<int:id>', methods=['GET'])
def get_producto(id):
    """Obtener un producto por ID"""
    producto = Producto.query.get_or_404(id)
    return jsonify({
        'id': producto.id,
        'nombre': producto.nombre,
        'descripcion': producto.descripcion,
        'precio': producto.precio,
        'stock': producto.stock,
        'categoria': producto.categoria.nombre,
        'proveedor': producto.proveedor,
        'sku': producto.sku,
        'fecha_creacion': producto.fecha_creacion.isoformat(),
        'fecha_actualizacion': producto.fecha_actualizacion.isoformat()
    }), 200


@app.route('/api/productos', methods=['POST'])
def create_producto():
    """Crear un nuevo producto"""
    data = request.get_json()

    nuevo_producto = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        precio=data['precio'],
        stock=data.get('stock', 0),
        categoria_id=data['categoria_id'],
        proveedor=data.get('proveedor'),
        sku=data.get('sku')
    )

    db.session.add(nuevo_producto)
    db.session.commit()

    return jsonify({'message': 'Producto creado', 'id': nuevo_producto.id}), 201


@app.route('/api/productos/<int:id>', methods=['PUT'])
def update_producto(id):
    """Actualizar un producto existente"""
    producto = Producto.query.get_or_404(id)
    data = request.get_json()

    producto.nombre = data.get('nombre', producto.nombre)
    producto.descripcion = data.get('descripcion', producto.descripcion)
    producto.precio = data.get('precio', producto.precio)
    producto.stock = data.get('stock', producto.stock)
    producto.categoria_id = data.get('categoria_id', producto.categoria_id)
    producto.proveedor = data.get('proveedor', producto.proveedor)
    producto.sku = data.get('sku', producto.sku)

    db.session.commit()

    return jsonify({'message': 'Producto actualizado'}), 200


@app.route('/api/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    """Eliminar un producto"""
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()

    return jsonify({'message': 'Producto eliminado'}), 200


@app.route('/api/categorias', methods=['GET'])
def get_categorias():
    """Obtener todas las categorías"""
    categorias = Categoria.query.all()
    return jsonify([{
        'id': c.id,
        'nombre': c.nombre,
        'descripcion': c.descripcion
    } for c in categorias]), 200


@app.route('/api/categorias', methods=['POST'])
def create_categoria():
    """Crear una nueva categoría"""
    data = request.get_json()
    nueva_categoria = Categoria(
        nombre=data['nombre'],
        descripcion=data.get('descripcion')
    )
    db.session.add(nueva_categoria)
    db.session.commit()
    return jsonify({'message': 'Categoría creada', 'id': nueva_categoria.id}), 201


@app.route('/api/productos/buscar', methods=['GET'])
def buscar_productos():
    """Buscar productos por nombre o categoría"""
    query = request.args.get('q', '')
    categoria = request.args.get('categoria', '')
    # Limitar a 100 resultados por defecto
    limit = int(request.args.get('limit', 100))

    productos_query = Producto.query

    if query:
        productos_query = productos_query.filter(
            Producto.nombre.contains(query))

    if categoria:
        productos_query = productos_query.join(Categoria).filter(
            Categoria.nombre.contains(categoria))

    # Ordenar por fecha de creación (más recientes primero) y limitar resultados
    productos = productos_query.order_by(
        Producto.fecha_creacion.desc()).limit(limit).all()

    return jsonify([{
        'id': p.id,
        'nombre': p.nombre,
        'precio': p.precio,
        'stock': p.stock,
        'categoria': p.categoria.nombre
    } for p in productos]), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
