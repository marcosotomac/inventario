import boto3
import requests
import json
import csv
import os
from datetime import datetime
from io import StringIO
import time

# Configuración AWS
AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_PROFILE = os.getenv('AWS_PROFILE', 'default')
S3_BUCKET = os.getenv('S3_BUCKET', 'inventario-datalake')
PRODUCTOS_SERVICE_URL = os.getenv(
    'PRODUCTOS_SERVICE_URL', 'http://productos-service:5001')

# Inicializar cliente S3
try:
    session = boto3.Session(profile_name=AWS_PROFILE)
    s3_client = session.client('s3', region_name=AWS_REGION)
    print(f"✓ Cliente S3 inicializado (Bucket: {S3_BUCKET})")
except Exception as e:
    print(f"⚠ Error inicializando S3: {e}")
    s3_client = None


def extract_productos():
    """Extraer productos del microservicio"""
    print("📥 Extrayendo productos...")

    all_productos = []
    page = 1

    while True:
        try:
            response = requests.get(
                f"{PRODUCTOS_SERVICE_URL}/api/productos",
                params={'page': page, 'per_page': 100},
                timeout=30
            )

            if response.status_code != 200:
                print(f"Error en página {page}: {response.status_code}")
                break

            data = response.json()
            productos = data.get('productos', [])

            if not productos:
                break

            all_productos.extend(productos)
            print(f"  ✓ Página {page}: {len(productos)} productos")

            # Verificar si hay más páginas
            if page >= data.get('pages', 1):
                break

            page += 1
            time.sleep(0.5)  # Evitar sobrecarga

        except Exception as e:
            print(f"Error extrayendo página {page}: {e}")
            break

    print(f"✓ Total productos extraídos: {len(all_productos)}")
    return all_productos


def extract_categorias():
    """Extraer categorías del microservicio"""
    print("📥 Extrayendo categorías...")

    try:
        response = requests.get(
            f"{PRODUCTOS_SERVICE_URL}/api/categorias",
            timeout=10
        )

        if response.status_code == 200:
            categorias = response.json()
            print(f"✓ Total categorías extraídas: {len(categorias)}")
            return categorias
        else:
            print(f"Error: {response.status_code}")
            return []

    except Exception as e:
        print(f"Error extrayendo categorías: {e}")
        return []


def convert_to_csv(data, filename):
    """Convertir datos a formato CSV"""
    if not data:
        return None

    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)

    return output.getvalue()


def upload_to_s3(data, key):
    """Subir datos a S3"""
    if not s3_client:
        print(f"⚠ S3 no configurado. Guardando localmente: {key}")
        # Guardar localmente como backup
        os.makedirs('/data/productos', exist_ok=True)
        with open(f'/data/{key}', 'w') as f:
            f.write(data)
        return True

    try:
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=key,
            Body=data.encode('utf-8'),
            ContentType='text/csv'
        )
        print(f"✓ Subido a S3: s3://{S3_BUCKET}/{key}")
        return True
    except Exception as e:
        print(f"✗ Error subiendo a S3: {e}")
        return False


def main():
    print("=" * 60)
    print("🚀 INGESTA DE PRODUCTOS - Inicio")
    print("=" * 60)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Extraer productos
    productos = extract_productos()
    if productos:
        # Convertir a CSV
        csv_data = convert_to_csv(productos, 'productos')

        # Subir a S3
        s3_key = f"productos/productos_{timestamp}.csv"
        upload_to_s3(csv_data, s3_key)

        # También guardar JSON
        json_data = json.dumps(productos, indent=2)
        json_key = f"productos/productos_{timestamp}.json"
        upload_to_s3(json_data, json_key)

    # Extraer categorías
    categorias = extract_categorias()
    if categorias:
        csv_data = convert_to_csv(categorias, 'categorias')
        s3_key = f"categorias/categorias_{timestamp}.csv"
        upload_to_s3(csv_data, s3_key)

    print("=" * 60)
    print("✓ INGESTA DE PRODUCTOS - Completada")
    print("=" * 60)


if __name__ == "__main__":
    main()
