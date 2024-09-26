# README.md

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Implementation Details](#implementation-details)
- [Test](#test)

## Overview

`proxy.js` is a Node.js application designed to handle incoming HTTP POST requests, forward them to a specified URL, and cache the requests if the forwarding fails due to network issues. The application periodically checks for network connectivity and retries sending the cached requests.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Installation

1. Clone the repository:

   ```sh
   git clone <repository_url>
   ```

2. Navigate to the project directory:

   ```sh
   cd <project_directory>
   ```

3. Install the dependencies:

   ```sh
   npm install
   ```

## Usage

1. Start the server:

   ```sh
   node proxy.js
   ```

2. The server will run on port 3000 by default. You can specify a different port by setting the `PORT` environment variable.

## API Endpoints

### POST /data

**Description**: Receives data and attempts to forward it to the specified URL.

**Query Parameters**:

- `url` (string): The target URL to forward the request to. This parameter is required.
- Any other query parameters received will also be forwarded or cached for resending.

**Request Headers**:

- All headers received will be forwarded or cached for resending.

**Request Body**:

- JSON payload to be forwarded.

**Responses**:

- `200 OK`: Request forwarded successfully.
- `200 OK`: Failed to forward request, saved for later retry.
- `400 Bad Request`: URL is required.

### POST /network

**Description**: Activates or deactivates `nock` for the specified URL.

**Query Parameters**:

- `nock` (string): The URL to activate `nock` for. Causes all POST requests to this URL to succeed with a "Failed to forward request, saved for later retry.".
- `unnock` (string): The URL to deactivate `nock` for.

**Responses**:

- `200 OK`: `Nock` activated/deactivated for the specified URL.
- `400 Bad Request`: Query parameter `nock` or `unnock` is required.

## Implementation Details

### Dependencies

- `express`: Web framework for Node.js.
- `axios`: HTTP client for making requests.
- `fs`: File system module for reading and writing files.
- `path`: Module for handling file paths.
- `ping`: Utility to check network connectivity.
- `nock`: HTTP mocking and expectations library.

### File Structure

- `proxy.js`: Main application file.
- `requests.json`: JSON file used to cache failed requests.

### Functions

#### forwardRequest(url, data, headers, queryParams)

- Forwards the request to the specified URL using Axios with headers and query parameters.

#### saveRequest(url, data, headers, queryParams)

- Saves the request data, headers, and query parameters to `requests.json` for later retry if forwarding fails.

#### checkConnectivity()

- Checks network connectivity by pinging `google.com`. If the network is available, it calls `resendRequests()`.

#### resendRequests()

- Reads cached requests from `requests.json` and attempts to resend them.

### Network Connectivity Check

- The application checks network connectivity every 5 minutes and attempts to resend any cached requests if the network is available.

## Test

To ensure the functionality of the application, we have included a set of automated tests. These tests cover various scenarios for the `/data` and `/network` endpoints. Below are the steps to run the tests and a brief overview of what each test does.

### Running the Tests

1. **Install the Development Dependencies:**
   Ensure you have the necessary testing libraries installed.

   ```sh
   npm install mocha chai nock supertest --save-dev
   ```

2. **Run the Tests:**
   Execute the tests using Mocha.

   ```sh
   npx mocha test/test.js
   ```

### Test Scenarios

Tests aren't working yet. Don't consider this section.

#### POST /data

1. **Successful Forwarding:**

   - Test to verify that a request is forwarded successfully to the target URL.
   - Mock the target URL using `nock` to simulate a successful response.
   - Validate that the response status is `200 OK` and the response message is "Request forwarded successfully".

2. **Forwarding Failure:**

   - Test to ensure that a request is saved if forwarding fails.
   - Mock the target URL using `nock` to simulate a network failure.
   - Validate that the response status is `500 Internal Server Error` and the response message is "Failed to forward request, saved for later retry".
   - Confirm that the request details are saved in the `requests.json` file.

3. **Missing URL Parameter:**
   - Test to verify that the endpoint returns a `400 Bad Request` status if the `url` query parameter is missing.
   - Validate that the response message is "URL is required".

#### POST /network

1. **Activate Nock:**

   - Test to activate `nock` for a specified URL.
   - Validate that the response status is `200 OK` and the response message indicates that `nock` is activated for the specified URL.

2. **Deactivate Nock:**

   - Test to deactivate `nock` for a specified URL.
   - Validate that the response status is `200 OK` and the response message indicates that `nock` is deactivated for the specified URL.

3. **Missing Nock/Unnock Parameter:**
   - Test to verify that the endpoint returns a `400 Bad Request` status if neither `nock` nor `unnock` query parameters are provided.
   - Validate that the response message is "Query parameter nock or unnock is required".
