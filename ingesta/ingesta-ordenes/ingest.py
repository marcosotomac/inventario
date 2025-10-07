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
S3_BUCKET = os.getenv('S3_BUCKET', 'inventario-datalake-2025')
ORDENES_SERVICE_URL = os.getenv(
    'ORDENES_SERVICE_URL', 'http://ordenes-service:8080')

# Inicializar cliente S3
try:
    session = boto3.Session(profile_name=AWS_PROFILE)
    s3_client = session.client('s3', region_name=AWS_REGION)
    print(f"✓ Cliente S3 inicializado (Bucket: {S3_BUCKET})")
except Exception as e:
    print(f"⚠ Error inicializando S3: {e}")
    s3_client = None


def extract_ordenes():
    """Extraer órdenes del microservicio"""
    print("📥 Extrayendo órdenes...")

    all_ordenes = []
    page = 0

    while True:
        try:
            response = requests.get(
                f"{ORDENES_SERVICE_URL}/api/ordenes",
                params={'page': page, 'size': 100},
                timeout=30
            )

            if response.status_code != 200:
                print(f"Error en página {page}: {response.status_code}")
                break

            data = response.json()
            ordenes = data.get('ordenes', [])

            if not ordenes:
                break

            # Aplanar datos de órdenes
            for orden in ordenes:
                orden_flat = {
                    'id': orden.get('id'),
                    'numero_orden': orden.get('numeroOrden'),
                    'cliente_id': orden.get('clienteId'),
                    'cliente_nombre': orden.get('clienteNombre', ''),
                    'fecha_orden': orden.get('fechaOrden'),
                    'estado': orden.get('estado'),
                    'total': orden.get('total'),
                    'metodo_pago': orden.get('metodoPago'),
                    'direccion_envio': orden.get('direccionEnvio', '')
                }
                all_ordenes.append(orden_flat)

            print(f"  ✓ Página {page}: {len(ordenes)} órdenes")

            # Verificar si hay más páginas
            if page >= data.get('totalPages', 1) - 1:
                break

            page += 1
            time.sleep(0.5)

        except Exception as e:
            print(f"Error extrayendo página {page}: {e}")
            break

    print(f"✓ Total órdenes extraídas: {len(all_ordenes)}")
    return all_ordenes


def extract_clientes():
    """Extraer clientes del microservicio"""
    print("📥 Extrayendo clientes...")

    try:
        response = requests.get(
            f"{ORDENES_SERVICE_URL}/api/clientes",
            timeout=30
        )

        if response.status_code == 200:
            clientes = response.json()

            # Aplanar datos de clientes
            clientes_flat = []
            for cliente in clientes:
                cliente_flat = {
                    'id': cliente.get('id'),
                    'nombre': cliente.get('nombre'),
                    'email': cliente.get('email'),
                    'telefono': cliente.get('telefono', ''),
                    'direccion': cliente.get('direccion', ''),
                    'ciudad': cliente.get('ciudad', ''),
                    'pais': cliente.get('pais', ''),
                    'fecha_registro': cliente.get('fechaRegistro')
                }
                clientes_flat.append(cliente_flat)

            print(f"✓ Total clientes extraídos: {len(clientes_flat)}")
            return clientes_flat
        else:
            print(f"Error: {response.status_code}")
            return []

    except Exception as e:
        print(f"Error extrayendo clientes: {e}")
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
        os.makedirs(os.path.dirname(f'/data/{key}'), exist_ok=True)
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
    print("🚀 INGESTA DE ÓRDENES - Inicio")
    print("=" * 60)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Extraer órdenes
    ordenes = extract_ordenes()
    if ordenes:
        csv_data = convert_to_csv(ordenes, 'ordenes')
        s3_key = f"ordenes/ordenes_{timestamp}.csv"
        upload_to_s3(csv_data, s3_key)

        json_data = json.dumps(ordenes, indent=2, default=str)
        json_key = f"ordenes/ordenes_{timestamp}.json"
        upload_to_s3(json_data, json_key)

    # Extraer clientes
    clientes = extract_clientes()
    if clientes:
        csv_data = convert_to_csv(clientes, 'clientes')
        s3_key = f"clientes/clientes_{timestamp}.csv"
        upload_to_s3(csv_data, s3_key)

        json_data = json.dumps(clientes, indent=2, default=str)
        json_key = f"clientes/clientes_{timestamp}.json"
        upload_to_s3(json_data, json_key)

    print("=" * 60)
    print("✓ INGESTA DE ÓRDENES - Completada")
    print("=" * 60)


if __name__ == "__main__":
    main()
