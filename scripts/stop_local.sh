#!/bin/bash

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
  shift
  local ports=("$@")

  log "Stopping $service_name on ports ${ports[*]}..."

  for port in "${ports[@]}"; do
    log "Checking port $port..."
    local pid=$(lsof -ti :$port)
    if [ -n "$pid" ]; then
      log "Killing process $pid on port $port"
      kill $pid
      sleep 2
      if kill -0 $pid 2>/dev/null; then
        warn "Process $pid is still running, forcing stop..."
        kill -9 $pid
        sleep 1
      fi
      if ! kill -0 $pid 2>/dev/null; then
        log "Process on port $port stopped successfully"
      else
        error "Failed to stop process on port $port"
      fi
    else
      warn "No process found running on port $port"
    fi
  done
}

# Main function
main() {
  log "Stopping all services..."

  # Stop tracker (ports 8000 and 8001)
  stop_service "tracker" 8000 8001

  # Stop orchestrator
  stop_service "orchestrator" 3000

  # Stop proxy
  stop_service "proxy" 3001

  log "All services stop attempts completed."

  # Final check
  log "Checking if any services are still running..."
  lsof -i :8000,8001,3000,3001 || log "All services stopped successfully."
}

# Run the main function
main
