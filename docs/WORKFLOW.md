# Dullahan System Architecture

## Table of Contents

1. [Overview](#overview)
2. [System Components](#system-components)
3. [Workflow Diagram](#workflow-diagram)
4. [Data Flow](#data-flow)

## Overview

The Dullahan project is a multi-platform video analysis system designed for Mac and Ubuntu. It leverages YOLO-based object detection to process multiple video streams in real-time. The system consists of three main components: Tracker, Proxy Cache, and Orchestrator, which work together to capture, process, and transmit video analysis data.

## System Components

1. **Tracker**

   - Processes video streams using YOLO-based object detection
   - Generates observations (e.g., crowd counts, object detection)
   - Exposes an HTTP API for data access
   - Note: The tracker module is a clone of the oaTracker repository

2. **Proxy Cache**

   - Manages network interruptions
   - Caches requests when the network is unavailable
   - Automatically resends cached requests when the network is restored

3. **Orchestrator**
   - Manages multiple Tracker instances
   - Coordinates data flow between Trackers and Proxy Cache
   - Optimizes system-wide performance

## Workflow Diagram

```mermaid
graph LR
    subgraph Cameras
        C1[Camera 1]
        C2[Camera 2]
    end

    subgraph "Mac/Ubuntu System"
        subgraph Trackers
            T1[Tracker 1]
            T2[Tracker 2]
        end
        O[Orchestrator]
        PC[Proxy Cache]
        FS[(File System)]
    end

    Cloud[Cloud Service]
    S3[(S3 Bucket)]
    User[User Email]

    C1 -->|Video Stream| T1
    C2 -->|Video Stream| T2
    T1 --> O
    T2 --> O
    O --> PC
    PC -->|Cache| FS
    PC -.->|HTTP/HTTPS| Cloud
    Cloud -->|Daily CSV| S3
    S3 -.->|Email Link| User

    classDef camera fill:#000000,stroke:#000000,stroke-width:2px,color:#ffffff;
    classDef tracker fill:#78e08f,stroke:#38ada9,stroke-width:2px,color:#ffffff;
    classDef orchestrator fill:#ff5252,stroke:#ff2a2a,stroke-width:2px,color:#ffffff;
    classDef proxy fill:#f78fb3,stroke:#e66767,stroke-width:2px,color:#ffffff;
    classDef storage fill:#bdc3c7,stroke:#7f8c8d,stroke-width:2px,color:#000000;
    classDef cloud fill:#f6b93b,stroke:#e58e26,stroke-width:2px,color:#ffffff;
    classDef user fill:#ffcc33,stroke:#e5b800,stroke-width:2px,color:#000000;

    class C1,C2 camera;
    class T1,T2 tracker;
    class O orchestrator;
    class PC proxy;
    class FS,S3 storage;
    class Cloud cloud;
    class User user;

    style Cameras fill:#ecf0f1,stroke:#2c3e50,stroke-width:2px;

```

## Data Flow

1. **Video Input**

   - Cameras (webcams or RTSP streams) provide video input to the Trackers

2. **Video Processing**

   - Trackers analyze video streams using YOLO-based object detection
   - Trackers generate observations (e.g., crowd counts, object detection)

3. **Data Aggregation**

   - The Orchestrator collects data from multiple Trackers
   - The Orchestrator may perform additional processing or optimization

4. **Data Transmission**

   - The Orchestrator sends processed data to the Proxy Cache
   - The Proxy Cache attempts to send data to the cloud service

5. **Caching and Retry**

   - If the network is unavailable, the Proxy Cache stores data locally
   - The Proxy Cache periodically checks network connectivity
   - When the network is restored, cached data is sent to the cloud service

6. **Cloud Processing**
