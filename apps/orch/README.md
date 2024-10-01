# Orchestrator

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Functionality](#functionality)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Logging](#logging)

## Overview

The Orchestrator is a crucial component of the Dullahan project, responsible for central management of multiple trackers, data flow coordination, and system-wide optimization. It acts as an intermediary between the trackers and the proxy, collecting data from trackers and forwarding it to the proxy for further processing.

## Prerequisites

- Node.js (v12 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Navigate to the orchestrator directory:

   ```sh
   cd apps/orch
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

## Usage

To start the Orchestrator:

```sh
node orchestrator.js
```

The Orchestrator will start and listen on the configured port (default is 3000).

## Functionality

The Orchestrator performs several key functions:

1. **Data Collection**: Periodically collects data from configured trackers, including current detections, unique object counts, and person counts.

2. **Data Forwarding**: Sends collected data to the proxy for further processing and storage.

3. **Health Monitoring**: Regularly checks the health of connected trackers and its own health.

4. **Error Handling and Retries**: Implements retry logic for data collection and forwarding to handle temporary network issues.

5. **Logging**: Maintains detailed logs of its operations, errors, and important events.

## Configuration

The Orchestrator uses a `config.yaml` file for its configuration. This file should be located in the same directory as the `orchestrator.js` file. Key configuration options include:

- Tracker URLs
- Proxy URL
- Health check intervals and timeouts

## API Endpoints

### GET /health

**Description**: Health check endpoint for the Orchestrator.

**Response**:

- `200 OK` with JSON body `{ status: "OK" }` if the Orchestrator is healthy.

## Logging

The Orchestrator uses Winston for logging. Logs are written to:

- `error.log`: For error-level logs
- `combined.log`: For all log levels

In non-production environments, logs are also output to the console.

## Implementation Details

### Data Collection Process

1. The Orchestrator attempts to collect data from the configured tracker every minute.
2. It fetches three types of data:
   - Current detections
   - Unique object counts for the last 30 seconds
   - Person count for the last minute
3. If data collection fails, it retries up to 3 times with a 5-second delay between attempts.

### Data Forwarding

Collected data is immediately sent to the proxy using a POST request. If sending fails, an error is logged, but the Orchestrator continues its operations.

### Health Checks

1. Tracker health is checked at intervals specified in the configuration.
2. The Orchestrator's own health is checked every 5 minutes.
3. Health check results are logged for monitoring purposes.

### Error Handling

The Orchestrator implements robust error handling:

- All operations are wrapped in try-catch blocks.
- Detailed error information is logged, including response status and data when available.
- Retry mechanisms are in place for critical operations like data collection.

## Note on Traditional Approach

Currently, the Orchestrator is designed to run directly on the host system without Docker containerization. This traditional approach allows for easier setup and debugging during the initial development phases. Future versions may incorporate Docker for improved deployment and scalability.
