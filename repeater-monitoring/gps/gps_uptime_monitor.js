const axios = require("axios");

const GPS_REPEATER_URL = "http://your-gps-repeater-ip/health";
const CHECK_INTERVAL = 60000; // 1 minute
const RETRY_INTERVAL = 300000; // 5 minutes

async function checkUptime() {
  try {
    const response = await axios.get(GPS_REPEATER_URL);
    if (response.status === 200) {
      console.log(`[${new Date().toISOString()}] GPS Repeater is online.`);
    } else {
      console.error(
        `[${new Date().toISOString()}] GPS Repeater returned status: ${
          response.status
        }`
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] GPS Repeater is unreachable. Retrying in 5 minutes...`
    );
    setTimeout(checkUptime, RETRY_INTERVAL);
    return;
  }
  setTimeout(checkUptime, CHECK_INTERVAL);
}

checkUptime();
