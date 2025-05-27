// Crear un archivo separado para las rutas de API y mover las rutas relacionadas con las APIs a ese archivo.
const express = require("express");
const router = express.Router();
const devices = require("./devices");
const { body, validationResult } = require("express-validator");

// Middleware para validar y sanitizar entradas
const validateDevice = [
  body("name")
    .isString()
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Name is required"),
  body("ip").isIP().withMessage("Invalid IP address"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Ruta para el estado del GPS
router.get("/api/gps-status", async (req, res) => {
  const gpsDevice = devices.find((device) => device.name === "GPS 1");
  if (!gpsDevice) {
    return res.status(404).json({ error: "GPS device not found" });
  }
  const status = await checkDeviceStatus(gpsDevice.ip);
  res.json({
    device: gpsDevice.name,
    ip: gpsDevice.ip,
    status: status === "online" ? "active" : "inactive",
    lastUptime: deviceStatusHistory[gpsDevice.ip]?.lastUptime || null,
    lastDowntime: deviceStatusHistory[gpsDevice.ip]?.lastDowntime || null,
  });
});

// Ruta para el estado del GPS 2
router.get("/api/gps-status-2", async (req, res) => {
  const gpsDevice2 = devices.find((device) => device.name === "GPS 2");
  if (!gpsDevice2) {
    return res.status(404).json({ error: "GPS 2 device not found" });
  }
  const status = await checkDeviceStatus(gpsDevice2.ip);
  res.json({
    device: gpsDevice2.name,
    ip: gpsDevice2.ip,
    status: status === "online" ? "active" : "inactive",
    lastUptime: deviceStatusHistory[gpsDevice2.ip]?.lastUptime || null,
    lastDowntime: deviceStatusHistory[gpsDevice2.ip]?.lastDowntime || null,
  });
});

// Ruta para el estado del dispositivo celular
router.get("/api/cellular-status", async (req, res) => {
  const cellularDevice = devices.find((device) => device.name === "Cellular");
  if (!cellularDevice) {
    return res.status(404).json({ error: "Cellular device not found" });
  }
  const status = await checkDeviceStatus(cellularDevice.ip);
  res.json({
    device: cellularDevice.name,
    ip: cellularDevice.ip,
    status: status === "online" ? "active" : "inactive",
    lastUptime: deviceStatusHistory[cellularDevice.ip]?.lastUptime || null,
    lastDowntime: deviceStatusHistory[cellularDevice.ip]?.lastDowntime || null,
  });
});

// Ruta para el estado de la impresora
router.get("/api/printer-status", async (req, res) => {
  const printerDevice = devices.find((device) => device.name === "Printer");
  if (!printerDevice) {
    return res.status(404).json({ error: "Printer device not found" });
  }
  const status = await checkDeviceStatus(printerDevice.ip);
  res.json({
    device: printerDevice.name,
    ip: printerDevice.ip,
    status: status === "online" ? "active" : "inactive",
    lastUptime: deviceStatusHistory[printerDevice.ip]?.lastUptime || null,
    lastDowntime: deviceStatusHistory[printerDevice.ip]?.lastDowntime || null,
  });
});

// Add routes for Raspberry Pi devices (BTS01 to BTS05)
const raspberryPiDevices = Array.isArray(devices)
  ? devices.filter((device) => device.name.startsWith("BTS"))
  : [];

// Debugging log to confirm route registration
console.log("API routes for Raspberry Pi devices registered:");
raspberryPiDevices.forEach((raspberryPi) => {
  console.log(`/api/${raspberryPi.name.toLowerCase()}-status`);
});

raspberryPiDevices.forEach((raspberryPi) => {
  router.get(
    `/api/${raspberryPi.name.toLowerCase()}-status`,
    async (req, res) => {
      if (!raspberryPi.ip) {
        return res
          .status(404)
          .json({ error: `${raspberryPi.name} IP not configured` });
      }
      const status = await checkDeviceStatus(raspberryPi.ip);
      res.json({
        device: raspberryPi.name,
        ip: raspberryPi.ip,
        status: status === "online" ? "active" : "inactive",
        lastUptime: deviceStatusHistory[raspberryPi.ip]?.lastUptime || null,
        lastDowntime: deviceStatusHistory[raspberryPi.ip]?.lastDowntime || null,
      });
    }
  );
});

// Ruta para exponer la lista de dispositivos
router.get("/api/devices", (req, res) => {
  res.json(devices);
});

module.exports = router;
