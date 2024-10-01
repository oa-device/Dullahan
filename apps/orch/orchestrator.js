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
      // Get current detections
      logger.info("Fetching current detections");
      const currentDetections = await axios.get(`${trackerUrl}/detections`);
      logger.info(`Current detections: ${JSON.stringify(currentDetections.data)}`);
      
      // Get unique object counts for the last 30 seconds
      logger.info("Fetching unique object counts");
      const uniqueCounts = await axios.get(`${trackerUrl}/detections?from=30`);
      logger.info(`Unique counts: ${JSON.stringify(uniqueCounts.data)}`);
      
      // Get person count for the last minute
      logger.info("Fetching person count");
      const now = Date.now();
      const personCount = await axios.get(`${trackerUrl}/cam/collect`, {
        params: {
          from: now - 60000, // 60 seconds ago
          to: now,
          cam: 0
        }
      });
      logger.info(`Person count: ${JSON.stringify(personCount.data)}`);

      // Organize the collected data
      const organizedData = {
        timestamp: new Date().toISOString(),
        currentDetections: currentDetections.data,
        uniqueCounts: uniqueCounts.data,
        personCount: personCount.data
      };

      // Send organized data to proxy
      logger.info("Sending organized data to proxy");
      await sendToProxy(organizedData);

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
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }
  }
}

// Function to send data to proxy
async function sendToProxy(data) {
  try {
    const proxyUrl = config.proxy.url;
    await axios.post(`${proxyUrl}/data`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    logger.info("Data sent to proxy successfully");
  } catch (error) {
    logger.error(`Error sending data to proxy: ${error.message}`);
    if (error.response) {
      logger.error(`Response status: ${error.response.status}`);
      logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
    }
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

// Check orchestrator health every 5 minutes
setInterval(checkOrchestratorHealth, 5 * 60 * 1000);

// Collect tracker data every minute
setInterval(collectTrackerData, 60 * 1000);

// Initial health checks and data collection with delay
setTimeout(() => {
  logger.info("Performing initial health checks and data collection");
  checkTrackerHealth();
  checkOrchestratorHealth();
  collectTrackerData();
}, 10000); // Wait for 10 seconds before starting

logger.info("Orchestrator initialized. Waiting 10 seconds before starting health checks and data collection.");
