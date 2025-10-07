#!/bin/bash

# ⚠️  CONFIGURACIÓN PARA AWS ACADEMY ⚠️
# AWS Academy tiene restricciones: NO se pueden crear roles IAM ni usar instancias con roles
# Se deben usar credenciales montadas desde ~/.aws/credentials

set -e

# Variables - Ajustar según tu cuenta AWS Academy
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_PROFILE="${AWS_PROFILE:-default}"
S3_BUCKET="${S3_BUCKET:-inventario-datalake-$(date +%s)}"  # Nombre único con timestamp
DATABASE_NAME="inventario_db"

echo "========================================="
echo "Configuración AWS Glue y Athena"
echo "🎓 MODO AWS ACADEMY (sin roles IAM)"
echo "========================================="
echo "Región: $AWS_REGION"
echo "Perfil AWS: $AWS_PROFILE"
echo "Bucket: s3://$S3_BUCKET"
echo "Base de datos: $DATABASE_NAME"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Asegúrate de tener ~/.aws/credentials configurado"
echo "   - AWS Academy sessions expiran cada 4 horas"
echo "   - Ejecuta 'aws configure --profile default' si es necesario"
echo ""
read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."

# 1. Crear bucket S3 si no existe
echo ""
echo "1️⃣  Verificando bucket S3..."
if aws s3 ls "s3://$S3_BUCKET" --profile $AWS_PROFILE 2>/dev/null; then
    echo "✓ Bucket s3://$S3_BUCKET ya existe"
else
    echo "Creando bucket s3://$S3_BUCKET..."
    aws s3 mb "s3://$S3_BUCKET" --region $AWS_REGION --profile $AWS_PROFILE
    echo "✓ Bucket creado"
fi

# Crear carpetas en S3
echo "Creando estructura de carpetas en S3..."
aws s3api put-object --bucket $S3_BUCKET --key "productos/" --profile $AWS_PROFILE 2>/dev/null || true
aws s3api put-object --bucket $S3_BUCKET --key "ordenes/" --profile $AWS_PROFILE 2>/dev/null || true
aws s3api put-object --bucket $S3_BUCKET --key "clientes/" --profile $AWS_PROFILE 2>/dev/null || true
aws s3api put-object --bucket $S3_BUCKET --key "proveedores/" --profile $AWS_PROFILE 2>/dev/null || true
aws s3api put-object --bucket $S3_BUCKET --key "detalles_orden/" --profile $AWS_PROFILE 2>/dev/null || true
aws s3api put-object --bucket $S3_BUCKET --key "athena-results/" --profile $AWS_PROFILE 2>/dev/null || true
echo "✓ Estructura de carpetas creada"

# 2. Crear base de datos Glue
echo ""
echo "2️⃣  Configurando base de datos Glue..."
aws glue create-database \
    --database-input "{\"Name\": \"$DATABASE_NAME\", \"Description\": \"Base de datos del sistema de inventarios\"}" \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "✓ Base de datos $DATABASE_NAME ya existe"

# 3. ⚠️  IMPORTANTE: AWS ACADEMY - Usar LabRole existente
echo ""
echo "3️⃣  Buscando rol de laboratorio de AWS Academy..."

# En AWS Academy, existe un rol LabRole que se puede usar
# Obtener el account ID
ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query Account --output text)
echo "✓ Account ID: $ACCOUNT_ID"

# Construir el ARN del LabRole (estándar en AWS Academy)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/LabRole"
echo "✓ Usando LabRole: $ROLE_ARN"
echo ""
echo "⚠️  NOTA: Si LabRole no existe o no tiene permisos,"
echo "   deberás crear las tablas manualmente en Athena usando SQL"
echo ""

# 4. Crear tablas manualmente en Glue (alternativa a crawlers en AWS Academy)
echo ""
echo "4️⃣  Creando tablas Glue manualmente..."
echo "   (AWS Academy puede restringir crawlers, usamos tablas directas)"
echo ""

# Tabla: productos
echo "Creando tabla: productos..."
aws glue create-table \
    --database-name $DATABASE_NAME \
    --table-input '{
        "Name": "productos",
        "StorageDescriptor": {
            "Columns": [
                {"Name": "id", "Type": "bigint"},
                {"Name": "nombre", "Type": "string"},
                {"Name": "descripcion", "Type": "string"},
                {"Name": "precio", "Type": "double"},
                {"Name": "stock", "Type": "int"},
                {"Name": "categoria", "Type": "string"},
                {"Name": "proveedor", "Type": "string"},
                {"Name": "sku", "Type": "string"},
                {"Name": "fecha_creacion", "Type": "timestamp"},
                {"Name": "fecha_actualizacion", "Type": "timestamp"}
            ],
            "Location": "s3://'"$S3_BUCKET"'/productos/",
            "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
            "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
            "SerdeInfo": {
                "SerializationLibrary": "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
                "Parameters": {
                    "field.delim": ",",
                    "skip.header.line.count": "1"
                }
            }
        }
    }' \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "✓ Tabla productos ya existe"

# Tabla: ordenes
echo "Creando tabla: ordenes..."
aws glue create-table \
    --database-name $DATABASE_NAME \
    --table-input '{
        "Name": "ordenes",
        "StorageDescriptor": {
            "Columns": [
                {"Name": "id", "Type": "bigint"},
                {"Name": "numero_orden", "Type": "string"},
                {"Name": "cliente_id", "Type": "bigint"},
                {"Name": "fecha_orden", "Type": "timestamp"},
                {"Name": "estado", "Type": "string"},
                {"Name": "total", "Type": "double"},
                {"Name": "metodo_pago", "Type": "string"},
                {"Name": "direccion_envio", "Type": "string"}
            ],
            "Location": "s3://'"$S3_BUCKET"'/ordenes/",
            "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
            "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
            "SerdeInfo": {
                "SerializationLibrary": "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
                "Parameters": {
                    "field.delim": ",",
                    "skip.header.line.count": "1"
                }
            }
        }
    }' \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "✓ Tabla ordenes ya existe"

# Tabla: clientes
echo "Creando tabla: clientes..."
aws glue create-table \
    --database-name $DATABASE_NAME \
    --table-input '{
        "Name": "clientes",
        "StorageDescriptor": {
            "Columns": [
                {"Name": "id", "Type": "bigint"},
                {"Name": "nombre", "Type": "string"},
                {"Name": "email", "Type": "string"},
                {"Name": "telefono", "Type": "string"},
                {"Name": "direccion", "Type": "string"},
                {"Name": "ciudad", "Type": "string"},
                {"Name": "pais", "Type": "string"},
                {"Name": "fecha_registro", "Type": "timestamp"}
            ],
            "Location": "s3://'"$S3_BUCKET"'/clientes/",
            "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
            "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
            "SerdeInfo": {
                "SerializationLibrary": "org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe",
                "Parameters": {
                    "field.delim": ",",
                    "skip.header.line.count": "1"
                }
            }
        }
    }' \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "✓ Tabla clientes ya existe"

# Tabla: proveedores (JSON format)
echo "Creando tabla: proveedores..."
aws glue create-table \
    --database-name $DATABASE_NAME \
    --table-input '{
        "Name": "proveedores",
        "StorageDescriptor": {
            "Columns": [
                {"Name": "nombre", "Type": "string"},
                {"Name": "ruc", "Type": "string"},
                {"Name": "email", "Type": "string"},
                {"Name": "telefono", "Type": "string"},
                {"Name": "estado", "Type": "string"},
                {"Name": "estado_entrega", "Type": "string"},
                {"Name": "calificacion", "Type": "double"}
            ],
            "Location": "s3://'"$S3_BUCKET"'/proveedores/",
            "InputFormat": "org.apache.hadoop.mapred.TextInputFormat",
            "OutputFormat": "org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat",
            "SerdeInfo": {
                "SerializationLibrary": "org.openx.data.jsonserde.JsonSerDe"
            }
        }
    }' \
    --profile $AWS_PROFILE \
    --region $AWS_REGION 2>/dev/null || echo "✓ Tabla proveedores ya existe"

echo "✓ Tablas creadas en Glue Catalog"

# 5. Guardar configuración en archivo .env
echo ""
echo "5️⃣  Guardando configuración..."
cat > ../ingesta/.env <<EOF
# Configuración AWS para Sistema de Inventarios
AWS_REGION=$AWS_REGION
AWS_PROFILE=$AWS_PROFILE
S3_BUCKET=$S3_BUCKET
ATHENA_DATABASE=$DATABASE_NAME
ATHENA_OUTPUT_LOCATION=s3://$S3_BUCKET/athena-results/
EOF
echo "✓ Configuración guardada en ingesta/.env"

echo ""
echo "========================================="
echo "✓ Configuración completada para AWS Academy"
echo "========================================="
echo ""
echo "📋 Información creada:"
echo "   ✓ Bucket S3: s3://$S3_BUCKET"
echo "   ✓ Base de datos Glue: $DATABASE_NAME"
echo "   ✓ Tablas: productos, ordenes, clientes, proveedores"
echo "   ✓ Rol utilizado: $ROLE_ARN"
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Ejecutar el sistema de ingesta para cargar datos a S3:"
echo "   cd ../ingesta"
echo "   docker-compose up -d"
echo ""
echo "2. Verificar datos en S3:"
echo "   aws s3 ls s3://$S3_BUCKET/productos/ --profile $AWS_PROFILE"
echo ""
echo "3. Probar consultas en Athena Console:"
echo "   https://$AWS_REGION.console.aws.amazon.com/athena/home?region=$AWS_REGION"
echo ""
echo "4. Consulta de prueba en Athena:"
echo "   SELECT COUNT(*) FROM $DATABASE_NAME.productos;"
echo ""
echo "🔗 Enlaces útiles:"
echo "   S3 Console: https://s3.console.aws.amazon.com/s3/buckets/$S3_BUCKET"
echo "   Glue Console: https://$AWS_REGION.console.aws.amazon.com/glue/home?region=$AWS_REGION#catalog:tab=databases"
echo "   Athena Console: https://$AWS_REGION.console.aws.amazon.com/athena/home?region=$AWS_REGION"
echo ""
echo "⚠️  RECORDATORIO AWS ACADEMY:"
echo "   - Las sesiones expiran cada 4 horas"
echo "   - Renueva credenciales en AWS Details > AWS CLI: Show"
echo "   - Actualiza ~/.aws/credentials con las nuevas credenciales"
echo ""

