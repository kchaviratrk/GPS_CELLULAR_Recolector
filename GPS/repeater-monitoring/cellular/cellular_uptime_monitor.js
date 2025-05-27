const axios = require("axios");

const CELLULAR_REPEATER_URL = "http://your-cellular-repeater-ip/health";
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 300000; // 5 minutes

async function checkUptime(retryDelay = INITIAL_RETRY_DELAY) {
  try {
    const response = await axios.get(CELLULAR_REPEATER_URL);
    if (response.status === 200) {
      console.log(`[${new Date().toISOString()}] Cellular Repeater is online.`);
      setTimeout(() => checkUptime(), 60000); // Check every minute
    } else {
      console.error(
        `[${new Date().toISOString()}] Cellular Repeater returned status: ${
          response.status
        }`
      );
    }
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Cellular Repeater is unreachable. Retrying in ${
        retryDelay / 1000
      } seconds...`
    );
    setTimeout(
      () => checkUptime(Math.min(retryDelay * 2, MAX_RETRY_DELAY)),
      retryDelay
    );
  }
}

checkUptime();
