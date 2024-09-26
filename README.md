# Dullahan Project

## Overview

Dullahan is an internal multi-platform video analysis system designed for Mac and Ubuntu, leveraging YOLO-based object detection to process multiple video streams in real-time. It builds upon the existing oaTracker project, focusing on local data processing to respect privacy by not uploading or storing images in the cloud. The project now uses Docker for improved consistency and easier deployment across different environments.

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

Dullahan consists of three main components, each running in its own Docker container:

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

## Prerequisites

- Docker
- Docker Compose
- Git

## Installation

```bash
# Clone the repository
git clone <repository_url> dullahan

# Navigate to the project directory
cd dullahan

# Build and start the Docker containers
docker-compose up --build
```

## Configuration

Edit the `config.yaml` file in the project root directory to customize settings. The Docker containers will use this configuration file.

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

```bash
docker-compose up
```

To stop the system:

```bash
docker-compose down
```

## Development

### Workflow

1. Implement each component separately within its Docker container
2. Ensure cross-platform compatibility for each module
3. Integrate components following the system diagram
4. Implement comprehensive testing for the entire system
5. Optimize for real-time performance

### Key Tasks

1. Enhance oaTracker for Dullahan integration within the Tracker container
2. Develop Proxy Cache with robust error handling, caching, and cloud integration
3. Create Orchestrator for multi-tracker management
4. Ensure seamless inter-container communication

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

The project uses Docker to containerize each component. The `docker` directory contains subdirectories for each component:

- `docker/tracker`: Dockerfile and related files for the Tracker component
- `docker/proxy`: Dockerfile and related files for the Proxy Cache component
- `docker/orchestrator`: Dockerfile and related files for the Orchestrator component

The `docker-compose.yml` file in the root directory defines the multi-container Docker application.

To build the Docker images:

```bash
docker-compose build
```

To start the containers:

```bash
docker-compose up
```

To stop and remove the containers:

```bash
docker-compose down
```

## Logging

Dullahan uses a universal logging system that works across all Docker containers. Logs are collected from each container and can be viewed using Docker's logging capabilities.

To view logs for all containers:

```bash
docker-compose logs
```

To view logs for a specific container:

```bash
docker-compose logs [tracker|proxy|orchestrator]
```

For more detailed logging information, refer to the logging documentation in each component's respective directory.

This Docker-based setup ensures consistent logging across all components of the Dullahan project, regardless of the programming language used in each module, and provides easy access to logs for debugging and monitoring purposes.
