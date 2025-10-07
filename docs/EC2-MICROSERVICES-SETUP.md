# 🚀 GUÍA: Desplegar Microservicios en EC2 (100% CLICKS)

**Para AWS Academy - Deployment completo de backend conectado a la base de datos EC2**

---

## **📋 Pre-requisitos**

✅ Instancia EC2 con bases de datos configurada y corriendo  
✅ Elastic IP asignada a la instancia de bases de datos  
✅ Conoces la IP de tu servidor de bases de datos (ej: `52.123.45.67`)

---

## **PARTE 1: Crear Instancia EC2 para Microservicios**

### **Paso 1: Acceder a AWS**

1. AWS Academy → **Start Lab** → **AWS**
2. Buscar **"EC2"** y click

### **Paso 2: Lanzar Nueva Instancia**

1. Click en **"Launch instance"**
2. **Name**: `servidor-microservicios`
3. **AMI**: **Amazon Linux 2023 AMI**
4. **Instance type**: **t2.large** o **t3.large** (necesitas recursos para 5 microservicios)
   - Si no está disponible, mínimo **t2.medium**

### **Paso 3: Key Pair**

- **Proceed without a key pair** (usaremos EC2 Instance Connect)

### **Paso 4: Network Settings**

1. Click **"Edit"**
2. **Auto-assign public IP**: **Enable**
3. **Create security group**:

   - Name: `microservices-sg`
   - Description: `Security group para microservicios`

4. **Inbound Security Group Rules** - Click **"Add security group rule"** para cada puerto:

   | Type       | Port | Source               | Descripción         |
   | ---------- | ---- | -------------------- | ------------------- |
   | HTTP       | 80   | Anywhere (0.0.0.0/0) | HTTP                |
   | Custom TCP | 5001 | Anywhere             | Productos Service   |
   | Custom TCP | 8080 | Anywhere             | Ordenes Service     |
   | Custom TCP | 3000 | Anywhere             | Proveedores Service |
   | Custom TCP | 8000 | Anywhere             | Integración Service |
   | Custom TCP | 9000 | Anywhere             | Analítico Service   |

### **Paso 5: Storage**

- **30 GB gp3**

### **Paso 6: Lanzar**

1. Click **"Launch instance"**
2. Espera a **"2/2 checks passed"**

### **Paso 7: Asignar Elastic IP (RECOMENDADO)**

1. **Network & Security** → **Elastic IPs**
2. **"Allocate Elastic IP address"** → **"Allocate"**
3. **Actions** → **"Associate Elastic IP address"**
4. Selecciona `servidor-microservicios`
5. **⚠️ Anota esta IP** (ej: `54.234.56.78`) - será la IP de tus APIs

---

## **PARTE 2: Conectarse e Instalar Docker**

### **Paso 8: Conectar con Instance Connect**

1. Selecciona `servidor-microservicios`
2. Click **"Connect"** → **"EC2 Instance Connect"** → **"Connect"**

### **Paso 9: Actualizar Sistema**

```bash
sudo dnf update -y
```

### **Paso 10: Instalar Docker**

```bash
# Instalar Docker
sudo dnf install -y docker

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Agregar usuario al grupo docker
sudo usermod -a -G docker ec2-user

# Aplicar cambios de grupo (IMPORTANTE)
newgrp docker

# Verificar instalación
docker --version
```

### **Paso 11: Instalar Docker Compose**

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

---

## **PARTE 3: Clonar Código desde GitHub**

### **Paso 12: Instalar Git**

En la terminal de EC2 Instance Connect:

```bash
# Instalar git
sudo dnf install -y git
```

### **Paso 13: Clonar tu Repositorio**

```bash
# Ir al directorio home
cd ~

# Clonar tu repositorio (reemplaza con tu URL de GitHub)
git clone https://github.com/TU_USUARIO/inventario.git app

# Entrar al directorio
cd app

# Verificar que todo esté ahí
ls -la
ls -la backend/
```

**⚠️ Reemplaza `TU_USUARIO/inventario`** con la URL real de tu repositorio de GitHub.

**Ejemplo:**

```bash
git clone https://github.com/marcos/inventario-system.git app
```

### **Paso 14: Actualizar a la Última Versión (Opcional)**

Si ya habías clonado antes y quieres actualizar:

```bash
cd ~/app
git pull origin main
```

---

## **PARTE 4: Configurar Variables de Entorno**

### **Paso 15: Crear archivo .env**

En la terminal de EC2:

```bash
cd ~/app
nano .env
```

**Copia y pega esto** (reemplaza `IP_BASE_DE_DATOS` con la IP de tu instancia de BD):

```bash
# ========================================
# DATABASE CONFIGURATION (EC2)
# ========================================
# 🔴 REEMPLAZA CON LA IP DE TU INSTANCIA DE BASES DE DATOS
DB_HOST=52.123.45.67

# MySQL (Productos)
MYSQL_HOST=52.123.45.67
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password123
MYSQL_DATABASE=productos_db
DATABASE_URL=mysql+pymysql://root:password123@52.123.45.67:3306/productos_db

# PostgreSQL (Ordenes)
POSTGRES_HOST=52.123.45.67
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
POSTGRES_DB=ordenes_db

# MongoDB (Proveedores)
MONGO_HOST=52.123.45.67
MONGO_PORT=27017
MONGO_URI=mongodb://root:password123@52.123.45.67:27017/proveedores_db?authSource=admin

# ========================================
# MICROSERVICES URLS
# ========================================
PRODUCTOS_SERVICE_URL=http://localhost:5001
ORDENES_SERVICE_URL=http://localhost:8080
PROVEEDORES_SERVICE_URL=http://localhost:3000
INTEGRACION_SERVICE_URL=http://localhost:8000
ANALITICO_SERVICE_URL=http://localhost:9000

# ========================================
# AWS CONFIGURATION (para analítico service)
# ========================================
AWS_REGION=us-east-1
AWS_PROFILE=default
ATHENA_DATABASE=inventario_db
ATHENA_OUTPUT_LOCATION=s3://tu-bucket/athena-results/
```

Presiona `Ctrl+X`, luego `Y`, luego `ENTER` para guardar.

---

## **PARTE 5: Verificar Archivos del Proyecto**

### **Paso 16: Verificar que todo está listo**

```bash
cd ~/app

# Verificar que docker-compose.yml existe
ls -la docker-compose.yml

# Verificar que el archivo .env existe y tiene las IPs correctas
cat .env | grep "52.123.45.67"

# Verificar estructura del backend
ls -la backend/
```

✅ Tu repositorio ya tiene el archivo `docker-compose.yml` configurado.

**⚠️ IMPORTANTE:** El docker-compose.yml incluye las bases de datos (MySQL, PostgreSQL, MongoDB) pero vamos a iniciar SOLO los microservicios porque las bases de datos ya están en otra instancia EC2.

---

## **PARTE 6: Construir y Desplegar**

### **Paso 17: Construir SOLO los Microservicios**

```bash
cd ~/app

# Construir solo los servicios backend (esto toma 10-15 minutos)
docker-compose build productos-service ordenes-service proveedores-service integracion-service analitico-service
```

⏳ **Espera pacientemente** - verás el progreso de cada servicio.

**Nota:** NO construimos las bases de datos (mysql, postgres, mongodb) porque ya están en otra instancia EC2.

### **Paso 18: Iniciar SOLO los Microservicios**

```bash
# Iniciar solo los microservicios (sin las bases de datos)
docker-compose up -d productos-service ordenes-service proveedores-service integracion-service analitico-service

# Ver logs en tiempo real
docker-compose logs -f
```

Para salir de los logs: `Ctrl+C`

### **Paso 19: Verificar Estado**

```bash
# Ver contenedores corriendo (deberías ver 5 contenedores)
docker ps

# Ver estado de los microservicios
docker-compose ps

# Ver logs de un servicio específico
docker logs productos-service
docker logs ordenes-service
docker logs proveedores-service
```

**Deberías ver:**

- ✅ productos-service (Up)
- ✅ ordenes-service (Up)
- ✅ proveedores-service (Up)
- ✅ integracion-service (Up)
- ✅ analitico-service (Up)

---

## **PARTE 7: Probar los Microservicios**

### **Paso 20: Probar desde la Terminal de EC2**

```bash
# Probar Productos Service
curl http://localhost:5001/health

# Probar Ordenes Service
curl http://localhost:8080/actuator/health

# Probar Proveedores Service
curl http://localhost:3000/health

# Probar API de Productos
curl http://localhost:5001/api/productos

# Probar API de Ordenes
curl http://localhost:8080/api/ordenes

# Probar API de Proveedores
curl http://localhost:3000/api/proveedores
```

### **Paso 21: Probar desde tu Mac**

Reemplaza `54.234.56.78` con la Elastic IP de tu instancia de microservicios:

```bash
# Productos
curl http://54.234.56.78:5001/health
curl http://54.234.56.78:5001/api/productos

# Ordenes
curl http://54.234.56.78:8080/actuator/health
curl http://54.234.56.78:8080/api/ordenes

# Proveedores
curl http://54.234.56.78:3000/health
curl http://54.234.56.78:3000/api/proveedores

# Integración
curl http://54.234.56.78:8000/health

# Analítico
curl http://54.234.56.78:9000/health
```

### **Paso 22: Probar en el Navegador**

Abre en tu navegador:

- **Productos Swagger**: `http://52.6.92.4:5001/api/docs`
- **Ordenes Swagger**: `http://54.234.56.78:8080/swagger-ui.html`
- **Proveedores Swagger**: `http://54.234.56.78:3000/api-docs`

---

## **PARTE 8: Actualizar Frontend**

### **Paso 23: Configurar .env del Frontend**

En tu Mac, actualiza `/Users/marcosotomaceda/Desktop/inventario/frontend/.env`:

```bash
VITE_API_BASE_URL=http://54.234.56.78:8000
VITE_PRODUCTOS_API=http://54.234.56.78:5001
VITE_ORDENES_API=http://54.234.56.78:8080
VITE_PROVEEDORES_API=http://54.234.56.78:3000
VITE_ANALITICO_API=http://54.234.56.78:9000
```

---

## **🔧 COMANDOS ÚTILES**

### **Ver Logs**

```bash
# Todos los microservicios
docker-compose logs -f

# Servicio específico
docker logs -f productos-service
docker logs -f ordenes-service --tail 100
```

### **Reiniciar Servicios**

```bash
# Reiniciar todos los microservicios
docker-compose restart productos-service ordenes-service proveedores-service integracion-service analitico-service

# Reiniciar uno específico
docker-compose restart productos-service
```

### **Detener Servicios**

```bash
# Detener solo microservicios
docker-compose stop productos-service ordenes-service proveedores-service integracion-service analitico-service

# Detener y eliminar solo microservicios
docker-compose down
```

### **Reconstruir un Servicio**

```bash
# Si haces cambios en el código (actualizar desde GitHub)
cd ~/app
git pull origin main

# Reconstruir servicio específico
docker-compose build productos-service
docker-compose up -d productos-service
```

### **Ver Uso de Recursos**

```bash
# Ver CPU y memoria
docker stats

# Ver espacio en disco
docker system df
```

---

## **🆘 TROUBLESHOOTING**

### **Error: No se puede conectar a la base de datos**

1. Verifica que la instancia de BD esté corriendo
2. Verifica que la IP en `.env` sea correcta
3. Verifica que el Security Group de BD permita tráfico desde el Security Group de microservicios

```bash
# Prueba conexión desde EC2 de microservicios
mysql -h 52.123.45.67 -u root -ppassword123 productos_db
PGPASSWORD=password123 psql -h 52.123.45.67 -U postgres -d ordenes_db
mongosh "mongodb://root:password123@52.123.45.67:27017/proveedores_db?authSource=admin"
```

### **Error: Puerto ya en uso**

```bash
# Ver qué está usando el puerto
sudo netstat -tlnp | grep 5001

# Matar proceso
sudo kill -9 <PID>
```

### **Error: Contenedor se detiene inmediatamente**

```bash
# Ver logs del contenedor
docker logs productos-service

# Ver últimas 50 líneas
docker logs productos-service --tail 50
```

### **Error: Out of memory**

La instancia t2.medium puede quedarse sin memoria con 5 servicios:

```bash
# Crear swap
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Verificar
free -h
```

### **Reiniciar Todo Desde Cero**

```bash
# Detener y eliminar todos los contenedores de microservicios
docker-compose down

# Eliminar imágenes para forzar rebuild
docker system prune -a -f

# Actualizar código desde GitHub
cd ~/app
git pull origin main

# Reconstruir microservicios
docker-compose build productos-service ordenes-service proveedores-service integracion-service analitico-service

# Iniciar microservicios
docker-compose up -d productos-service ordenes-service proveedores-service integracion-service analitico-service
```

---

## **📊 ARQUITECTURA FINAL**

```
┌─────────────────────────────────────────────────────────┐
│                     USUARIO                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         EC2: servidor-microservicios                     │
│         IP: 54.234.56.78                                │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Docker Containers                                │  │
│  │  - productos-service:5001                        │  │
│  │  - ordenes-service:8080                          │  │
│  │  - proveedores-service:3000                      │  │
│  │  - integracion-service:8000                      │  │
│  │  - analitico-service:9000                        │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ Conexiones de BD
                 ▼
┌─────────────────────────────────────────────────────────┐
│         EC2: servidor-bases-datos                        │
│         IP: 52.123.45.67                                │
│                                                          │
│  - MySQL:3306 (productos_db)                            │
│  - PostgreSQL:5432 (ordenes_db)                         │
│  - MongoDB:27017 (proveedores_db)                       │
└─────────────────────────────────────────────────────────┘
```

---

## **✅ CHECKLIST FINAL**

- [ ] Instancia EC2 de microservicios creada
- [ ] Elastic IP asignada a microservicios
- [ ] Docker y Docker Compose instalados
- [ ] Código subido a la instancia
- [ ] Archivo `.env` configurado con IP correcta de BD
- [ ] Imágenes Docker construidas
- [ ] Contenedores corriendo (`docker ps` muestra 5 servicios)
- [ ] Health checks respondiendo correctamente
- [ ] APIs accesibles desde navegador
- [ ] Frontend configurado para usar APIs en EC2

---

## **🎉 ¡DEPLOYMENT COMPLETO!**

Ahora tienes:

- ✅ Bases de datos en EC2 (instancia separada)
- ✅ 5 microservicios en EC2 (otra instancia)
- ✅ Todo conectado y funcionando
- ✅ IPs fijas con Elastic IPs
- ✅ APIs accesibles públicamente

**Próximos pasos**:

1. Configurar frontend en S3 + CloudFront
2. Configurar ingesta de datos a S3
3. Configurar Athena para análisis
