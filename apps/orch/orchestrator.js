const express = require("express");
const axios = require("axios");
const winston = require("winston");
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");

// Load configuration
const configPath = path.join(__dirname, "config.yaml");
const config = yaml.parse(fs.readFileSync(configPath, "utf8"));

// Set up logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, service }) => {
      return `${timestamp} [${service}] ${level}: ${message}`;
    })
  ),
  defaultMeta: { service: "orchestrator" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

const app = express();
const port = 3000; // Hardcoded port as it's not in the config file

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Function to collect data from tracker with retries
async function collectTrackerData(retries = 3) {
  logger.info("Starting to collect data from tracker");
  const trackerUrl = config.trackers[0].url; // Assuming we're using the first tracker

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Get detections from the last 15 seconds
      logger.info("Fetching detections from the last 15 seconds");
      const response = await axios.get(`${trackerUrl}/detections?from=15`);
      const detections = response.data;
      logger.info(`Detections: ${JSON.stringify(detections)}`);

      // Format data for the proxy
      const formattedData = formatDataForProxy(detections);

      // Send data to proxy
      logger.info("Sending formatted data to proxy");
      await sendToProxy(formattedData);

      logger.info("Successfully collected and sent tracker data to proxy");
      return; // Exit the function if successful
    } catch (error) {
      logger.error(`Error collecting tracker data (attempt ${attempt}/${retries}): ${error.message}`);
      if (error.response) {
        logger.error(`Response status: ${error.response.status}`);
        logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      if (attempt === retries) {
        logger.error("Max retries reached. Failed to collect tracker data.");
      } else {
        logger.info(`Retrying in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }
  }
}

// Function to format data for the proxy
function formatDataForProxy(detections) {
  const timestamp = new Date().toISOString();
  return [{
    ts: Date.now(),
    ...detections
  }];
}

// Function to send data to proxy
async function sendToProxy(data) {
  try {
    const proxyUrl = config.proxy.url;
    const cameraId = config.trackers[0].id || "RGQRj2nlCwYvwIIKQY0aV"; // Use the specific camera ID
    logger.info(`Sending data to proxy: ${proxyUrl}/cameras/${cameraId}/observations/objects`);
    logger.info(`Data being sent: ${JSON.stringify(data)}`);
    const response = await axios.post(`${proxyUrl}/cameras/${cameraId}/observations/objects`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    logger.info(`Data sent to proxy successfully. Response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    logger.error(`Error sending data to proxy: ${error.message}`);
    if (error.response) {
      logger.error(`Response status: ${error.response.status}`);
      logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      logger.error(`No response received: ${error.request}`);
    } else {
      logger.error(`Error setting up request: ${error.message}`);
    }
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  logger.info(`Orchestrator started and listening at http://localhost:${port}`);
});

// Function to check tracker health periodically
async function checkTrackerHealth() {
  logger.info("Starting tracker health check");
  for (const tracker of config.trackers) {
    try {
      const response = await axios.get(`${tracker.url}/health`, {
        timeout: config.health_check.timeout * 1000,
      });
      logger.info(`Tracker health check - ${tracker.url}: ${response.status === 200 ? "healthy" : "unhealthy"}`);
    } catch (error) {
      logger.error(`Tracker health check error - ${tracker.url}: ${error.message}`);
    }
  }
  logger.info("Tracker health check completed");
}

// Function to check orchestrator's own health
async function checkOrchestratorHealth() {
  try {
    const response = await axios.get(`http://localhost:${port}/health`);
    logger.info(`Orchestrator self-check: ${response.status === 200 ? "healthy" : "unhealthy"}`);
  } catch (error) {
    logger.error(`Orchestrator self-check error: ${error.message}`);
  }
}

// Check tracker health based on the interval in the config
setInterval(checkTrackerHealth, config.health_check.interval * 1000);

// Check orchestrator health every 1 minute
setInterval(checkOrchestratorHealth, 60 * 1000);

// Collect tracker data every 15 seconds
setInterval(collectTrackerData, 15 * 1000);

// Initial health checks and data collection with delay
setTimeout(() => {
  logger.info("Performing initial health checks and data collection");
  checkTrackerHealth();
  checkOrchestratorHealth();
  collectTrackerData();
}, 10000); // Wait for 10 seconds before starting

logger.info("Orchestrator initialized. Waiting 10 seconds before starting health checks and data collection.");
