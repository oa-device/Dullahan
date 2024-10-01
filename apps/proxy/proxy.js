const express = require("express");
const fs = require("fs");
const path = require("path");
const winston = require("winston");

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
const CHECK_INTERVAL = 60 * 1000; // 1 minute for testing purposes

// Mock cloud storage
let mockCloudStorage = [];
let isCloudAvailable = false;

// Initialize the cached requests file if it doesn't exist
if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([]));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Endpoint to receive data from orchestrator
app.post("/data", async (req, res) => {
  const data = req.body;
  logger.info("Received data from orchestrator");

  try {
    await sendToCloud(data);
    res.status(200).send("Data sent to cloud successfully");
  } catch (error) {
    logger.error(`Failed to send data to cloud: ${error.message}`);
    await cacheRequest(data);
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
  res.status(200).json(mockCloudStorage);
});

async function sendToCloud(data) {
  if (!isCloudAvailable) {
    throw new Error("Cloud is not available");
  }
  mockCloudStorage.push(data);
  logger.info("Data sent to mock cloud storage");
}

async function cacheRequest(data) {
  const cachedRequests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf-8"));
  cachedRequests.push(data);
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(cachedRequests));
  logger.info("Data cached for later sending");
}

async function checkConnectivity() {
  logger.info("Checking cloud connectivity");
  if (isCloudAvailable) {
    logger.info("Cloud is reachable. Attempting to send cached requests");
    await sendCachedRequests();
  } else {
    logger.warn("Cloud is not reachable");
  }
}

async function sendCachedRequests() {
  const cachedRequests = JSON.parse(fs.readFileSync(REQUESTS_FILE, "utf-8"));
  const remainingRequests = [];

  for (const request of cachedRequests) {
    try {
      await sendToCloud(request);
      logger.info("Successfully sent cached request to cloud");
    } catch (error) {
      logger.error(`Failed to send cached request: ${error.message}`);
      remainingRequests.push(request);
    }
  }

  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(remainingRequests));
  logger.info(`${cachedRequests.length - remainingRequests.length} cached requests sent, ${remainingRequests.length} remaining`);
}

// Check connectivity every minute (for testing purposes)
setInterval(checkConnectivity, CHECK_INTERVAL);

app.listen(PORT, () => {
  logger.info(`Proxy server is running on port ${PORT}`);
});

// Initial connectivity check
checkConnectivity();
