# GPS Cellular Monitoring System

## Descripción del Proyecto

Este proyecto combina un frontend desarrollado con React y Vite, y un backend construido con Express.js. Su propósito es monitorear el estado de repetidores GPS y celulares, proporcionando una interfaz visual para los usuarios y scripts automatizados para verificar el tiempo de actividad de los dispositivos.

## Estructura del Proyecto

- **frontend/**: Contiene el código del cliente, construido con React y Vite.
  - `src/`: Código fuente del frontend.
  - `vite.config.ts`: Configuración de Vite, incluyendo un proxy para redirigir solicitudes API al backend.
- **backend/**: Contiene el servidor Express.js que maneja las solicitudes API y sirve los archivos estáticos del frontend en producción.
  - `server.js`: Configura las rutas API para monitorear el estado de los dispositivos GPS y celulares.
  - `devices.js`: Archivo que almacena las direcciones IP de los dispositivos monitoreados.
  - `apiRoutes.js`: Archivo que define las rutas de la API para los dispositivos monitoreados.
- **Central Server/**: Contiene el servidor central que recopila datos de múltiples dispositivos GPS.
  - `index.js`: Configura el servidor central para recopilar y exponer datos de dispositivos remotos.
  - `RemoteGPSStatus.jsx`: Componente React para mostrar el estado de los dispositivos GPS remotos.
- **Endpoints/**: Contiene el servidor que interactúa con dispositivos GPS a través de un puerto serial.
  - `index.js`: Configura el servidor para exponer datos GPS a través de una API.
- **repeater-monitoring/**: Scripts para monitorear el tiempo de actividad de los repetidores GPS y celulares.
  - `gps/`: Contiene scripts y documentación para configurar y monitorear repetidores GPS.
    - `gps_uptime_monitor.js`: Script que verifica periódicamente el estado del repetidor GPS.
    - `gps_repeater_setup.md`: Guía para configurar un repetidor GPS.
  - `cellular/`: Contiene scripts y documentación para configurar y monitorear repetidores celulares.
    - `cellular_uptime_monitor.js`: Script que verifica periódicamente el estado del repetidor celular.
    - `cellular_repeater_setup.md`: Guía para configurar un repetidor celular.

## Funcionalidades del Proyecto

1. **Monitoreo de Dispositivos GPS y Celulares**:

   - Scripts automatizados para verificar el tiempo de actividad de repetidores GPS y celulares.
   - Registro de estados en la consola con reintentos automáticos en caso de fallos.

2. **Interfaz de Usuario**:

   - Dashboard interactivo desarrollado con React y Vite.
   - Visualización en tiempo real del estado de los dispositivos.
   - Filtros y búsqueda para facilitar la navegación entre dispositivos.

3. **Servidor Backend**:

   - API RESTful para exponer el estado de los dispositivos.
   - Manejo de solicitudes para obtener datos de dispositivos GPS y celulares.
   - Servir archivos estáticos del frontend en producción.

4. **Servidor Central**:

   - Recopilación de datos de múltiples dispositivos GPS remotos.
   - Exposición de datos recopilados a través de una API centralizada.

5. **Endpoints para Dispositivos GPS**:

   - Comunicación con dispositivos GPS a través de un puerto serial.
   - Exposición de datos GPS en tiempo real mediante una API.

6. **Compatibilidad y Configuración**:
   - Configuración de proxies en el frontend para redirigir solicitudes al backend.
   - Scripts de configuración y guías para instalar y operar repetidores GPS y celulares.

## Cómo Funciona

1. **Frontend**:
   - El frontend se comunica con el backend a través de un proxy configurado en `vite.config.ts`.
   - Las solicitudes a rutas como `/api/gps-status` y `/api/cellular-status` son redirigidas al backend.
   - Proporciona una interfaz visual para mostrar el estado de los dispositivos GPS y celulares.
2. **Backend**:
   - El backend expone las rutas API para obtener el estado de los repetidores.
   - Utiliza el módulo `ping` para verificar si los dispositivos están en línea o fuera de línea.
   - En producción, sirve los archivos estáticos del frontend.
3. **Monitoreo**:
   - Los scripts en `repeater-monitoring/` verifican periódicamente el estado de los repetidores GPS y celulares.
   - Los resultados se registran en la consola y se reintentan automáticamente en caso de fallos.

## Configuración y Ejecución

### Requisitos Previos

- Node.js (versión LTS recomendada)
- npm o yarn

### Pasos para Ejecutar

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Inicia el backend:
   ```bash
   cd backend && node server.js
   ```
4. Inicia el frontend:
   ```bash
   cd frontend && npm run dev
   ```
5. Accede a la aplicación en `http://localhost:5173` (puerto predeterminado de Vite).

## Despliegue

En producción, el backend sirve los archivos estáticos del frontend. Asegúrate de construir el frontend antes de desplegar:

```bash
cd frontend && npm run build
```

Los archivos generados estarán en `frontend/dist/` y serán servidos por el backend.
