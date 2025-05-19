# Backend API - Cellular Monitor

## Endpoints

- **GET /status**

  - Devuelve el estado actual del módem (conexión, señal, SIM).

- **GET /alerts**

  - Devuelve las últimas alertas generadas por el sistema.

- **GET /logs**
  - Devuelve los logs recientes de eventos.

## Modo de simulación y modo real

- Por defecto, el backend funciona en modo simulación.
- Para cambiar a modo real, implementa la función `get_modem_status` en `modem_driver.py` y activa la variable `USE_REAL_MODEM`.

## Seguridad para producción

- Para desplegar en producción, considera:
  - Usar un servidor como Gunicorn/Uvicorn detrás de un proxy reverso (Nginx).
  - Limitar `allow_origins` en CORS solo al dominio del frontend.
  - Implementar autenticación en los endpoints si es necesario.
