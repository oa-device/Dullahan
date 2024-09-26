#!/bin/bash

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
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

# Function to run setup script for a submodule
setup_submodule() {
    local submodule=$1
    log "Setting up $submodule..."
    if [ -f "apps/$submodule/setup.sh" ]; then
        (cd "apps/$submodule" && bash setup.sh)
    else
        warn "setup.sh not found in $submodule directory. Skipping setup."
    fi
}

# Function to create necessary directories and set up logging
setup_logging() {
    mkdir -p logs
    chmod +x scripts/log.sh
    log "Logging setup complete."
}

# Main setup process
main() {
    log "Setting up Dullahan project..."

    # Set up logging
    setup_logging

    # Initialize and update submodules
    log "Initializing and updating submodules..."
    git submodule update --init --recursive

    # Set up each submodule
    for submodule in tracker proxy orchestrator; do
        setup_submodule "$submodule"
    done

    log "Dullahan project setup complete!"
}

# Run the main setup process
main