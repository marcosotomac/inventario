cd ~/app

# Exportar las variables manualmente
export S3_BUCKET=inventario-datalake-2025
export AWS_REGION=us-east-1
export AWS_PROFILE=default
export PRODUCTOS_SERVICE_URL=http://52.6.92.4:5001
export ORDENES_SERVICE_URL=http://52.6.92.4:8080
export PROVEEDORES_SERVICE_URL=http://52.6.92.4:3000

# Verificar que se exportaron
echo $PRODUCTOS_SERVICE_URL

# Ahora ejecutar el script
cd ~/app/ingesta/ingesta-productos
python3 ingest.py