# Sistema de Ingesta de Datos

Sistema de extracción de datos de los microservicios y carga a AWS S3 (Data Lake).

## 📦 Componentes

### 1. Ingesta de Productos

Extrae datos del microservicio de productos y los sube a S3.

**Datos extraídos:**

- Productos (CSV/JSON)
- Categorías (CSV)

**Ubicación S3:**

- `s3://inventario-datalake/productos/productos_YYYYMMDD_HHMMSS.csv`
- `s3://inventario-datalake/categorias/categorias_YYYYMMDD_HHMMSS.csv`

### 2. Ingesta de Órdenes

Extrae datos del microservicio de órdenes y clientes.

**Datos extraídos:**

- Órdenes (CSV/JSON)
- Clientes (CSV/JSON)

**Ubicación S3:**

- `s3://inventario-datalake/ordenes/ordenes_YYYYMMDD_HHMMSS.csv`
- `s3://inventario-datalake/clientes/clientes_YYYYMMDD_HHMMSS.csv`

### 3. Ingesta de Proveedores

Extrae datos del microservicio de proveedores (MongoDB).

**Datos extraídos:**

- Proveedores (CSV/JSON, aplanado de estructura JSON)

**Ubicación S3:**

- `s3://inventario-datalake/proveedores/proveedores_YYYYMMDD_HHMMSS.csv`

## 🔧 Configuración

### Variables de Entorno

```bash
# AWS
AWS_REGION=us-east-1
AWS_PROFILE=default
S3_BUCKET=inventario-datalake

# URLs de Servicios
PRODUCTOS_SERVICE_URL=http://productos-service:5001
ORDENES_SERVICE_URL=http://ordenes-service:8080
PROVEEDORES_SERVICE_URL=http://proveedores-service:3000
```

### Prerequisitos AWS

1. **Bucket S3 creado:**

```bash
aws s3 mb s3://inventario-datalake --region us-east-1
```

2. **AWS Credentials configuradas:**

```bash
aws configure --profile default
```

3. **Permisos IAM necesarios:**

- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`

## 🚀 Uso

### Ejecución Individual

```bash
# Ingesta de productos
cd ingesta-productos
docker build -t ingesta-productos .
docker run --rm \
  -v ~/.aws:/root/.aws:ro \
  -e AWS_PROFILE=default \
  -e S3_BUCKET=inventario-datalake \
  --network inventario-network \
  ingesta-productos

# Ingesta de órdenes
cd ingesta-ordenes
docker build -t ingesta-ordenes .
docker run --rm \
  -v ~/.aws:/root/.aws:ro \
  -e AWS_PROFILE=default \
  -e S3_BUCKET=inventario-datalake \
  --network inventario-network \
  ingesta-ordenes

# Ingesta de proveedores
cd ingesta-proveedores
docker build -t ingesta-proveedores .
docker run --rm \
  -v ~/.aws:/root/.aws:ro \
  -e AWS_PROFILE=default \
  -e S3_BUCKET=inventario-datalake \
  --network inventario-network \
  ingesta-proveedores
```

### Ejecución con Docker Compose

Ver el archivo `docker-compose.yml` principal en la raíz del proyecto.

## 📊 Flujo de Datos

```
┌─────────────────────┐
│   Microservicios    │
│  - Productos        │
│  - Órdenes          │
│  - Proveedores      │
└──────────┬──────────┘
           │ Pull Strategy
           ▼
┌─────────────────────┐
│  Contenedores de    │
│  Ingesta (Docker)   │
│  - Extract          │
│  - Transform        │
└──────────┬──────────┘
           │ Upload
           ▼
┌─────────────────────┐
│    AWS S3 Bucket    │
│   (Data Lake)       │
│  - productos/       │
│  - ordenes/         │
│  - proveedores/     │
│  - clientes/        │
│  - categorias/      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   AWS Glue Crawler  │
│   (Catalogar)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   AWS Athena        │
│   (Consultas SQL)   │
└─────────────────────┘
```

## 🔄 Programación Automática

### Opción 1: Cron en EC2

```bash
# Editar crontab
crontab -e

# Ejecutar ingesta diaria a las 2 AM
0 2 * * * /path/to/run-ingesta.sh >> /var/log/ingesta.log 2>&1
```

### Opción 2: AWS EventBridge + Lambda

Crear funciones Lambda que ejecuten los contenedores de ingesta mediante ECS Tasks.

### Opción 3: Airflow DAG

```python
from airflow import DAG
from airflow.operators.docker_operator import DockerOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'inventario',
    'depends_on_past': False,
    'start_date': datetime(2025, 10, 1),
    'email_on_failure': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'ingesta_inventario',
    default_args=default_args,
    description='Ingesta diaria de datos',
    schedule_interval='0 2 * * *',  # 2 AM diario
)

ingesta_productos = DockerOperator(
    task_id='ingesta_productos',
    image='ingesta-productos:latest',
    dag=dag,
)

ingesta_ordenes = DockerOperator(
    task_id='ingesta_ordenes',
    image='ingesta-ordenes:latest',
    dag=dag,
)

ingesta_proveedores = DockerOperator(
    task_id='ingesta_proveedores',
    image='ingesta-proveedores:latest',
    dag=dag,
)
```

## 📁 Estructura del Proyecto

```
ingesta/
├── ingesta-productos/
│   ├── ingest.py
│   ├── requirements.txt
│   └── Dockerfile
├── ingesta-ordenes/
│   ├── ingest.py
│   ├── requirements.txt
│   └── Dockerfile
├── ingesta-proveedores/
│   ├── ingest.py
│   ├── requirements.txt
│   └── Dockerfile
└── README.md
```

## 🐛 Troubleshooting

**Error: No se puede conectar a los microservicios**

- Verificar que los servicios estén ejecutándose
- Verificar la red Docker
- Revisar las URLs de configuración

**Error: Credenciales AWS no encontradas**

```bash
# Verificar configuración
aws configure list

# Montar credenciales correctamente
docker run -v ~/.aws:/root/.aws:ro ...
```

**Error: Acceso denegado a S3**

- Verificar permisos IAM
- Verificar que el bucket exista
- Verificar la región configurada

## 💡 Mejoras Futuras

- [ ] Validación de esquemas con Great Expectations
- [ ] Compresión de archivos (Gzip, Parquet)
- [ ] Particionamiento por fecha
- [ ] Logs centralizados
- [ ] Métricas de ingesta (CloudWatch)
- [ ] Manejo de datos incrementales
- [ ] Detección de duplicados
- [ ] Retry automático con backoff exponencial

## 📝 Notas

- Los contenedores pueden funcionar sin S3 (guardan localmente en `/data`)
- Formato CSV para compatibilidad con Athena
- JSON adicional para backup y análisis
- Extracción paginada para manejar grandes volúmenes
- Timeouts configurados para evitar bloqueos
