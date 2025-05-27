# Backend API Documentation

## Endpoints

### 1. Obtener el estado del GPS

**GET** `/api/gps-status`

**Respuesta de ejemplo:**

```json
{
  "device": "GPS 1",
  "ip": "192.168.1.10",
  "status": "active",
  "lastUptime": "2025-04-29 12:00:00",
  "lastDowntime": null
}
```

### 2. Agregar un nuevo dispositivo

**POST** `/api/devices`

**Cuerpo de la solicitud:**

```json
{
  "name": "New Device",
  "ip": "192.168.1.20"
}
```

**Respuesta de ejemplo:**

```json
{
  "message": "Device added successfully",
  "device": {
    "name": "New Device",
    "ip": "192.168.1.20"
  }
}
```

### 3. Obtener métricas del sistema

**GET** `/metrics`

Este endpoint devuelve métricas en formato Prometheus para monitoreo del sistema.
