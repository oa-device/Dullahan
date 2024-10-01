# Proxy

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Functionality](#functionality)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Logging](#logging)
- [Testing Features](#testing-features)

## Overview

The Proxy is a crucial component of the Dullahan project, acting as an intermediary between the Orchestrator and the cloud storage. It receives data from the Orchestrator, attempts to send it to the cloud, and implements a caching mechanism to handle scenarios where the cloud is temporarily unavailable.

## Prerequisites

- Node.js (v12 or higher recommended)
- npm (Node Package Manager)

## Installation

1. Navigate to the proxy directory:

   ```sh
   cd apps/proxy
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

## Usage

To start the Proxy:

```sh
node proxy.js
```

The Proxy will start and listen on the configured port (default is 3001).

## Functionality

The Proxy performs several key functions:

1. **Data Reception**: Receives data from the Orchestrator through a POST endpoint.

2. **Cloud Communication**: Attempts to send received data to the cloud storage.

3. **Data Caching**: If cloud storage is unavailable, caches the data locally for later transmission.

4. **Periodic Connectivity Checks**: Regularly checks cloud connectivity and attempts to send cached data when the cloud becomes available.

5. **Logging**: Maintains detailed logs of its operations, errors, and important events.

## API Endpoints

### POST /data

**Description**: Receives data from the Orchestrator and attempts to send it to the cloud.

**Request Body**: JSON payload containing the data to be sent to the cloud.

**Responses**:

- `200 OK`: Data sent to cloud successfully.
- `202 Accepted`: Data cached for later sending (when cloud is unavailable).

### GET /health

**Description**: Health check endpoint for the Proxy.

**Response**:

- `200 OK` with JSON body `{ status: "OK" }` if the Proxy is healthy.

### POST /toggle-cloud (For Testing)

**Description**: Toggles the availability of the mock cloud storage.

**Response**:

- `200 OK` with JSON body indicating the new cloud availability status.

### GET /view-cloud (For Testing)

**Description**: Retrieves the contents of the mock cloud storage.

**Response**:

- `200 OK` with JSON body containing the mock cloud storage data.

## Configuration

The Proxy uses environment variables for configuration:

- `PROXY_PORT`: The port on which the Proxy server will run (default: 3001)
- `NODE_ENV`: Set to 'production' to disable console logging

## Logging

The Proxy uses Winston for logging. Logs are written to:

- `error.log`: For error-level logs
- `combined.log`: For all log levels

In non-production environments, logs are also output to the console.

## Implementation Details

### Data Flow

1. The Proxy receives data from the Orchestrator via the `/data` endpoint.
2. It attempts to send this data to the cloud immediately.
3. If sending fails (e.g., cloud is unavailable), the data is cached locally in a JSON file.
4. Every minute, the Proxy checks cloud connectivity and attempts to send any cached data.

### Caching Mechanism

- Cached requests are stored in a `requests.json` file.
- When cloud connectivity is restored, the Proxy attempts to send all cached requests.
- Successfully sent requests are removed from the cache.

### Mock Cloud Storage

For testing and development purposes, the Proxy implements a mock cloud storage:

- An in-memory array simulates cloud storage.
- Cloud availability can be toggled for testing error scenarios.
- The contents of the mock cloud can be viewed via an API endpoint.

## Testing Features

The Proxy includes features to facilitate testing:

1. **Toggle Cloud Availability**: Use the `/toggle-cloud` endpoint to simulate cloud outages and recoveries.
2. **View Mock Cloud Data**: Use the `/view-cloud` endpoint to inspect data that has been successfully "sent" to the cloud.
3. **Configurable Check Interval**: The `CHECK_INTERVAL` constant in the code can be adjusted to change how frequently the Proxy checks for cloud connectivity and attempts to send cached data.

## Note on Traditional Approach

Currently, the Proxy is designed to run directly on the host system without Docker containerization. This traditional approach allows for easier setup and debugging during the initial development phases. Future versions may incorporate Docker for improved deployment and scalability.
