const express = require("express");
const axios = require("axios");

const app = express();
const port = 3001;

// List of GPS device endpoints
const gpsEndpoints = [
  "http://192.168.30.194:3000/api/gps-data",
  "http://192.168.30.96:3000/api/gps-data",
];

// In-memory storage for GPS data
let gpsDataStore = {};

// Function to fetch GPS data from all endpoints
const fetchGPSData = async () => {
  for (const endpoint of gpsEndpoints) {
    try {
      const response = await axios.get(endpoint);
      gpsDataStore[endpoint] = response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error.message);
      gpsDataStore[endpoint] = { error: "Unable to fetch data" };
    }
  }
};

// Periodically fetch GPS data every 10 seconds
setInterval(fetchGPSData, 10000);

// Endpoint to get all collected GPS data
app.get("/api/remote-gps", (req, res) => {
  res.json(gpsDataStore);
});

// Start the server
app.listen(port, () => {
  console.log(`Central server is running on http://localhost:${port}`);
});
