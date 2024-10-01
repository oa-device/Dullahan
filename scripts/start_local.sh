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

# Function to check if a port is in use
is_port_in_use() {
  local port=$1
  if lsof -i :$port >/dev/null 2>&1; then
    return 0 # Port is in use
  else
    return 1 # Port is not in use
  fi
}

# Function to check health of a service
check_health() {
  local service_name=$1
  local url=$2
  local max_attempts=5
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -s "$url" | grep -q "OK"; then
      log "$service_name is healthy"
      return 0
    fi
    log "Waiting for $service_name to become healthy (attempt $attempt/$max_attempts)..."
    sleep 5
    attempt=$((attempt + 1))
  done

  error "$service_name failed to become healthy after $max_attempts attempts"
  return 1
}

# Function to start tracker
start_tracker() {
  log "Starting tracker..."
  cd apps/tracker || {
    error "Failed to change directory to apps/tracker"
    exit 1
  }
  if [ ! -d ".venv" ]; then
    error "Virtual environment not found. Please run setup script first."
    exit 1
  fi
  source .venv/bin/activate || {
    error "Failed to activate virtual environment"
    exit 1
  }

  if is_port_in_use 8000; then
    error "Port 8000 is already in use. Cannot start tracker."
    exit 1
  fi

  python tracker.py --trackAll >../../logs/tracker.log 2>&1 &
  TRACKER_PID=$!
  log "Tracker started with PID $TRACKER_PID"
  cd ../..
  sleep 5
  if ! ps -p $TRACKER_PID >/dev/null; then
    warn "Tracker process exited. This might be normal if no video sources are available."
    warn "Check logs/tracker.log for details."
    cat logs/tracker.log
  else
    log "Tracker process is running."
  fi
}

# Function to start orchestrator
start_orchestrator() {
  log "Starting orchestrator..."
  cd apps/orch || {
    error "Failed to change directory to apps/orch"
    exit 1
  }
  if [ ! -f "package.json" ]; then
    error "package.json not found in apps/orch. Please check the project structure."
    exit 1
  fi

  if is_port_in_use 3000; then
    error "Port 3000 is already in use. Cannot start orchestrator."
    exit 1
  fi

  npm start >../../logs/orchestrator.log 2>&1 &
  ORCH_PID=$!
  log "Orchestrator started with PID $ORCH_PID"
  cd ../..
  sleep 2
  if ! ps -p $ORCH_PID >/dev/null; then
    error "Orchestrator failed to start. Check logs/orchestrator.log for details."
    cat logs/orchestrator.log
    exit 1
  fi
  check_health "Orchestrator" "http://localhost:3000/health" || exit 
}

# Function to start proxy
start_proxy() {
  log "Starting proxy..."
  cd apps/proxy || {
    error "Failed to change directory to apps/proxy"
    exit 1
  }
  if [ ! -f "package.json" ]; then
    error "package.json not found in apps/proxy. Please check the project structure."
    exit 1
  fi

  if is_port_in_use 3001; then
    error "Port 3001 is already in use. Cannot start proxy."
    exit 1
  fi

  npm start >../../logs/proxy.log 2>&1 &
  PROXY_PID=$!
  log "Proxy started with PID $PROXY_PID"
  cd ../..
  sleep 2
  if ! ps -p $PROXY_PID >/dev/null; then
    error "Proxy failed to start. Check logs/proxy.log for details."
    cat logs/proxy.log
    exit 1
  fi
  check_health "Proxy" "http://localhost:3001/health" || exit 1
}

# Main function
main() {
  log "Starting all services locally..."

  # Create logs directory if it doesn't exist
  mkdir -p logs

  # Start tracker
  start_tracker

  # Start orchestrator
  start_orchestrator

  # Start proxy
  start_proxy

  log "All services start attempts completed."
  log "Check the log files in the 'logs' directory for more information:"
  log "- Tracker log: logs/tracker.log"
  log "- Orchestrator log: logs/orchestrator.log"
  log "- Proxy log: logs/proxy.log"
}

# Run the main function
main
