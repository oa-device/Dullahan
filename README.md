# Dullahan Project

## Overview

Dullahan is an internal multi-platform video analysis system designed for Mac and Ubuntu, leveraging YOLO-based object detection to process multiple video streams in real-time. It builds upon the existing oaTracker project, focusing on local data processing to respect privacy by not uploading or storing images in the cloud. The project uses a hybrid approach, with the tracker module running as a native Python application and the orchestrator and proxy components containerized using Docker for improved consistency and easier deployment.

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Development](#development)
7. [API Endpoints](#api-endpoints)
8. [Docker Setup](#docker-setup)
9. [Logging](#logging)

## Architecture

Dullahan consists of three main components:

1. **Tracker**

   - Core functionality from oaTracker
   - YOLO-based object detection using Ultralytics
   - Multi-source video support
   - HTTP API for data access
   - Runs as a native Python application

2. **Proxy Cache** (Docker container)

   - Manages network interruptions
   - Request caching and auto-resend
   - 5-minute network check interval
   - Handles Cloud Integration
   - HTTP/HTTPS data transmission to cloud services

3. **Orchestrator** (Docker container)
   - Central management for multiple trackers
   - Data flow coordination
   - System-wide optimization

## Prerequisites

- Python 3.10
- Docker
- Docker Compose
- Git

## Installation

1. Clone the repository:

   ```bash
   # Clone the repository
   git clone <repository_url> dullahan

   # Navigate to the project directory
   cd dullahan
   ```

2. Set up the tracker module:

   ```bash
   cd apps/tracker
   ./setup.sh
   ```

3. Build and start the Docker containers for orchestrator and proxy:

   ```bash
   cd ../..
   docker-compose up --build orchestrator proxy
   ```

## Configuration

Edit the `config.yaml` file in the project root directory to customize settings. The Docker containers and the tracker module will use this configuration file.

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

To start the Dullahan system:

1. Start the tracker module:

   ```bash
   cd apps/tracker
   source venv/bin/activate
   python main.py
   ```

2. In a new terminal, start the Docker containers:

   ```bash
   docker-compose up orchestrator proxy
   ```

To stop the system:

1. Stop the tracker module by pressing Ctrl+C in its terminal.
2. Stop the Docker containers:

   ```bash
   docker-compose down
   ```

## Development

### Workflow

1. Implement the tracker component as a native Python application
2. Develop the orchestrator and proxy components within their respective Docker containers
3. Ensure cross-platform compatibility for each module
4. Integrate components following the system diagram
5. Implement comprehensive testing for the entire system
6. Optimize for real-time performance

### Key Tasks

1. Enhance oaTracker for Dullahan integration within the tracker module
2. Develop Proxy Cache with robust error handling, caching, and cloud integration
3. Create Orchestrator for multi-tracker management
4. Ensure seamless communication between the native tracker and containerized components

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

## Docker Setup

The project uses Docker to containerize the orchestrator and proxy components. The `docker` directory contains subdirectories for these components:

- `docker/proxy`: Dockerfile and related files for the Proxy Cache component
- `docker/orchestrator`: Dockerfile and related files for the Orchestrator component

The `docker-compose.yml` file in the root directory defines the multi-container Docker application for these components.

To build the Docker images:

```bash
docker-compose build orchestrator proxy
```

To start the containers:

```bash
docker-compose up orchestrator proxy
```

To stop and remove the containers:

```bash
docker-compose down
```

## Logging

Dullahan uses a universal logging system that works across all components, including the native tracker application and Docker containers. Logs are collected from each component and can be viewed using appropriate tools.

For the tracker module:

- Logs are written to a file specified in the configuration

For Docker containers:

```bash
docker-compose logs
```

To view logs for a specific container:

```bash
docker-compose logs [proxy|orchestrator]
```

For more detailed logging information, refer to the logging documentation in each component's respective directory.

This hybrid setup ensures consistent logging across all components of the Dullahan project, regardless of whether they are containerized or running natively, and provides easy access to logs for debugging and monitoring purposes.
