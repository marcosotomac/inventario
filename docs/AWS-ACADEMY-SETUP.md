# 🎓 Guía de Configuración para AWS Academy

Este proyecto está diseñado para funcionar en **AWS Academy Learner Lab** con sus restricciones específicas.

## ⚠️ Restricciones de AWS Academy

AWS Academy tiene limitaciones importantes:

- ❌ **NO** se pueden crear roles IAM
- ❌ **NO** se pueden usar roles de instancia (IAM Instance Profiles)
- ❌ **NO** se pueden crear políticas IAM personalizadas
- ✅ **SÍ** existe un rol `LabRole` preconfigurado
- ✅ **SÍ** se pueden montar credenciales de `~/.aws/credentials`
- ⏰ Las sesiones expiran cada **4 horas**

## 📋 Pre-requisitos

1. Acceso a AWS Academy Learner Lab
2. Docker y Docker Compose instalados localmente
3. AWS CLI instalado
4. Cuenta con permisos de laboratorio activos

## 🔧 Configuración Inicial

### 1. Configurar AWS CLI

```bash
# Acceder a AWS Academy
# Ir a: AWS Details > AWS CLI: Show

# Copiar las credenciales y pegarlas en:
nano ~/.aws/credentials

# Contenido esperado:
[default]
aws_access_key_id = ASIAXXXXXXXXXX
aws_secret_access_key = XXXXXXXXXXXX
aws_session_token = XXX...

# Configurar región
aws configure set region us-east-1 --profile default
```

### 2. Verificar Configuración

```bash
# Verificar identidad
aws sts get-caller-identity --profile default

# Debería mostrar algo como:
# {
#     "UserId": "AIDAXXXXX:user123",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/voclabs/user123"
# }
```

### 3. Configurar S3 y Glue

```bash
# Ejecutar el script de configuración
cd docs
chmod +x setup-aws-glue.sh
./setup-aws-glue.sh

# Este script creará:
# - Bucket S3 único
# - Base de datos Glue
# - Tablas en el catálogo Glue
# - Archivo .env con la configuración
```

## 🐳 Desplegar Backend con Docker

### 1. Configurar Variables de Entorno

```bash
# Crear archivo .env en la raíz del proyecto
cd /Users/marcosotomaceda/Desktop/inventario
cp .env.example .env

# Editar con tu bucket S3
nano .env
```

Contenido de `.env`:

```bash
# AWS Configuration (de setup-aws-glue.sh)
AWS_REGION=us-east-1
AWS_PROFILE=default
S3_BUCKET=inventario-datalake-XXXXXXXX  # El bucket creado por el script
ATHENA_DATABASE=inventario_db
ATHENA_OUTPUT_LOCATION=s3://inventario-datalake-XXXXXXXX/athena-results/

# Database URLs
PRODUCTOS_DB_URL=mysql+pymysql://root:password123@mysql:3306/productos_db
ORDENES_DB_URL=jdbc:postgresql://postgres:5432/ordenes_db
PROVEEDORES_MONGO_URL=mongodb://mongodb:27017/proveedores_db
```

### 2. Levantar Servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Verificar servicios
docker-compose ps
```

### 3. Poblar Bases de Datos

```bash
# Esperar a que los servicios estén listos (30-60 segundos)
sleep 60

# Productos (Python + MySQL) - 20,000 registros
docker-compose exec productos-service python seed_data.py

# Órdenes (Java + PostgreSQL) - 10,000 órdenes + 1,000 clientes
# (Se puebla automáticamente al iniciar)

# Proveedores (Node.js + MongoDB) - 500 proveedores
docker-compose exec proveedores-service npm run seed
```

## 📊 Sistema de Ingesta a S3

### 1. Configurar Credenciales

```bash
cd ingesta

# Verificar que existe .env (creado por setup-aws-glue.sh)
cat .env

# Debería contener:
# AWS_REGION=us-east-1
# AWS_PROFILE=default
# S3_BUCKET=inventario-datalake-XXXXXXXX
# ...
```

### 2. Ejecutar Ingesta

```bash
# Levantar contenedores de ingesta
docker-compose up -d

# Ver progreso
docker-compose logs -f

# Los contenedores extraerán datos de los microservicios
# y los cargarán a S3 en formato CSV/JSON
```

### 3. Verificar Datos en S3

```bash
# Listar archivos cargados
aws s3 ls s3://inventario-datalake-XXXXXXXX/productos/ --profile default
aws s3 ls s3://inventario-datalake-XXXXXXXX/ordenes/ --profile default
aws s3 ls s3://inventario-datalake-XXXXXXXX/clientes/ --profile default
aws s3 ls s3://inventario-datalake-XXXXXXXX/proveedores/ --profile default
```

## 🔍 Consultas en Athena

### 1. Acceder a la Consola de Athena

```
https://us-east-1.console.aws.amazon.com/athena/home?region=us-east-1
```

### 2. Configurar Output Location

En Athena Console:

- Settings > Manage
- Query result location: `s3://inventario-datalake-XXXXXXXX/athena-results/`
- Save

### 3. Consultas de Ejemplo

```sql
-- Verificar productos
SELECT COUNT(*) FROM inventario_db.productos;

-- Top 10 productos más caros
SELECT nombre, categoria, precio, stock
FROM inventario_db.productos
ORDER BY precio DESC
LIMIT 10;

-- Órdenes recientes
SELECT numero_orden, cliente_id, total, estado, fecha_orden
FROM inventario_db.ordenes
ORDER BY fecha_orden DESC
LIMIT 20;

-- Clientes por ciudad
SELECT ciudad, COUNT(*) as total_clientes
FROM inventario_db.clientes
GROUP BY ciudad
ORDER BY total_clientes DESC;

-- Proveedores activos
SELECT nombre, estado, calificacion, estado_entrega
FROM inventario_db.proveedores
WHERE estado = 'ACTIVO'
ORDER BY calificacion DESC;
```

### 4. Crear Vistas

```sql
-- Vista: Productos con stock bajo
CREATE OR REPLACE VIEW productos_stock_critico AS
SELECT
    nombre,
    categoria,
    stock,
    proveedor,
    precio,
    CASE
        WHEN stock = 0 THEN 'SIN_STOCK'
        WHEN stock < 20 THEN 'CRITICO'
        WHEN stock < 50 THEN 'BAJO'
        ELSE 'NORMAL'
    END as nivel_stock
FROM inventario_db.productos
WHERE stock < 100
ORDER BY stock ASC;

-- Usar la vista
SELECT * FROM inventario_db.productos_stock_critico
WHERE nivel_stock = 'CRITICO';
```

## 🌐 Acceder al Frontend

### 1. Frontend Local (Desarrollo)

```bash
cd frontend
npm install
npm run dev

# Acceder a: http://localhost:5173
```

### 2. Desplegar en AWS Amplify

```bash
# Inicializar Git (si no está inicializado)
cd frontend
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub
gh repo create inventario-frontend --public

# Push
git branch -M main
git remote add origin https://github.com/TU-USUARIO/inventario-frontend.git
git push -u origin main

# Luego en AWS Console:
# 1. Ir a AWS Amplify
# 2. New app > Host web app
# 3. Conectar con GitHub
# 4. Seleccionar repositorio
# 5. Build settings (automático para Vite)
# 6. Deploy
```

## 🔄 Renovar Credenciales AWS Academy

Las sesiones de AWS Academy expiran cada 4 horas. Para renovar:

```bash
# 1. En AWS Academy, ir a: AWS Details > AWS CLI: Show
# 2. Copiar las nuevas credenciales

# 3. Actualizar ~/.aws/credentials
nano ~/.aws/credentials

# 4. Reemplazar las credenciales antiguas

# 5. Verificar
aws sts get-caller-identity --profile default

# 6. Si usas Docker, reiniciar servicios que usan AWS
cd ingesta
docker-compose restart
```

## 📊 Endpoints de los Microservicios

### Productos (Python + MySQL)

- **URL**: http://localhost:5001
- **Swagger**: http://localhost:5001/api/docs
- **Health**: http://localhost:5001/health

### Órdenes (Java + PostgreSQL)

- **URL**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger-ui.html
- **Health**: http://localhost:8080/health

### Proveedores (Node.js + MongoDB)

- **URL**: http://localhost:3000
- **Swagger**: http://localhost:3000/api-docs
- **Health**: http://localhost:3000/health

### Integración (Python)

- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

### Analítico (Python + Athena)

- **URL**: http://localhost:9000
- **Docs**: http://localhost:9000/docs
- **Health**: http://localhost:9000/health

## 🐛 Troubleshooting

### Error: "Unable to locate credentials"

```bash
# Verificar credenciales
cat ~/.aws/credentials

# Verificar perfil
aws configure list --profile default

# Renovar desde AWS Academy
```

### Error: "Access Denied" en S3

```bash
# Verificar permisos del bucket
aws s3api get-bucket-policy --bucket inventario-datalake-XXXXXXXX --profile default

# Verificar LabRole
aws sts get-caller-identity --profile default
```

### Docker Compose no inicia

```bash
# Ver logs detallados
docker-compose logs

# Reiniciar servicios
docker-compose down
docker-compose up -d

# Limpiar volúmenes si es necesario
docker-compose down -v
docker-compose up -d
```

### Athena: "Table not found"

```bash
# Verificar que existe la base de datos
aws glue get-database --name inventario_db --profile default

# Listar tablas
aws glue get-tables --database-name inventario_db --profile default

# Si no existen, ejecutar nuevamente:
cd docs
./setup-aws-glue.sh
```

### Microservicio no responde

```bash
# Ver estado
docker-compose ps

# Ver logs específicos
docker-compose logs productos-service
docker-compose logs ordenes-service
docker-compose logs proveedores-service

# Reiniciar servicio específico
docker-compose restart productos-service
```

## 📚 Recursos Adicionales

- [AWS Academy Learner Lab](https://awsacademy.instructure.com/)
- [AWS Glue Documentation](https://docs.aws.amazon.com/glue/)
- [AWS Athena Documentation](https://docs.aws.amazon.com/athena/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🎯 Checklist de Entrega

- [ ] Backend desplegado en EC2 con Docker Compose
- [ ] 5 microservicios funcionando correctamente
- [ ] Datos poblados en las bases de datos
- [ ] Sistema de ingesta cargando datos a S3
- [ ] Catálogo Glue configurado con tablas
- [ ] Consultas Athena funcionando
- [ ] Frontend desplegado en Amplify
- [ ] Documentación completa
- [ ] Diagrama de arquitectura
- [ ] README con instrucciones de despliegue
