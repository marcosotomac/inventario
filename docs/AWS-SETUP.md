# Configuración de AWS Glue, Athena y Data Lake

Esta carpeta contiene scripts y documentación para configurar la infraestructura de análisis de datos en AWS.

## 📋 Componentes

### 1. AWS S3 (Data Lake)

Bucket central para almacenar datos extraídos de los microservicios.

**Estructura:**

```
s3://inventario-datalake/
├── productos/
│   ├── productos_20251006_120000.csv
│   └── productos_20251006_120000.json
├── ordenes/
│   ├── ordenes_20251006_120000.csv
│   └── ordenes_20251006_120000.json
├── clientes/
│   ├── clientes_20251006_120000.csv
│   └── clientes_20251006_120000.json
├── proveedores/
│   ├── proveedores_20251006_120000.csv
│   └── proveedores_20251006_120000.json
├── categorias/
│   └── categorias_20251006_120000.csv
└── athena-results/
    └── (resultados de consultas)
```

### 2. AWS Glue

Servicio de catalogación y ETL.

**Componentes:**

- **Database:** `inventario_db`
- **Crawlers:** Detectan automáticamente esquemas de datos
  - productos-crawler
  - ordenes-crawler
  - clientes-crawler
  - proveedores-crawler
  - categorias-crawler
- **Tables:** Tablas catalogadas automáticamente

### 3. AWS Athena

Motor de consultas SQL serverless.

**Configuración:**

- Database: `inventario_db`
- Output location: `s3://inventario-datalake/athena-results/`
- Formato: CSV con headers

## 🚀 Setup Inicial

### Paso 1: Configurar AWS CLI

```bash
# Configurar credenciales
aws configure --profile default

# Verificar configuración
aws sts get-caller-identity --profile default
```

### Paso 2: Ejecutar Script de Configuración

```bash
# Dar permisos de ejecución
chmod +x setup-aws-glue.sh

# Ejecutar script
./setup-aws-glue.sh

# Con variables personalizadas
AWS_REGION=us-east-1 \
S3_BUCKET=mi-bucket-inventario \
./setup-aws-glue.sh
```

El script:

1. ✅ Crea bucket S3
2. ✅ Crea estructura de carpetas
3. ✅ Crea database Glue
4. ✅ Configura rol IAM para crawlers
5. ✅ Crea 5 crawlers
6. ✅ Ejecuta crawlers inicialmente

### Paso 3: Verificar Crawlers

```bash
# Ver estado de un crawler
aws glue get-crawler \
    --name productos-crawler \
    --profile default \
    --query 'Crawler.State'

# Listar todos los crawlers
aws glue list-crawlers --profile default

# Ver última ejecución
aws glue get-crawler \
    --name productos-crawler \
    --profile default \
    --query 'Crawler.LastCrawl'
```

### Paso 4: Verificar Tablas Catalogadas

```bash
# Listar tablas
aws glue get-tables \
    --database-name inventario_db \
    --profile default \
    --query 'TableList[*].Name'

# Ver esquema de una tabla
aws glue get-table \
    --database-name inventario_db \
    --name productos \
    --profile default
```

## 📊 Diagrama Entidad-Relación del Catálogo

```
┌─────────────────┐
│   categorias    │
│─────────────────│
│ id (INT)        │
│ nombre (STR)    │
│ descripcion     │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────────┐
│       productos             │
│─────────────────────────────│
│ id (INT)            PK      │
│ nombre (STR)                │
│ descripcion (STR)           │
│ precio (DOUBLE)             │
│ stock (INT)                 │
│ categoria (STR)      FK     │
│ proveedor (STR)      FK     │
│ sku (STR)                   │
│ fecha_creacion (TS)         │
└──────────┬──────────────────┘
           │
           │ N:1
           │
     ┌─────▼──────────────┐
     │    proveedores     │
     │────────────────────│
     │ id (STR)      PK   │
     │ nombre (STR)       │
     │ ruc (STR)          │
     │ email (STR)        │
     │ calificacion       │
     │ estado (STR)       │
     │ estado_entrega     │
     │ categorias (ARR)   │
     │ estadisticas (OBJ) │
     └────────────────────┘

┌─────────────────┐
│    clientes     │
│─────────────────│
│ id (INT)   PK   │
│ nombre (STR)    │
│ email (STR)     │
│ telefono        │
│ direccion       │
│ ciudad          │
│ pais            │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│       ordenes           │
│─────────────────────────│
│ id (INT)           PK   │
│ numero_orden (STR)      │
│ cliente_id (INT)   FK   │
│ fecha_orden (TS)        │
│ estado (STR)            │
│ total (DOUBLE)          │
│ metodo_pago (STR)       │
└────────┬────────────────┘
         │
         │ 1:N
         │
┌────────▼────────────────┐
│   detalles_orden        │
│─────────────────────────│
│ id (INT)           PK   │
│ orden_id (INT)     FK   │
│ producto_id (INT)  FK   │
│ cantidad (INT)          │
│ precio_unitario (DBL)   │
│ subtotal (DOUBLE)       │
└─────────────────────────┘
```

## 🔍 Consultas Athena

### Uso de la Consola

1. Ir a: https://console.aws.amazon.com/athena
2. Configurar query result location:
   - Settings → Manage
   - Location: `s3://inventario-datalake/athena-results/`
3. Seleccionar database: `inventario_db`
4. Ejecutar consultas del archivo `athena-queries.sql`

### Uso de AWS CLI

```bash
# Ejecutar consulta
aws athena start-query-execution \
    --query-string "SELECT * FROM productos LIMIT 10" \
    --query-execution-context Database=inventario_db \
    --result-configuration OutputLocation=s3://inventario-datalake/athena-results/ \
    --profile default

# Ver resultados
aws athena get-query-execution \
    --query-execution-id <execution-id> \
    --profile default
```

### Consultas Principales

Ver archivo `athena-queries.sql` para:

1. ✅ Top 50 Productos Más Vendidos
2. ✅ Análisis de Ventas Mensuales
3. ✅ Proveedores con Mejor Desempeño
4. ✅ Clientes VIP
5. ✅ Vistas: Stock Crítico, Rentabilidad por Categoría

## 🔧 Mantenimiento

### Actualizar Catálogo

```bash
# Ejecutar crawler manualmente
aws glue start-crawler \
    --name productos-crawler \
    --profile default

# Ejecutar todos los crawlers
for crawler in productos-crawler ordenes-crawler clientes-crawler proveedores-crawler categorias-crawler; do
    aws glue start-crawler --name $crawler --profile default
done
```

### Programar Ejecución Automática

```bash
# Configurar crawler para ejecutarse diariamente
aws glue update-crawler \
    --name productos-crawler \
    --schedule "cron(0 2 * * ? *)" \
    --profile default
```

### Limpiar Datos Antiguos

```bash
# Eliminar archivos de más de 30 días
aws s3 ls s3://inventario-datalake/productos/ --recursive | \
    awk '{if ($1 < "2025-09-06") print $4}' | \
    xargs -I {} aws s3 rm s3://inventario-datalake/{}
```

## 💰 Optimización de Costos

### Particionamiento

```sql
-- Crear tabla particionada por fecha
CREATE EXTERNAL TABLE productos_partitioned (
    id INT,
    nombre STRING,
    precio DOUBLE,
    stock INT
)
PARTITIONED BY (year INT, month INT, day INT)
STORED AS PARQUET
LOCATION 's3://inventario-datalake/productos-partitioned/';

-- Agregar particiones
ALTER TABLE productos_partitioned
ADD PARTITION (year=2025, month=10, day=6)
LOCATION 's3://inventario-datalake/productos-partitioned/2025/10/06/';
```

### Compresión

```bash
# Convertir CSV a Parquet (más eficiente)
# Usar AWS Glue ETL job o Spark
```

### Lifecycle Policies

```json
{
  "Rules": [
    {
      "Id": "ArchiveOldData",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

## 🔐 Seguridad

### Políticas IAM Mínimas

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::inventario-datalake",
        "arn:aws:s3:::inventario-datalake/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["glue:GetDatabase", "glue:GetTable", "glue:GetPartitions"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "athena:StartQueryExecution",
        "athena:GetQueryExecution",
        "athena:GetQueryResults"
      ],
      "Resource": "*"
    }
  ]
}
```

### Encriptación

```bash
# Habilitar encriptación en el bucket
aws s3api put-bucket-encryption \
    --bucket inventario-datalake \
    --server-side-encryption-configuration \
    '{"Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]}'
```

## 📈 Monitoreo

### CloudWatch Metrics

- Glue Crawler éxito/fallo
- Athena queries ejecutadas
- Costo por consulta
- Datos escaneados

### Alertas

```bash
# Crear alarma para fallos de crawler
aws cloudwatch put-metric-alarm \
    --alarm-name glue-crawler-failures \
    --metric-name CrawlerFailed \
    --namespace AWS/Glue \
    --statistic Sum \
    --period 3600 \
    --evaluation-periods 1 \
    --threshold 1 \
    --comparison-operator GreaterThanThreshold
```

## 🐛 Troubleshooting

**Problema: Crawler no encuentra datos**

- Verificar que haya archivos en S3
- Verificar formato de archivos (CSV válido)
- Revisar logs del crawler

**Problema: Consultas Athena fallan**

- Verificar tipos de datos
- Usar CAST() para conversiones
- Verificar location de resultados

**Problema: Permisos denegados**

- Verificar rol IAM del crawler
- Verificar políticas de bucket S3
- Verificar KMS keys si hay encriptación

## 📚 Referencias

- [AWS Glue Documentation](https://docs.aws.amazon.com/glue/)
- [AWS Athena Documentation](https://docs.aws.amazon.com/athena/)
- [Athena Best Practices](https://docs.aws.amazon.com/athena/latest/ug/performance-tuning.html)
