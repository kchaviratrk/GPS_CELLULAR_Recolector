// Crear un archivo para manejar los dispositivos y sus direcciones IP
const devices = [
  { name: "GPS 1", ip: "192.168.1.1" },
  { name: "GPS 2", ip: "192.168.1.3" },
  { name: "Cellular", ip: "192.168.1.2" },
  { name: "Printer", ip: "192.168.1.13" },
  { name: "Device 4", ip: "" },
  { name: "Device 5", ip: "" },
  { name: "Device 6", ip: "" },
  { name: "Device 7", ip: "" },
  { name: "Device 8", ip: "" },
  { name: "Device 9", ip: "" },
  { name: "Device 10", ip: "" },
  { name: "BTS01", ip: "192.168.1.9" },
  { name: "BTS02", ip: "192.168.25.244" },
  { name: "BTS03", ip: "192.168.2.176" },
  { name: "BTS04", ip: "192.168.25.63" },
  { name: "BTS05", ip: "192.168.18.17" },
];

// In-memory data store for GPS readings
const gpsDataStore = {};

module.exports = {
  /**
   * Updates the GPS data for a specific device.
   * @param {string} deviceId - The ID of the device.
   * @param {Object} parsedData - The parsed GPS data.
   * @param {string} parsedData.time - The timestamp of the reading.
   * @param {number} parsedData.lat - The latitude.
   * @param {number} parsedData.lon - The longitude.
   * @param {string} parsedData.fix - The fix status.
   * @param {number} parsedData.satelliteCount - The number of satellites.
   * @param {number} parsedData.hdop - The horizontal dilution of precision.
   * @param {number} parsedData.altitude - The altitude.
   */
  updateGPSData(deviceId, parsedData) {
    gpsDataStore[deviceId] = {
      time: parsedData.time,
      lat: parsedData.lat,
      lon: parsedData.lon,
      fix: parsedData.fix,
      satelliteCount: parsedData.satelliteCount,
      hdop: parsedData.hdop,
      altitude: parsedData.altitude,
    };
  },

  /**
   * Retrieves the latest GPS data for a specific device.
   * @param {string} deviceId - The ID of the device.
   * @returns {Object|null} The latest GPS data or null if not found.
   */
  getGPSData(deviceId) {
    return gpsDataStore[deviceId] || null;
  },
};

// Exportar los dispositivos para que puedan ser utilizados en otros archivos
module.exports.devices = devices;
