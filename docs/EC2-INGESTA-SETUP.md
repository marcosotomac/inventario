# 📊 GUÍA: Configurar Servicios de Ingesta en EC2 (100% CLICKS)

**Para AWS Academy - Ingesta de datos a S3 desde microservicios**

---

## **📋 Pre-requisitos**

✅ Instancia EC2 con microservicios corriendo y funcionando  
✅ Bases de datos en EC2 con datos  
✅ Bucket S3 creado (lo crearemos en esta guía)  
✅ Credenciales AWS configuradas

---

## **PARTE 1: Crear Bucket S3 para Data Lake**

### **Paso 1: Acceder a S3**

1. AWS Academy → **Start Lab** → **AWS**
2. Buscar **"S3"** y click en el servicio

### **Paso 2: Crear Bucket**

1. Click en **"Create bucket"** (botón naranja)
2. **Bucket name**: `inventario-datalake-XXXXX`
   - ⚠️ Reemplaza `XXXXX` con un número único (ej: `inventario-datalake-2025`)
   - Debe ser globalmente único
3. **AWS Region**: **us-east-1**
4. **Block Public Access settings**: Deja todo marcado (seguridad)
5. **Bucket Versioning**: Disabled (para ahorrar costos)
6. **Tags** (opcional):
   - Key: `Project`, Value: `Inventario`
   - Key: `Environment`, Value: `Production`
7. Click **"Create bucket"**

### **Paso 3: Crear Estructura de Carpetas**

1. Click en tu bucket recién creado
2. Click **"Create folder"**
3. Crear estas carpetas (una por una):
   - `raw/productos/`
   - `raw/ordenes/`
   - `raw/proveedores/`
   - `processed/productos/`
   - `processed/ordenes/`
   - `processed/proveedores/`
   - `athena-results/`

✅ Tu bucket ahora tiene la estructura del Data Lake.

---

## **PARTE 2: Configurar Credenciales AWS en EC2**

### **Paso 4: Obtener Credenciales AWS Academy**

1. En AWS Academy, click en **"AWS Details"**
2. Click en **"Show"** junto a "AWS CLI"
3. Copia TODO el contenido que aparece (son las credenciales)

### **Paso 5: Configurar AWS CLI en EC2**

Conecta a tu instancia EC2 de microservicios (Instance Connect):

```bash
# Instalar AWS CLI
sudo dnf install -y aws-cli

# Verificar instalación
aws --version
```

### **Paso 6: Crear Archivo de Credenciales**

```bash
# Crear directorio .aws
mkdir -p ~/.aws

# Crear archivo de credenciales
nano ~/.aws/credentials
```

**Pega el contenido** que copiaste en el Paso 4, debe verse así:

```ini
[default]
aws_access_key_id = ASIAXXXXXXXXXXXXXXXXX
aws_secret_access_key = XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
aws_session_token = IQoJb3JpZ2luX2VjE...XXXXXXX...
```

Guarda: `Ctrl+X`, `Y`, `ENTER`

### **Paso 7: Configurar Región**

```bash
# Crear archivo de configuración
nano ~/.aws/config
```

Pega esto:

```ini
[default]
region = us-east-1
output = json
```

Guarda: `Ctrl+X`, `Y`, `ENTER`

### **Paso 8: Probar Conexión a S3**

```bash
# Listar buckets
aws s3 ls

# Listar contenido de tu bucket
aws s3 ls s3://inventario-datalake-2025/

# Ver estructura de carpetas
aws s3 ls s3://inventario-datalake-2025/raw/
```

Deberías ver tus carpetas creadas. ✅

---

## **PARTE 3: Configurar Servicios de Ingesta**

### **Paso 9: Instalar Git y Clonar Repositorio**

⚠️ **IMPORTANTE:** Estás en una instancia NUEVA (diferente a la de microservicios).

```bash
# Instalar Git
sudo dnf install -y git

# Verificar instalación
git --version

# Crear directorio de trabajo
mkdir -p ~/app
cd ~/app

# Clonar el repositorio
git clone https://github.com/marcosotomac/inventario.git .

# Verificar que se clonó correctamente
ls -la
```

Deberías ver las carpetas: `backend/`, `frontend/`, `ingesta/`, `docs/`

### **Paso 10: Crear archivo .env para Ingesta**

```bash
cd ~/app
nano .env
```


**Copia y pega todo esto** (reemplaza los valores marcados con 🔴):

```bash
# ========================================
# AWS S3 CONFIGURATION (Data Lake)
# ========================================
S3_BUCKET=inventario-datalake-2025  # 🔴 Reemplaza con el nombre de TU bucket
AWS_REGION=us-east-1
AWS_PROFILE=default

# ========================================
# MICROSERVICES URLS (para ingesta)
# ========================================
# 🔴 REEMPLAZA con la IP PÚBLICA o ELASTIC IP de la instancia de microservicios
# Ejemplo: http://54.123.45.67:5001
PRODUCTOS_SERVICE_URL=http://52.6.92.4:5001
ORDENES_SERVICE_URL=http://52.6.92.4:8080
PROVEEDORES_SERVICE_URL=http://52.6.92.4:3000
```

**Ejemplo con IP real:**

```bash
S3_BUCKET=inventario-datalake-2025
AWS_REGION=us-east-1
AWS_PROFILE=default

PRODUCTOS_SERVICE_URL=http://54.123.45.67:5001
ORDENES_SERVICE_URL=http://54.123.45.67:8080
PROVEEDORES_SERVICE_URL=http://54.123.45.67:3000
```

Guarda: `Ctrl+X`, `Y`, `ENTER`

### **📝 ¿Cómo obtener la IP de microservicios?**

1. Ve a **EC2 Console**
2. Busca tu instancia de **microservicios**
3. Copia la **IP Pública** o **Elastic IP**
4. Úsala en el archivo `.env`

---

## **PARTE 4: Ejecutar Ingesta Manualmente (Recomendado para la primera vez)**

### **Paso 11: Instalar Dependencias Python**

```bash
cd ~/app

# Instalar Python y pip
sudo dnf install -y python3 python3-pip

# Verificar instalación
python3 --version
pip3 --version

# Instalar dependencias de ingesta
pip3 install boto3 requests python-dotenv
```

### **Paso 12: Ejecutar Ingesta de Productos**

```bash
cd ~/app/ingesta/ingesta-productos

# Ejecutar script
python3 ingest.py
```

Deberías ver:

```
✓ Cliente S3 inicializado (Bucket: inventario-datalake-2025)
📥 Extrayendo productos desde http://54.123.45.67:5001...
✓ Extraídos 100 productos
📊 Transformando datos...
✓ Datos transformados
☁️ Subiendo a S3...
✓ Archivo subido: raw/productos/productos_2025-10-06.json
✓ Archivo subido: processed/productos/productos_2025-10-06.csv
```

### **Paso 13: Ejecutar Ingesta de Ordenes**

```bash
cd ~/app/ingesta/ingesta-ordenes
python3 ingest.py
```

### **Paso 14: Ejecutar Ingesta de Proveedores**

```bash
cd ~/app/ingesta/ingesta-proveedores
python3 ingest.py
```

### **Paso 15: Verificar en S3**

```bash
# Ver archivos en S3
aws s3 ls s3://inventario-datalake-2025/raw/productos/
aws s3 ls s3://inventario-datalake-2025/raw/ordenes/
aws s3 ls s3://inventario-datalake-2025/raw/proveedores/

# Ver archivos procesados
aws s3 ls s3://inventario-datalake-2025/processed/productos/
aws s3 ls s3://inventario-datalake-2025/processed/ordenes/
aws s3 ls s3://inventario-datalake-2025/processed/proveedores/
```

---

## **PARTE 5: Opción AVANZADA - Automatizar con Docker Compose**

⚠️ **Esta opción es más compleja. Si es tu primera vez, salta a la PARTE 6 (Cron).**

### **Paso 15: Crear docker-compose para Ingesta**

```bash
cd ~/app
nano docker-compose.ingesta.yml
```

Copia y pega:

```yaml
version: "3.8"

services:
  ingesta-productos:
    build: ./ingesta/ingesta-productos
    container_name: ingesta-productos
    environment:
      AWS_REGION: ${AWS_REGION}
      AWS_PROFILE: ${AWS_PROFILE}
      S3_BUCKET: ${S3_BUCKET}
      PRODUCTOS_SERVICE_URL: http://productos-service:5001
    volumes:
      - ~/.aws:/root/.aws:ro
    networks:
      - inventario-network
    depends_on:
      - productos-service
    restart: "no"

  ingesta-ordenes:
    build: ./ingesta/ingesta-ordenes
    container_name: ingesta-ordenes
    environment:
      AWS_REGION: ${AWS_REGION}
      AWS_PROFILE: ${AWS_PROFILE}
      S3_BUCKET: ${S3_BUCKET}
      ORDENES_SERVICE_URL: http://ordenes-service:8080
    volumes:
      - ~/.aws:/root/.aws:ro
    networks:
      - inventario-network
    depends_on:
      - ordenes-service
    restart: "no"

  ingesta-proveedores:
    build: ./ingesta/ingesta-proveedores
    container_name: ingesta-proveedores
    environment:
      AWS_REGION: ${AWS_REGION}
      AWS_PROFILE: ${AWS_PROFILE}
      S3_BUCKET: ${S3_BUCKET}
      PROVEEDORES_SERVICE_URL: http://proveedores-service:3000
    volumes:
      - ~/.aws:/root/.aws:ro
    networks:
      - inventario-network
    depends_on:
      - proveedores-service
    restart: "no"

networks:
  inventario-network:
    external: true
```

Guarda: `Ctrl+X`, `Y`, `ENTER`

### **Paso 16: Construir Imágenes de Ingesta**

```bash
cd ~/app

# Construir servicios de ingesta
docker-compose -f docker-compose.ingesta.yml build
```

### **Paso 17: Ejecutar Ingesta con Docker**

```bash
# Ejecutar todos los servicios de ingesta
docker-compose -f docker-compose.ingesta.yml up

# O ejecutar uno por uno
docker-compose -f docker-compose.ingesta.yml run ingesta-productos
docker-compose -f docker-compose.ingesta.yml run ingesta-ordenes
docker-compose -f docker-compose.ingesta.yml run ingesta-proveedores
```

---

## **PARTE 6: Automatizar con Cron (Ejecución Programada)**

### **Paso 18: Crear Script de Ingesta**

```bash
cd ~/app
nano run-ingesta.sh
```

Pega esto:

```bash
#!/bin/bash

# Script para ejecutar ingesta de datos
# Uso: ./run-ingesta.sh [productos|ordenes|proveedores|all]

APP_DIR="/home/ec2-user/app"
LOG_DIR="$APP_DIR/logs"

# Crear directorio de logs si no existe
mkdir -p $LOG_DIR

# Cargar variables de entorno
export $(cat $APP_DIR/.env | grep -v '^#' | xargs)

# Timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Función para ejecutar ingesta
run_ingesta() {
    SERVICE=$1
    echo "$(date) - Ejecutando ingesta de $SERVICE..."

    cd $APP_DIR/ingesta/ingesta-$SERVICE
    python3 ingest.py >> $LOG_DIR/ingesta-$SERVICE-$TIMESTAMP.log 2>&1

    if [ $? -eq 0 ]; then
        echo "$(date) - ✓ Ingesta de $SERVICE completada"
    else
        echo "$(date) - ✗ Error en ingesta de $SERVICE"
    fi
}

# Ejecutar según parámetro
case "$1" in
    productos)
        run_ingesta "productos"
        ;;
    ordenes)
        run_ingesta "ordenes"
        ;;
    proveedores)
        run_ingesta "proveedores"
        ;;
    all|"")
        run_ingesta "productos"
        run_ingesta "ordenes"
        run_ingesta "proveedores"
        ;;
    *)
        echo "Uso: $0 [productos|ordenes|proveedores|all]"
        exit 1
        ;;
esac

echo "$(date) - Ingesta finalizada"
```

Guarda y da permisos:

```bash
chmod +x run-ingesta.sh
```

### **Paso 19: Probar el Script**

```bash
# Ejecutar ingesta completa
./run-ingesta.sh all

# Ver logs
ls -la logs/
tail -f logs/ingesta-productos-*.log
```

### **Paso 20: Configurar Cron para Ejecución Diaria**

```bash
# Editar crontab
crontab -e
```

Presiona `i` para insertar, luego pega:

```bash
# Ejecutar ingesta todos los días a las 2:00 AM
0 2 * * * /home/ec2-user/app/run-ingesta.sh all >> /home/ec2-user/app/logs/cron.log 2>&1

# Ejecutar ingesta cada 6 horas
0 */6 * * * /home/ec2-user/app/run-ingesta.sh all >> /home/ec2-user/app/logs/cron.log 2>&1

# Ejecutar ingesta cada hora (solo descomenta si lo necesitas)
# 0 * * * * /home/ec2-user/app/run-ingesta.sh all >> /home/ec2-user/app/logs/cron.log 2>&1
```

Guarda: `Esc`, `:wq`, `ENTER`

### **Paso 21: Verificar Cron**

```bash
# Ver tareas programadas
crontab -l

# Ver logs de cron
tail -f ~/app/logs/cron.log
```

---

## **🔧 COMANDOS ÚTILES**

### **Ejecutar Ingesta Manualmente**

```bash
# Todas las ingestas
~/app/run-ingesta.sh all

# Solo productos
~/app/run-ingesta.sh productos

# Solo ordenes
~/app/run-ingesta.sh ordenes

# Solo proveedores
~/app/run-ingesta.sh proveedores
```

### **Ver Logs**

```bash
# Logs recientes de ingesta
ls -lh ~/app/logs/

# Ver log específico
tail -f ~/app/logs/ingesta-productos-*.log

# Ver últimas 100 líneas
tail -100 ~/app/logs/ingesta-ordenes-*.log
```

### **Verificar Archivos en S3**

```bash
# Listar todos los archivos
aws s3 ls s3://inventario-datalake-2025/ --recursive --human-readable

# Ver archivos de hoy
aws s3 ls s3://inventario-datalake-2025/raw/productos/ | grep $(date +"%Y-%m-%d")

# Contar archivos
aws s3 ls s3://inventario-datalake-2025/raw/ --recursive | wc -l

# Ver tamaño total
aws s3 ls s3://inventario-datalake-2025/raw/ --recursive --summarize
```

### **Descargar Archivo de S3 (para verificar)**

```bash
# Descargar un archivo
aws s3 cp s3://inventario-datalake-2025/raw/productos/productos_2025-10-06.json ~/

# Ver contenido
cat ~/productos_2025-10-06.json | head -20
```

---

## **🆘 TROUBLESHOOTING**

### **Error: Unable to locate credentials**

```bash
# Verificar que existen las credenciales
cat ~/.aws/credentials

# Verificar configuración
cat ~/.aws/config

# Probar conexión
aws s3 ls
```

**Solución:** Re-obtener credenciales de AWS Academy (expiran cada 4 horas).

### **Error: Access Denied al subir a S3**

```bash
# Verificar que el bucket existe
aws s3 ls | grep inventario

# Verificar permisos
aws s3 ls s3://inventario-datalake-2025/
```

**Solución:** Verifica que usas el nombre correcto del bucket.

### **Error: Connection refused al conectar a microservicio**

```bash
# Verificar que los microservicios están corriendo
docker ps | grep -E "productos|ordenes|proveedores"

# Probar conexión
curl http://localhost:5001/health
curl http://localhost:8080/actuator/health
curl http://localhost:3000/health
```

**Solución:** Asegúrate de que los microservicios están activos.

### **Cron no ejecuta la ingesta**

```bash
# Ver si cron está corriendo
sudo systemctl status crond

# Iniciar cron si está detenido
sudo systemctl start crond
sudo systemctl enable crond

# Ver logs del sistema
sudo tail -f /var/log/cron
```

---

## **📊 ARQUITECTURA DE INGESTA**

```
┌──────────────────────────────────────────────────────────┐
│              EC2: servidor-microservicios                 │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Microservicios                                     │  │
│  │  - productos-service:5001                          │  │
│  │  - ordenes-service:8080                            │  │
│  │  - proveedores-service:3000                        │  │
│  └─────────────────┬──────────────────────────────────┘  │
│                    │                                      │
│  ┌─────────────────▼──────────────────────────────────┐  │
│  │  Servicios de Ingesta (Cron)                       │  │
│  │  - ingesta-productos.py                            │  │
│  │  - ingesta-ordenes.py                              │  │
│  │  - ingesta-proveedores.py                          │  │
│  └─────────────────┬──────────────────────────────────┘  │
└────────────────────┼──────────────────────────────────────┘
                     │
                     │ AWS SDK (boto3)
                     ▼
┌──────────────────────────────────────────────────────────┐
│                    AWS S3 Bucket                          │
│              inventario-datalake-2025                    │
│                                                           │
│  /raw/                    /processed/                    │
│    ├── productos/           ├── productos/               │
│    ├── ordenes/             ├── ordenes/                 │
│    └── proveedores/         └── proveedores/             │
│                                                           │
│  /athena-results/                                        │
└──────────────────────────────────────────────────────────┘
```

---

## **✅ CHECKLIST FINAL**

- [ ] Bucket S3 creado con estructura de carpetas
- [ ] Credenciales AWS configuradas en EC2
- [ ] Archivo .env actualizado con nombre del bucket
- [ ] Python y dependencias instaladas
- [ ] Ingesta manual ejecutada exitosamente
- [ ] Archivos visibles en S3
- [ ] Script de automatización creado
- [ ] Cron configurado (opcional)
- [ ] Logs funcionando correctamente

---

## **🎉 ¡INGESTA CONFIGURADA!**

Ahora tienes:

- ✅ Data Lake en S3 con estructura organizada
- ✅ Servicios de ingesta funcionando
- ✅ Datos extrayéndose de microservicios
- ✅ Archivos JSON y CSV en S3
- ✅ Automatización con cron (opcional)
- ✅ Logs para monitoreo

**Próximos pasos**:

1. Configurar AWS Glue para catálogo de datos
2. Configurar Athena para consultas SQL
3. Crear dashboards en QuickSight (opcional)

---

## **📝 NOTAS IMPORTANTES**

### **Credenciales AWS Academy**

- Las credenciales **expiran cada 4 horas**
- Debes renovarlas antes de ejecutar ingesta
- El script detectará si expiraron y te avisará

### **Costos S3**

- AWS Academy tiene créditos limitados
- Los archivos pequeños son casi gratis
- Borra archivos antiguos periódicamente:
  ```bash
  # Borrar archivos mayores a 30 días
  aws s3 ls s3://inventario-datalake-2025/raw/ --recursive |
    awk '{if($1 < "2024-09-06") print $4}' |
    xargs -I {} aws s3 rm s3://inventario-datalake-2025/{}
  ```

### **Frecuencia de Ingesta**

- **Desarrollo**: Manual o cada 6 horas
- **Producción**: Diaria (2:00 AM recomendado)
- **Alta frecuencia**: Cada hora (solo si es necesario)
