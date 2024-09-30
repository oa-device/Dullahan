#!/bin/bash

# Function to suppress output
suppress_output() {
    "$@" > /dev/null 2>&1
}

# Stop tracker(s)
echo "Stopping tracker(s)..."
suppress_output pkill -f "python tracker.py"

# Stop orchestrator and proxy containers
echo "Stopping orchestrator and proxy containers..."
docker-compose down

echo "System stopped."