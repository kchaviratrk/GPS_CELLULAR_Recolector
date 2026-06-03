const express = require("express");
const router = express.Router();
const ping = require("ping");
const { devices } = require("./devices");

async function checkDeviceStatus(ip) {
  try {
    const res = await ping.promise.probe(ip);
    return res.alive ? "online" : "offline";
  } catch {
    return "offline";
  }
}

function deviceRoute(name) {
  return async (req, res) => {
    const device = devices.find((d) => d.name === name);
    if (!device) return res.status(404).json({ error: `${name} not found` });

    // Bypass: device is always considered online (e.g. Cellular inside the facility)
    if (device.bypass) {
      return res.json({ device: device.name, ip: device.ip || "N/A", status: "online" });
    }

    if (!device.ip) {
      return res.json({ device: device.name, ip: "N/A", status: "offline" });
    }

    const status = await checkDeviceStatus(device.ip);
    res.json({ device: device.name, ip: device.ip, status });
  };
}

router.get("/gps1-status",     deviceRoute("GPS 1"));
router.get("/cellular-status", deviceRoute("Cellular"));

router.get("/devices", (req, res) => res.json(devices));

module.exports = router;
