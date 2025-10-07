# 🚀 Proyecto Parcial – CS2032 Cloud Computing (Ciclo 2025-2)
**Tema:** Sistema de Gestión de Inventarios  
**Entorno:** AWS Academy – sin roles de instancia (usar ~/.aws credentials montadas)  
**Objetivo:** Desarrollar una solución en AWS basada en microservicios, Docker y arquitectura distribuida que permita gestionar productos, stock, órdenes y reportes analíticos de inventario.

---

## 🧩 Estructura General del Proyecto

### 🛠️ Backend (Microservicios en Docker)
Crea **5 microservicios**, desplegados en **2 instancias EC2** con **Docker Compose** y **balanceador de carga**:

1. **Microservicio de Productos (Python + MySQL)**  
   - CRUD completo de productos: nombre, categoría, precio, stock, proveedor.  
   - Inserta 20 000 registros ficticios (usa `Faker`).  
   - Diagrama E-R con mínimo 2 tablas relacionadas.

2. **Microservicio de Órdenes (Java + PostgreSQL)**  
   - Gestiona pedidos, clientes y detalles de compra.  
   - Relación 1–N entre orden y productos.  
   - Inserta datos masivos y expone endpoints REST.

3. **Microservicio de Proveedores (Node.js + MongoDB)**  
   - Almacena información de proveedores y estados de entrega.  
   - Estructura JSON bien definida.

4. **Microservicio de Integración (Python)**  
   - Sin base de datos.  
   - Consume los otros 3 microservicios y expone endpoints consolidados (por ejemplo, órdenes con datos del producto y proveedor).

5. **Microservicio Analítico (Python)**  
   - Ejecuta consultas en **AWS Athena** para generar indicadores (rotación de stock, productos más vendidos, ventas por categoría, etc.).  
   - Expone endpoints REST con estadísticas agregadas.

> Documenta las APIs con Swagger UI y publica los repositorios en GitHub.

---

### 🌐 Frontend (Aplicación Web en AWS Amplify)
Desarrolla una **SPA moderna (React, Vite o Angular)** que consuma los 5 microservicios:

- Dashboard con paneles de:
  - Inventario actual
  - Pedidos recientes
  - Proveedores activos
  - Reportes analíticos desde Athena
- Cada microservicio debe tener al menos **2 métodos REST invocados**.
- Despliega la app en **AWS Amplify**.

---

### 📊 Data Science / Analytics
Implementa la capa de analítica:

1. Crea la **MV-Ingesta (EC2)**.  
2. Crea un **bucket S3** para almacenar CSV/JSON de cada microservicio.  
3. Desarrolla **3 contenedores Docker (Python)** que extraigan datos de los microservicios (estrategia *pull*) y los carguen al S3.  
4. Configura **AWS Glue** para catalogar los datos.  
5. Crea un **diagrama E-R** del catálogo.  
6. Ejecuta al menos **4 consultas SQL Athena** y **2 vistas** (por ejemplo, productos con bajo stock o rentabilidad por proveedor).

---

### 🧠 Diagrama de Arquitectura
Crea en **draw.io** un esquema con:
- Backend (5 microservicios + DBs)
- Frontend (Amplify)
- Ingesta (EC2 + Docker)
- S3 + Glue + Athena
- Balanceador de carga + conexión interna

---

## 📦 Entregables

| Hito | Entregable | Fecha límite | Evaluador |
|------|-------------|---------------|------------|
| 1️⃣ | Exposición virtual con ACL (4 pts) | **28 Sep 2025 23:59** | ACL |
| 2️⃣ | Exposición presencial + demo (16 pts) | **5 Oct 2025 23:59** | Profesor |
| 📄 | Informe en Word/PDF + PowerPoint resumen | Semana 8–9 | Equipo |

---

## ⚙️ Indicaciones para Copilot

1. Genera los **Dockerfiles**, `docker-compose.yml` y estructura de carpetas.  
2. Crea ejemplos base para cada microservicio.  
3. Configura conexión a MySQL, PostgreSQL y MongoDB.  
4. Incluye ejemplos de conexión a S3, Glue y Athena con `boto3`.  
5. Usa `~/.aws/credentials` montadas y `AWS_PROFILE=default`.  
6. Genera un frontend React con `fetch` o `axios` para consumir los endpoints.  
7. Documenta todo con Swagger.  
8. Incluye README principal con pasos de despliegue.

---

