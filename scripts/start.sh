#!/bin/bash

# Function to suppress output
suppress_output() {
    "$@" >/dev/null 2>&1
}

# Start tracker(s)
echo "Starting tracker(s)..."
cd apps/tracker
suppress_output source .venv/bin/activate
suppress_output python tracker.py &
cd ../..

# Start orchestrator and proxy containers
echo "Starting orchestrator and proxy containers..."
docker-compose up -d

echo "System started. Use 'docker-compose logs' to view container logs."
