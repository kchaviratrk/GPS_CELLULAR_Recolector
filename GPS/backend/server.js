/**
 * This file sets up an Express.js server to monitor the status of GPS and Cellular devices.
 * It includes the following features:
 * - CORS support for cross-origin requests.
 * - Routes to check the status of GPS and Cellular devices by pinging their IP addresses.
 * - Serves static files from the frontend build directory.
 * - Handles unmatched routes by serving the frontend's index.html.
 *
 * Key Functions:
 * - checkDeviceStatus: Pings a given IP address and returns its status (online/offline).
 * - /api/gps-status: API endpoint to get the status of the GPS device.
 * - /api/cellular-status: API endpoint to get the status of the Cellular device.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const ping = require("ping");
const { TokenData, match } = require("path-to-regexp");
const winston = require("winston");
const client = require("prom-client");
const Queue = require("bull");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const { devices } = require("./devices");

const app = express();
app.use(cors());

const deviceStatusHistory = {};

const formatDate = (date) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-GB", options)
    .format(new Date(date))
    .replace(",", "")
    .replace(/\//g, "/");
};

async function checkDeviceStatus(ip) {
  try {
    console.log(`Pinging IP: ${ip}`);
    const res = await ping.promise.probe(ip);
    console.log(`Ping result for ${ip}:`, res);

    const status = res.alive ? "online" : "offline";

    if (!deviceStatusHistory[ip]) {
      deviceStatusHistory[ip] = { lastUptime: null, lastDowntime: null };
    }

    if (status === "online" && !deviceStatusHistory[ip].lastUptime) {
      deviceStatusHistory[ip].lastUptime = formatDate(new Date());
    } else if (status === "offline" && !deviceStatusHistory[ip].lastDowntime) {
      deviceStatusHistory[ip].lastDowntime = formatDate(new Date());
    }

    return status;
  } catch (error) {
    console.error(`Error pinging ${ip}:`, error);
    return "offline";
  }
}

// Import and use the routes defined in apiRoutes.js
const apiRoutes = require("./apiRoutes");
app.use("/api", apiRoutes);

// Nueva ruta para exponer la lista de dispositivos
app.get("/api/devices", (req, res) => {
  res.json(devices);
});

// GPS raw NMEA data — proxied from the Python GPS collector (localhost:3000)
app.get("/api/gps-serial", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3000/api/gps-raw");
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(503).json({ error: "GPS collector offline — verifica que Python este corriendo" });
  }
});

// Update logBTSDevices to include ping status
const logBTSDevices = async () => {
  const btsDevices = devices.filter((device) => device.name.startsWith("BTS"));
  console.clear();
  console.log("BTS Devices Status:");

  for (const device of btsDevices) {
    const status = await checkDeviceStatus(device.ip);
    console.log(`Device: ${device.name}, IP: ${device.ip}, Status: ${status}`);
  }
};

// Call the log function periodically
setInterval(logBTSDevices, 5000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Configuración de Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

logger.info("Servidor iniciado");

// Middleware de registro
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Algo salió mal!");
});

// Configuración de Prometheus
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de las solicitudes HTTP en segundos",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Endpoint para métricas
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// Crear una cola para manejar tareas asíncronas (requiere Redis)
const taskQueue = new Queue("taskQueue");
taskQueue.on("error", (err) => logger.warn("Task queue (Redis) no disponible: " + err.message));
taskQueue.process(async (job) => {
  console.log(`Procesando tarea: ${job.id}`);
});

// Endpoint para agregar tareas a la cola
app.post("/api/tasks", async (req, res) => {
  const { taskData } = req.body;
  const job = await taskQueue.add(taskData);
  res.status(201).json({ message: "Tarea agregada a la cola", jobId: job.id });
});

// Configurar almacenamiento persistente (ejemplo con SQLite)
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS devices (id INTEGER PRIMARY KEY, name TEXT, ip TEXT)"
  );
});

// Endpoint para guardar dispositivos en la base de datos
app.post("/api/devices/save", (req, res) => {
  const { name, ip } = req.body;
  db.run(
    "INSERT INTO devices (name, ip) VALUES (?, ?)",
    [name, ip],
    function (err) {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error al guardar el dispositivo" });
      }
      res
        .status(201)
        .json({ message: "Dispositivo guardado", id: this.lastID });
    }
  );
});

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for the backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./apiRoutes.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Heartbeat — envía lastHeartBeat a Azure SQL para cada dispositivo
const { poolPromise } = require("./db");

const HEARTBEAT_DEVICES = ["GPS01", "Celullar01"];
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

async function sendHeartbeatFor(hardwareID) {
  try {
    const pool = await poolPromise;
    const timestamp = Date.now();
    await pool
      .request()
      .input("hardwareID", hardwareID)
      .input("lastHeartBeat", timestamp)
      .query(
        "UPDATE trk.hardware SET lastHeartBeat = @lastHeartBeat WHERE hardwareID = @hardwareID"
      );
    logger.info(`Heartbeat enviado para ${hardwareID}`);
  } catch (err) {
    logger.error(`Error enviando heartbeat para ${hardwareID}:`, err);
  }
}

async function sendAllHeartbeats() {
  for (const id of HEARTBEAT_DEVICES) {
    await sendHeartbeatFor(id);
  }
}

// Enviar al arrancar (sin esperar el primer intervalo)
sendAllHeartbeats();
// Repetir cada 5 minutos
setInterval(sendAllHeartbeats, HEARTBEAT_INTERVAL_MS);

// Endpoint para forzar heartbeat manual
app.post("/api/heartbeat", async (req, res) => {
  try {
    await sendAllHeartbeats();
    res.status(200).json({ message: "Heartbeat enviado manualmente para todos los dispositivos" });
  } catch (err) {
    logger.error("Error enviando heartbeat manual:", err);
    res.status(500).json({ error: "Error enviando heartbeat manual" });
  }
});
