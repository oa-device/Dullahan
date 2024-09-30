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

// Handle observations from trackers and forward to proxy
app.post("/cameras/:id/observations/:type", async (req, res) => {
  const { id, type } = req.params;
  const observations = req.body;

  if (!Array.isArray(observations)) {
    return res.status(400).json({ error: "Observations must be an array" });
  }

  if (!config.observation_types.includes(type)) {
    return res.status(400).json({ error: "Invalid observation type" });
  }

  try {
    const proxyUrl = config.proxy.url;
    const response = await axios.post(`${proxyUrl}/cameras/${id}/observations/${type}`, observations, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    logger.info(`Forwarded ${type} observations for camera ${id} to proxy`);
    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error forwarding observations to proxy: ${error.message}`);
    res.status(500).json({ error: "Failed to forward observations to proxy" });
  }
});

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

// Initial health checks
logger.info("Performing initial health checks");
checkTrackerHealth();
checkOrchestratorHealth();
