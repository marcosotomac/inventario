# 🖱️ GUÍA: Configurar Bases de Datos en EC2 (100% CLICKS)

**Para AWS Academy - Sin SSH, sin GitHub, sin comandos complicados**

---

## **PARTE 1: Crear la Instancia EC2**

### **Paso 1: Acceder a AWS**
1. Inicia sesión en **AWS Academy Learner Lab**
2. Click en **"Start Lab"** (espera a que el punto se ponga verde ●)
3. Click en **"AWS"** para abrir la consola
4. En el buscador superior, escribe **"EC2"** y click

### **Paso 2: Lanzar Instancia**
1. Click en **"Launch instance"** (botón naranja)
2. **Name**: `servidor-bases-datos`
3. **AMI**: Deja **Amazon Linux 2023 AMI** (la primera opción gratis)
4. **Instance type**: Selecciona **t2.medium** o **t3.medium**

### **Paso 3: Key Pair - NO NECESARIO**
- En **Key pair (login)**: Selecciona **"Proceed without a key pair"**
- ⚠️ Verás una advertencia amarilla - **ignórala**

### **Paso 4: Configurar Seguridad**
1. Click en **"Edit"** en Network settings
2. **Auto-assign public IP**: **Enable**
3. Click en **"Create security group"**
   - Name: `db-security-group`
   - Description: `Acceso a bases de datos`

4. Click **"Add security group rule"** 4 veces para crear estas reglas:

   | Type | Port | Source |
   |------|------|--------|
   | MySQL/Aurora | 3306 | Anywhere (0.0.0.0/0) |
   | PostgreSQL | 5432 | Anywhere (0.0.0.0/0) |
   | Custom TCP | 27017 | Anywhere (0.0.0.0/0) |
   | Custom TCP | 8000 | Anywhere (0.0.0.0/0) |

### **Paso 5: Storage**
- **Configure storage**: **30 GB gp3**

### **Paso 6: Lanzar**
1. Click **"Launch instance"** (botón naranja)
2. Click **"View all instances"**
3. Espera a ver **"2/2 checks passed"** (2-3 minutos)

---

## **PARTE 2: Conectarse con el Navegador**

### **Paso 7: Abrir Terminal Web**
1. ✅ Marca el checkbox de tu instancia
2. Click **"Connect"** (botón naranja arriba)
3. Click en la pestaña **"EC2 Instance Connect"**
4. Click **"Connect"** (botón naranja)
5. 🎉 Se abre una **terminal negra en el navegador**

---

## **PARTE 3: Instalar las Bases de Datos**

### **Paso 8: Actualizar Sistema**
```bash
sudo dnf update -y
```
⏳ Espera 1-2 minutos

---

### **🔹 MYSQL (1/3)**

#### Instalar
```bash
sudo dnf install -y mariadb105-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

#### Configurar Seguridad
```bash
sudo mysql_secure_installation
```

**Responde:**
- Enter password: **[ENTER]**
- Switch to unix_socket: **n**
- Set root password: **y**
  - Password: `password123`
  - Re-enter: `password123`
- Remove anonymous: **y**
- Disallow root remotely: **n** ⚠️
- Remove test database: **y**
- Reload privileges: **y**

#### Crear Base de Datos y Tabla
```bash
sudo mysql -u root -ppassword123
```

Copia TODO esto:
```sql
CREATE DATABASE productos_db;
CREATE USER 'root'@'%' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON productos_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

USE productos_db;

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    stock INT DEFAULT 0,
    categoria VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES
('Laptop Dell XPS 15', 'Laptop profesional 16GB RAM, 512GB SSD', 1200.00, 15, 'Computadoras'),
('Mouse Logitech MX Master', 'Mouse inalámbrico ergonómico', 25.00, 50, 'Accesorios'),
('Teclado Mecánico Corsair', 'Teclado RGB switches Cherry MX', 80.00, 30, 'Accesorios'),
('Monitor LG 27"', 'Monitor 4K IPS', 350.00, 20, 'Monitores'),
('Webcam Logitech C920', 'Webcam Full HD 1080p', 70.00, 40, 'Accesorios');

SELECT * FROM productos;
EXIT;
```

#### Permitir Acceso Remoto
```bash
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/my.cnf.d/mariadb-server.cnf
sudo systemctl restart mariadb
```

✅ **MySQL configurado**

---

### **🔹 POSTGRESQL (2/3)**

#### Instalar
```bash
sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Configurar
```bash
sudo -u postgres psql
```

Copia TODO esto:
```sql
ALTER USER postgres PASSWORD 'password123';
CREATE DATABASE ordenes_db;

\c ordenes_db

CREATE TABLE ordenes (
    id SERIAL PRIMARY KEY,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2),
    total DECIMAL(10,2),
    cliente_nombre VARCHAR(255),
    cliente_email VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefono VARCHAR(50),
    direccion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juan@email.com', '+123456789', 'Calle 123, Ciudad'),
('María García', 'maria@email.com', '+987654321', 'Avenida 456, Ciudad'),
('Carlos López', 'carlos@email.com', '+555555555', 'Plaza 789, Ciudad');

INSERT INTO ordenes (producto_id, cantidad, precio_unitario, total, cliente_nombre, cliente_email, estado) VALUES
(1, 2, 1200.00, 2400.00, 'Juan Pérez', 'juan@email.com', 'completada'),
(2, 5, 25.00, 125.00, 'María García', 'maria@email.com', 'pendiente'),
(3, 1, 80.00, 80.00, 'Carlos López', 'carlos@email.com', 'enviada'),
(4, 3, 350.00, 1050.00, 'Juan Pérez', 'juan@email.com', 'completada'),
(5, 2, 70.00, 140.00, 'María García', 'maria@email.com', 'pendiente');

SELECT * FROM ordenes;
SELECT * FROM clientes;
\q
```

#### Permitir Acceso Remoto
```bash
sudo bash -c "echo \"host all all 0.0.0.0/0 md5\" >> /var/lib/pgsql/data/pg_hba.conf"
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
sudo systemctl restart postgresql
```

✅ **PostgreSQL configurado**

---

### **🔹 MONGODB (3/3)**

#### Agregar Repositorio
```bash
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo > /dev/null <<'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
```

#### Instalar
```bash
sudo dnf install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Configurar Base de Datos
```bash
mongosh
```

Copia TODO esto:
```javascript
use admin
db.createUser({
  user: "root",
  pwd: "password123",
  roles: [ { role: "root", db: "admin" } ]
})

use proveedores_db

db.createCollection("proveedores")

db.proveedores.insertMany([
  {
    nombre: "Tech Supplies Inc",
    email: "contacto@techsupplies.com",
    telefono: "+1234567890",
    direccion: {
      calle: "123 Tech Street",
      ciudad: "San Francisco",
      pais: "USA",
      codigo_postal: "94102"
    },
    productos_suministrados: ["Laptops", "Monitores", "Accesorios"],
    calificacion: 4.5,
    activo: true,
    created_at: new Date()
  },
  {
    nombre: "Global Electronics",
    email: "ventas@globalelectronics.com",
    telefono: "+0987654321",
    direccion: {
      calle: "456 Electronics Ave",
      ciudad: "New York",
      pais: "USA",
      codigo_postal: "10001"
    },
    productos_suministrados: ["Periféricos", "Componentes", "Cables"],
    calificacion: 4.8,
    activo: true,
    created_at: new Date()
  },
  {
    nombre: "Import Tech Solutions",
    email: "info@importtech.com",
    telefono: "+1122334455",
    direccion: {
      calle: "789 Import Boulevard",
      ciudad: "Los Angeles",
      pais: "USA",
      codigo_postal: "90001"
    },
    productos_suministrados: ["Hardware", "Software", "Soporte Técnico"],
    calificacion: 4.2,
    activo: true,
    created_at: new Date()
  }
])

db.proveedores.find().pretty()
exit
```

#### Habilitar Autenticación
```bash
sudo sed -i 's/#security:/security:\n  authorization: enabled/' /etc/mongod.conf
sudo sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf
sudo systemctl restart mongod
```

✅ **MongoDB configurado**

---

## **PARTE 4: Configurar tu Aplicación**

### **Paso 9: Obtener IP Pública**

1. Vuelve a la consola EC2 (pestaña del navegador)
2. Click en tu instancia
3. **Copia la "Public IPv4 address"**
   - Ejemplo: `54.123.45.67`

### **Paso 10: Crear archivo .env**

En tu **Mac**, en la carpeta `/Users/marcosotomaceda/Desktop/inventario/`:

1. Duplica el archivo `.env.example`:
```bash
cp .env.example .env
```

2. Abre `.env` y **reemplaza** con estos valores:

```bash
# ========================================
# AWS CONFIGURATION (AWS Academy)
# ========================================
AWS_REGION=us-east-1
AWS_PROFILE=default
S3_BUCKET=inventario-datalake-XXXXXXXX
ATHENA_DATABASE=inventario_db
ATHENA_OUTPUT_LOCATION=s3://inventario-datalake-XXXXXXXX/athena-results/

# ========================================
# DATABASE CREDENTIALS
# ========================================
# 🔴 REEMPLAZA 54.123.45.67 CON TU IP PÚBLICA DE EC2

# MySQL
MYSQL_HOST=54.123.45.67
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_ROOT_PASSWORD=password123
MYSQL_DATABASE=productos_db

# PostgreSQL
POSTGRES_HOST=54.123.45.67
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_DB=ordenes_db

# MongoDB
MONGO_HOST=54.123.45.67
MONGO_PORT=27017
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=proveedores_db
MONGODB_URI=mongodb://root:password123@54.123.45.67:27017/proveedores_db?authSource=admin

# ========================================
# MICROSERVICES URLS (para desarrollo local)
# ========================================
PRODUCTOS_SERVICE_URL=http://localhost:5001
ORDENES_SERVICE_URL=http://localhost:8080
PROVEEDORES_SERVICE_URL=http://localhost:3000
INTEGRACION_SERVICE_URL=http://localhost:8000
ANALITICO_SERVICE_URL=http://localhost:9000
```

---

## **✅ VERIFICACIÓN**

### En la Terminal de EC2 Instance Connect:

```bash
# Verificar que todo esté corriendo
sudo systemctl status mariadb | grep Active
sudo systemctl status postgresql | grep Active
sudo systemctl status mongod | grep Active
```

Deberías ver **"active (running)"** en las 3.

### Desde tu Mac (opcional):

Si tienes los clientes instalados:

```bash
# MySQL
mysql -h 54.123.45.67 -u root -ppassword123 productos_db -e "SELECT COUNT(*) FROM productos;"

# PostgreSQL
PGPASSWORD=password123 psql -h 54.123.45.67 -U postgres -d ordenes_db -c "SELECT COUNT(*) FROM ordenes;"

# MongoDB
mongosh "mongodb://root:password123@54.123.45.67:27017/proveedores_db?authSource=admin" --eval "db.proveedores.countDocuments()"
```

---

## **🎉 ¡LISTO!**

Ahora tienes:

✅ **MySQL** con:
- Base de datos: `productos_db`
- 5 productos de ejemplo
- Usuario: `root` / Password: `password123`

✅ **PostgreSQL** con:
- Base de datos: `ordenes_db`
- Tablas: `ordenes` y `clientes`
- 5 órdenes y 3 clientes de ejemplo
- Usuario: `postgres` / Password: `password123`

✅ **MongoDB** con:
- Base de datos: `proveedores_db`
- Colección: `proveedores`
- 3 proveedores de ejemplo
- Usuario: `root` / Password: `password123`

✅ **Archivo .env** configurado con la IP de EC2

---

## **⚠️ IMPORTANTE**

### Cada vez que inicies el Lab:
1. La **IP pública cambiará**
2. Debes **actualizar el .env** con la nueva IP
3. Las bases de datos y datos **se mantienen**

### Para obtener la nueva IP:
1. AWS Academy → Start Lab
2. EC2 → Instances
3. Copiar nueva Public IPv4 address
4. Actualizar `.env`

### Para apagar (ahorrar créditos):
1. AWS Academy → End Lab

---

## **🆘 Troubleshooting**

### No puedo conectarme desde mi Mac
```bash
# Verifica Security Group
# Verifica que la IP en .env sea correcta
# Verifica que la instancia esté corriendo
```

### MongoDB no arranca
```bash
sudo systemctl restart mongod
sudo journalctl -u mongod -n 50
```

### MySQL no acepta conexiones remotas
```bash
sudo systemctl restart mariadb
sudo mysql -u root -ppassword123 -e "SELECT host, user FROM mysql.user;"
```

### PostgreSQL no acepta conexiones remotas
```bash
sudo systemctl restart postgresql
sudo cat /var/lib/pgsql/data/pg_hba.conf | grep "0.0.0.0"
```