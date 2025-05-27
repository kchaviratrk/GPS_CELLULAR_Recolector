# Sistema de Monitoreo GPS y Celular

## Descripción del Proyecto

Este sistema permite monitorear el estado de repetidores GPS y celulares mediante una interfaz web. Combina un frontend desarrollado con React y Vite, y un backend construido con Express.js.

## Estructura del Proyecto

- **frontend/**: Contiene el cliente web.
- **backend/**: Contiene el servidor que maneja las solicitudes API y sirve los archivos estáticos.
- **repeater-monitoring/**: Scripts para monitorear repetidores GPS y celulares.

## Cómo Ejecutar

1. Instala las dependencias:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Inicia el backend:
   ```bash
   cd backend && node server.js
   ```
3. Inicia el frontend:
   ```bash
   cd frontend && npm run dev
   ```
4. Abre `http://localhost:5173` en tu navegador.

## Despliegue

Para producción, construye el frontend:

```bash
cd frontend && npm run build
```

El backend servirá los archivos estáticos generados en `frontend/dist/`.
