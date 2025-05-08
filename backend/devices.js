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

// Exportar los dispositivos para que puedan ser utilizados en otros archivos
module.exports = devices;
