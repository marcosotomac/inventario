FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ingest.py .

# Crear directorio para datos locales
RUN mkdir -p /data

CMD ["python", "ingest.py"]
