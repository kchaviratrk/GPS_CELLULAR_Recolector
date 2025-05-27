const express = require("express");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const cors = require("cors");

const app = express();
const port = 3000;

// Configure the serial port
const serialPort = new SerialPort("COM3", {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
});

const parser = serialPort.pipe(new Readline({ delimiter: "\r\n" }));

let latestGPSData = null;

// Read data from the GPS
parser.on("data", (data) => {
  console.log("GPS Data:", data);
  latestGPSData = data;
});

// Define the /api/gps-data endpoint
app.get("/api/gps-data", (req, res) => {
  if (latestGPSData) {
    res.json({ gpsData: latestGPSData });
  } else {
    res.status(404).json({ error: "No GPS data available" });
  }
});

// Configure CORS options
const corsOptions = {
  origin: ["http://localhost:5173", /\./], // Allow localhost:5173 and any domain
};

// Enable CORS middleware
app.use(cors(corsOptions));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
