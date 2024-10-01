const express = require("express");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const axios = require("axios");

// Initialize Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
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
app.use(express.json());

const PORT = process.env.PROXY_PORT || 3001;
const REQUESTS_FILE = path.join(__dirname, "requests.json");
const CHECK_INTERVAL = 60 * 1000; // 1 minute

// Configuration
const config = {
  useMockCloud: true, // Set to false to use real cloud
  mockCloudUrl: "http://localhost:3002", // Mock cloud URL
  realCloudUrl: "https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com", // Real cloud URL
};

let isCloudAvailable = true; // Assume cloud is available by default
let mockCloudStorage = []; // Storage for mock cloud data

// Initialize the cached requests file if it doesn't exist
if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([]));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Endpoint to receive data from orchestrator
app.post("/cameras/:id/observations/:type", async (req, res) => {
  const { id, type } = req.params;
  const data = req.body;
  logger.info(`Received ${type} data for camera ${id} from orchestrator`);

  try {
    await sendToCloud(id, type, data);
    res.status(200).send("Data sent to cloud successfully");
  } catch (error) {
    logger.error(`Failed to send data to cloud: ${error.message}`);
    await cacheRequest(id, type, data);
    res.status(202).send("Data cached for later sending");
  }
});

// Endpoint to toggle cloud availability (for testing purposes)
app.post("/toggle-cloud", (req, res) => {
  isCloudAvailable = !isCloudAvailable;
  logger.info(`Cloud availability set to: ${isCloudAvailable}`);
  res.status(200).json({ cloudAvailable: isCloudAvailable });
});

// Endpoint to view mock cloud storage (for testing purposes)
app.get("/view-cloud", (req, res) => {
  if (config.useMockCloud) {
    res.status(200).json(mockCloudStorage);
  } else {
    res.status(400).send("Mock cloud is not in use");
  }
});

// Endpoint to toggle between mock and real cloud
app.post("/toggle-mock-cloud", (req, res) => {
  config.useMockCloud = !config.useMockCloud;
  logger.info(`Mock cloud usage set to: ${config.useMockCloud}`);
  res.status(200).json({ useMockCloud: config.useMockCloud });
});

async function sendToCloud(cameraId, observationType, data) {
  if (!isCloudAvailable) {
    throw new Error("Cloud is not available");
  }

  const baseUrl = config.useMockCloud ? config.mockCloudUrl : config.realCloudUrl;
  const url = `${baseUrl}/cameras/${cameraId}/observations/${observationType}`;

  logger.info(`Attempting to send data to URL: ${url}`);

  if (config.useMockCloud) {
    // Simulate sending to mock cloud
    mockCloudStorage.push({ cameraId, observationType, data });
    logger.info(`Data sent to mock cloud for camera ${cameraId}, type ${observationType}`);
  } else {
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      logger.info(`Data sent to real cloud for camera ${cameraId}, type ${observationType}`);
      logger.info(`Response status: ${response.status}`);
      logger.info(`Response data: ${JSON.stringify(response.data)}`);
    } catch (error) {
      logger.error(`Error sending data to real cloud: ${error.message}`);
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
}

async function cacheRequest(cameraId, observationType, data) {
  let cachedRequests = [];
  try {
    const fileContent = fs.readFileSync(REQUESTS_FILE, "utf-8");
    cachedRequests = JSON.parse(fileContent);
  } catch (error) {
    logger.error(`Error reading cached requests: ${error.message}`);
  }

  if (!Array.isArray(cachedRequests)) {
    cachedRequests = [];
  }

  cachedRequests.push({ cameraId, observationType, data });
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(cachedRequests));
  logger.info(`Data cached for later sending: camera ${cameraId}, type ${observationType}`);
}

async function checkConnectivity() {
  logger.info("Checking cloud connectivity");
  if (config.useMockCloud) {
    isCloudAvailable = true;
    logger.info("Mock cloud is always available");
  } else {
    try {
      await axios.get(`${config.realCloudUrl}/health`);
      isCloudAvailable = true;
      logger.info("Real cloud is reachable");
    } catch (error) {
      isCloudAvailable = false;
      logger.warn("Real cloud is not reachable");
    }
  }

  if (isCloudAvailable) {
    logger.info("Attempting to send cached requests");
    await sendCachedRequests();
  }
}

async function sendCachedRequests() {
  let cachedRequests = [];
  try {
    const fileContent = fs.readFileSync(REQUESTS_FILE, "utf-8");
    cachedRequests = JSON.parse(fileContent);
  } catch (error) {
    logger.error(`Error reading cached requests: ${error.message}`);
  }

  if (!Array.isArray(cachedRequests)) {
    logger.warn("Cached requests is not an array, resetting to empty array");
    cachedRequests = [];
  }

  const remainingRequests = [];

  for (const request of cachedRequests) {
    try {
      await sendToCloud(request.cameraId, request.observationType, request.data);
      logger.info(`Successfully sent cached request to cloud: camera ${request.cameraId}, type ${request.observationType}`);
    } catch (error) {
      logger.error(`Failed to send cached request: ${error.message}`);
      remainingRequests.push(request);
    }
  }

  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(remainingRequests));
  logger.info(`${cachedRequests.length - remainingRequests.length} cached requests sent, ${remainingRequests.length} remaining`);
}

// Check connectivity every minute
setInterval(checkConnectivity, CHECK_INTERVAL);

app.listen(PORT, () => {
  logger.info(`Proxy server is running on port ${PORT}`);
  logger.info(`Using ${config.useMockCloud ? "mock" : "real"} cloud`);
});

// Initial connectivity check
checkConnectivity();
