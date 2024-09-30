#!/bin/bash

set -e

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to log messages
log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

# Function to log warnings
warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to log errors
error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to stop a service
stop_service() {
  local service_name=$1
  local grep_pattern=$2
  log "Stopping $service_name..."
  if pkill -f "$grep_pattern"; then
    log "$service_name stopping initiated"
    sleep 5  # Wait for the process to stop
    if pgrep -f "$grep_pattern" > /dev/null; then
      warn "$service_name is still running, forcing stop..."
      pkill -9 -f "$grep_pattern"
      sleep 2
    fi
    if ! pgrep -f "$grep_pattern" > /dev/null; then
      log "$service_name stopped successfully"
    else
      error "Failed to stop $service_name"
    fi
  else
    warn "$service_name was not running"
  fi
}

# Main function
main() {
  log "Stopping all services..."

  # Stop tracker
  stop_service "tracker" "python.*tracker.py"

  # Stop orchestrator
  stop_service "orchestrator" "node.*apps/orch/orchestrator.js"

  # Stop proxy
  stop_service "proxy" "node.*apps/proxy/proxy.js"

  log "All services stop attempts completed."
}

# Run the main function
main