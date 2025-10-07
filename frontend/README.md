# Frontend - Sistema de Gestión de Inventarios

Aplicación web moderna construida con React + Vite que consume los 5 microservicios del sistema.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos

## 📦 Características

### Dashboard Principal

- Resumen de inventario actual
- Total de productos, órdenes y proveedores
- Órdenes recientes
- KPIs de negocio
- Estado de servicios

### Gestión de Productos

- Listado paginado de productos
- Búsqueda y filtros
- Visualización de stock
- Categorías

### Gestión de Órdenes

- Listado de pedidos
- Estados de órdenes
- Información de clientes
- Métodos de pago

### Gestión de Proveedores

- Listado de proveedores
- Calificaciones
- Estados de entrega
- Categorías por proveedor

### Reportes Analíticos

- Ventas por categoría (gráfico de barras)
- Top 10 productos más vendidos
- Top 10 proveedores por ingresos
- Análisis de rentabilidad

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build
npm run preview
```

## 🌐 Configuración

Edita el archivo `.env` con las URLs de tus microservicios:

```env
VITE_PRODUCTOS_URL=http://localhost:5001
VITE_ORDENES_URL=http://localhost:8080
VITE_PROVEEDORES_URL=http://localhost:3000
VITE_INTEGRACION_URL=http://localhost:8000
VITE_ANALITICO_URL=http://localhost:9000
```

## 📡 Integración con Microservicios

La aplicación consume los siguientes servicios:

### Servicio de Productos (Puerto 5001)

- `GET /api/productos` - Listado de productos
- `GET /api/categorias` - Categorías

### Servicio de Órdenes (Puerto 8080)

- `GET /api/ordenes` - Listado de órdenes
- `GET /api/clientes` - Clientes

### Servicio de Proveedores (Puerto 3000)

- `GET /api/proveedores` - Listado de proveedores

### Servicio de Integración (Puerto 8000)

- `GET /api/dashboard-resumen` - Resumen del dashboard
- `GET /api/ordenes-recientes` - Órdenes recientes
- `GET /api/services-status` - Estado de servicios

### Servicio Analítico (Puerto 9000)

- `GET /api/dashboard-kpis` - KPIs principales
- `GET /api/ventas-por-categoria` - Análisis de ventas
- `GET /api/productos-mas-vendidos` - Top productos
- `GET /api/rentabilidad-proveedores` - Rentabilidad

## 🚢 Despliegue en AWS Amplify

### Paso 1: Preparar Repositorio

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <tu-repo-url>
git push -u origin main
```

### Paso 2: Configurar Amplify

1. Ir a AWS Amplify Console
2. Conectar repositorio de GitHub
3. Seleccionar rama `main`
4. Configurar build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### Paso 3: Variables de Entorno

En Amplify Console, agregar las siguientes variables de entorno:

```
VITE_PRODUCTOS_URL=https://tu-api-productos.com
VITE_ORDENES_URL=https://tu-api-ordenes.com
VITE_PROVEEDORES_URL=https://tu-api-proveedores.com
VITE_INTEGRACION_URL=https://tu-api-integracion.com
VITE_ANALITICO_URL=https://tu-api-analitico.com
```

### Paso 4: Deploy

Amplify automáticamente desplegará la aplicación con cada push a la rama main.

## 📱 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   └── Card.jsx
│   ├── pages/           # Páginas/vistas
│   │   ├── Dashboard.jsx
│   │   ├── Productos.jsx
│   │   ├── Ordenes.jsx
│   │   ├── Proveedores.jsx
│   │   └── Reportes.jsx
│   ├── services/        # API clients
│   │   └── api.js
│   ├── App.jsx          # Componente raíz
│   ├── main.jsx         # Entry point
│   └── index.css        # Estilos globales
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Personalización

### Colores

Edita `tailwind.config.js` para cambiar el esquema de colores:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Tus colores personalizados
      },
    },
  },
}
```

## 📊 Notas

- La aplicación funciona con o sin el servicio analítico configurado
- Los gráficos requieren datos de AWS Athena para mostrarse completamente
- El dashboard muestra datos de ejemplo si los servicios no están disponibles

## 🔐 Seguridad

- No incluir credenciales en el código
- Usar variables de entorno para URLs
- Configurar CORS en los microservicios
- Implementar autenticación (próxima versión)

## 🐛 Troubleshooting

**Problema:** No se cargan los datos

- Verifica que los microservicios estén ejecutándose
- Revisa las URLs en `.env`
- Verifica CORS en los servicios backend

**Problema:** Errores de compilación

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 Licencia

Proyecto académico - CS2032 Cloud Computing
