# Dullahan Project

## Overview

Dullahan is an internal multi-platform video analysis system designed for Mac and Ubuntu, leveraging YOLO-based object detection to process multiple video streams in real-time. It builds upon the existing oaTracker project, focusing on local data processing to respect privacy by not uploading or storing images in the cloud.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage](#usage)
5. [Development](#development)
6. [API Endpoints](#api-endpoints)
7. [Dummy Tracker](#dummy-tracker)
8. [Logging](#logging)

## Architecture

Dullahan consists of three main components:

1. **Tracker**

   - Core functionality from oaTracker (currently represented by a dummy implementation)
   - YOLO-based object detection using Ultralytics (to be implemented)
   - Multi-source video support (to be implemented)
   - HTTP API for data access

2. **Proxy Cache**

   - Manages network interruptions
   - Request caching and auto-resend
   - 5-minute network check interval
   - Handles Cloud Integration
   - HTTP/HTTPS data transmission to cloud services

3. **Orchestrator**
   - Central management for multiple trackers
   - Data flow coordination
   - System-wide optimization

## Installation

```bash
# Clone the repository
git clone <repository_url> dullahan

# Navigate to the project directory
cd dullahan

# Run the setup script
./scripts/setup.sh
```

## Configuration

Edit the `config.yaml` file in the project root directory to customize settings:

```yaml
cloud:
  url: "https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com"

trackers:
  count: 2
  model: "yolov8n.pt"

video_sources:
  - name: "Camera 1"
    type: "webcam"
    id: 0
  - name: "Camera 2"
    type: "rtsp"
    url: "rtsp://example.com/stream1"

proxy_cache:
  enabled: true
  check_interval: 300

observation_types:
  - "crowd"
  - "doors"
  - "views"
  - "waiting_time"
  - "objects"
# ... (other configuration options)
```

## Usage

TODO

## Development

### Workflow

1. Implement each component separately
2. Ensure cross-platform compatibility for each module
3. Integrate components following the system diagram
4. Implement comprehensive testing for the entire system
5. Optimize for real-time performance

### Key Tasks

1. Enhance oaTracker for Dullahan integration
2. Develop Proxy Cache with robust error handling, caching, and cloud integration
3. Create Orchestrator for multi-tracker management
4. Ensure seamless inter-component communication

## API Endpoints

### POST /cameras/{id}/observations/{type}

Post observations for a specific camera and observation type. Data should always be sent as arrays to allow for batch processing.

**URL**: `https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/{id}/observations/{type}`

**Method**: `POST`

**Headers**:

- Content-Type: application/json

**Path Parameters**:

- `id`: Camera ID (e.g., "RGQRj2nlCwYvwIIKQY0aV")
- `type`: Observation type (one of: "crowd", "doors", "views", "waiting_time", "objects")

**Request Body**:
The request body should always be an array of observation objects, even for single observations.

```json
[
  {
    "ts": 1725978295645,
    "person": 32,
    "suitcase": 22
  }
]
```

**Examples**:

1. Objects observation:

   ```bash
   curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/RGQRj2nlCwYvwIIKQY0aV/observations/objects' \
   --header 'Content-Type: application/json' \
   --data '[
       {
           "ts": 1725978295645,
           "person": 32,
           "suitcase": 22
       }
   ]'
   ```

2. Waiting time observation:

   ```bash
   curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/RGQRj2nlCwYvwIIKQY0aV/observations/waiting_time' \
   --header 'Content-Type: application/json' \
   --data '[
       {
           "ts_start": 1725978295645,
           "ts_end": 1725978942645
       },
       {
           "ts_start": 1725978277463,
           "ts_end": 1725978579463
       }
   ]'
   ```

3. Door observation:

   ```bash
   curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/RGQRj2nlCwYvwIIKQY0aV/observations/doors' \
   --header 'Content-Type: application/json' \
   --data '[
       {
           "ts_start": 1725978295645,
           "ts_end": 1725978325645,
           "in": 1,
           "out": 44
       }
   ]'
   ```

4. Crowd observation:

   ```bash
   curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/RGQRj2nlCwYvwIIKQY0aV/observations/crowd' \
   --header 'Content-Type: application/json' \
   --data '[
    {
        "ts": 1725978295645,
        "count": 4734,
        "uncertainty": 0.1
    }
   ]'
   ```

5. Views observation:

   ```bash
   curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/RGQRj2nlCwYvwIIKQY0aV/observations/views' \
   --header 'Content-Type: application/json' \
   --data '[
       {
           "ts_start": 1725978295645,
           "ts_end": 1725978325645,
           "views": 5,
           "presence": 10,
           "attention": 44
       }
   ]'
   ```

Note: Replace "RGQRj2nlCwYvwIIKQY0aV" with your actual camera ID for testing.

### Proxy Cache Behavior

If the network isn't available, the request will be saved in `requests.json`. The proxy will check the network every 5 minutes. When the network is back, all saved requests will be replayed to the cloud.

Example of a cached request:

```bash
curl --location 'https://7pyzcafao6.execute-api.ca-central-1.amazonaws.com/cameras/dmiui2w84H22CpiycHhGk/observations/objects' \
--header 'Content-Type: application/json' \
--data '[
    {
        "id": "2a535261-d90c-d764-0bd4-33186992ec37",
        "deviceId": "dmiui2w84H22CpiycHhGk",
        "person": 32,
        "receivedAt": "2024-09-11T20:48:28.087Z",
        "suitcase": 22,
        "ts": 1725978295645
    },
    {
        "id": "2a535261-d90c-d764-0bd4-33186992ec37",
        "deviceId": "dmiui2w84H22CpiycHhGk",
        "person": 32,
        "receivedAt": "2024-09-11T20:48:28.087Z",
        "suitcase": 22,
        "ts": 1725978295645
    }
]'
```

This example shows how multiple observations can be sent in a single request, demonstrating the batch processing capability.

## Dummy Tracker

A temporary dummy tracker has been implemented to simulate the behavior of the actual tracker while it's still under development. This allows for testing and development of other components in the Dullahan project.

### Features

- Generates random detection data
- Provides a simple HTTP API endpoint for data retrieval
- Mimics the expected data format of the actual tracker

### Setup and Usage

1. Navigate to the `apps/tracker` directory
2. Run `npm install` to install dependencies
3. Start the server with `npm start`
4. Access random detection data at `http://localhost:3000/detect`

For more details, refer to the README.md file in the `apps/tracker` directory.

Note: This dummy tracker is a temporary solution and should be replaced with the actual tracker implementation once it's ready.

## Logging

Dullahan uses a universal logging system that works across both Python and Node.js components. The logging system is based on a bash script (`scripts/log.sh`) and provides wrapper modules for both Python and Node.js.

### Python Logging

To use logging in Python files:

```python
from shared.python_logging import info, warn, error

info('module_name', 'This is an informational message')
warn('module_name', 'This is a warning message')
error('module_name', 'This is an error message')
```

### Node.js Logging

To use logging in Node.js files:

```javascript
const logger = require('../../shared/node_logging');

logger.info('module_name', 'This is an informational message');
logger.warn('module_name', 'This is a warning message');
logger.error('module_name', 'This is an error message');
```

Logs are written to the `logs/` directory, with separate log files for each module. The logging system automatically handles log rotation to manage file sizes and maintain a history of log files.

The logging system is set up during the project initialization process in the `setup.sh` script. It creates the necessary directories and ensures that the logging script is executable.

This universal logging approach ensures consistent logging across all components of the Dullahan project, regardless of the programming language used in each module.
