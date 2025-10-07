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
PROVEEDORES_SERVICE_URL = os.getenv(
    'PROVEEDORES_SERVICE_URL', 'http://proveedores-service:3000')

# Inicializar cliente S3
try:
    session = boto3.Session(profile_name=AWS_PROFILE)
    s3_client = session.client('s3', region_name=AWS_REGION)
    print(f"✓ Cliente S3 inicializado (Bucket: {S3_BUCKET})")
except Exception as e:
    print(f"⚠ Error inicializando S3: {e}")
    s3_client = None


def extract_proveedores():
    """Extraer proveedores del microservicio"""
    print("📥 Extrayendo proveedores...")

    all_proveedores = []
    page = 1

    while True:
        try:
            response = requests.get(
                f"{PROVEEDORES_SERVICE_URL}/api/proveedores",
                params={'page': page, 'limit': 100},
                timeout=30
            )

            if response.status_code != 200:
                print(f"Error en página {page}: {response.status_code}")
                break

            data = response.json()
            proveedores = data.get('proveedores', [])

            if not proveedores:
                break

            # Aplanar datos de proveedores (MongoDB a CSV)
            for proveedor in proveedores:
                proveedor_flat = {
                    'id': str(proveedor.get('_id', '')),
                    'nombre': proveedor.get('nombre', ''),
                    'ruc': proveedor.get('ruc', ''),
                    'email': proveedor.get('email', ''),
                    'telefono': proveedor.get('telefono', ''),
                    'direccion_calle': proveedor.get('direccion', {}).get('calle', ''),
                    'direccion_ciudad': proveedor.get('direccion', {}).get('ciudad', ''),
                    'direccion_estado': proveedor.get('direccion', {}).get('estado', ''),
                    'direccion_pais': proveedor.get('direccion', {}).get('pais', ''),
                    'direccion_codigo_postal': proveedor.get('direccion', {}).get('codigoPostal', ''),
                    'contacto_nombre': proveedor.get('contacto', {}).get('nombre', ''),
                    'contacto_cargo': proveedor.get('contacto', {}).get('cargo', ''),
                    'contacto_telefono': proveedor.get('contacto', {}).get('telefono', ''),
                    'contacto_email': proveedor.get('contacto', {}).get('email', ''),
                    'categorias': ','.join(proveedor.get('categorias', [])),
                    'calificacion': proveedor.get('calificacion', 0),
                    'estado': proveedor.get('estado', ''),
                    'estado_entrega': proveedor.get('estadoEntrega', ''),
                    'condiciones_dias_credito': proveedor.get('condicionesPago', {}).get('diasCredito', 0),
                    'condiciones_metodo_pago': proveedor.get('condicionesPago', {}).get('metodoPago', ''),
                    'estadisticas_total_ordenes': proveedor.get('estadisticas', {}).get('totalOrdenes', 0),
                    'estadisticas_ordenes_completadas': proveedor.get('estadisticas', {}).get('ordenesCompletadas', 0),
                    'estadisticas_ordenes_pendientes': proveedor.get('estadisticas', {}).get('ordenesPendientes', 0),
                    'estadisticas_monto_total': proveedor.get('estadisticas', {}).get('montoTotal', 0),
                    'fecha_registro': proveedor.get('fechaRegistro', '')
                }
                all_proveedores.append(proveedor_flat)

            print(f"  ✓ Página {page}: {len(proveedores)} proveedores")

            # Verificar si hay más páginas
            if page >= data.get('totalPages', 1):
                break

            page += 1
            time.sleep(0.5)

        except Exception as e:
            print(f"Error extrayendo página {page}: {e}")
            break

    print(f"✓ Total proveedores extraídos: {len(all_proveedores)}")
    return all_proveedores


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
    print("🚀 INGESTA DE PROVEEDORES - Inicio")
    print("=" * 60)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

    # Extraer proveedores
    proveedores = extract_proveedores()
    if proveedores:
        csv_data = convert_to_csv(proveedores, 'proveedores')
        s3_key = f"proveedores/proveedores_{timestamp}.csv"
        upload_to_s3(csv_data, s3_key)

        json_data = json.dumps(proveedores, indent=2, default=str)
        json_key = f"proveedores/proveedores_{timestamp}.json"
        upload_to_s3(json_data, json_key)

    print("=" * 60)
    print("✓ INGESTA DE PROVEEDORES - Completada")
    print("=" * 60)


if __name__ == "__main__":
    main()
