#!/bin/bash

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Debug mode flag
DEBUG=false

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

# Function to log debug messages
debug() {
    if [ "$DEBUG" = true ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# Function to update a submodule to the latest version
update_submodule() {
    local submodule=$1
    local branch=${2:-main}
    log "Updating $submodule to the latest version on branch $branch..."
    if [ -d "apps/$submodule" ]; then
        (
            cd "apps/$submodule" || {
                error "Failed to change directory to apps/$submodule"
                exit 1
            }
            debug "Current directory: $(pwd)"
            debug "Git status:"
            git status

            # Check for local changes
            if ! git diff-index --quiet HEAD --; then
                warn "Local changes detected in $submodule. Stashing changes..."
                git stash
            fi

            debug "Fetching from origin..."
            if ! git fetch origin; then
                error "Failed to fetch from origin for $submodule"
                return 1
            fi

            debug "Checking out $branch branch..."
            if ! git checkout $branch; then
                error "Failed to checkout $branch branch for $submodule"
                return 1
            fi

            debug "Merging origin/$branch..."
            if ! git merge --ff-only origin/$branch; then
                error "Failed to merge origin/$branch for $submodule. You may need to resolve conflicts manually."
                return 1
            fi

            # Apply stashed changes if any
            if git stash list | grep -q 'stash@{0}'; then
                warn "Applying stashed changes for $submodule..."
                git stash pop
            fi

            log "Successfully updated $submodule"
        )
    else
        warn "Directory apps/$submodule does not exist. Skipping update."
    fi
}

# Function to run setup script for a submodule
setup_submodule() {
    local submodule=$1
    log "Setting up $submodule..."
    if [ -f "apps/$submodule/setup.sh" ]; then
        (
            cd "apps/$submodule" || {
                error "Failed to change directory to apps/$submodule"
                exit 1
            }
            debug "Running setup.sh for $submodule"
            if ! bash setup.sh; then
                error "Failed to run setup.sh for $submodule"
                return 1
            fi
        )
    else
        warn "setup.sh not found in $submodule directory. Skipping setup."
    fi
}

# Function to create necessary directories and set up logging
setup_logging() {
    mkdir -p logs
    if [ -f "scripts/log.sh" ]; then
        chmod +x scripts/log.sh
        log "Logging setup complete."
    else
        warn "scripts/log.sh not found. Skipping log setup."
    fi
}

# Main setup process
main() {
    log "Setting up Dullahan project..."

    # Set up logging
    setup_logging

    # Initialize submodules
    log "Initializing submodules..."
    if ! git submodule update --init --recursive; then
        error "Failed to initialize submodules"
        exit 1
    fi

    # Update and set up each submodule
    update_submodule "tracker"
    setup_submodule "tracker"

    update_submodule "proxy" "dev"
    setup_submodule "proxy"

    if [ -d "apps/orchestrator" ]; then
        update_submodule "orchestrator"
        setup_submodule "orchestrator"
    else
        warn "Orchestrator submodule not found. Skipping."
    fi

    log "Dullahan project setup complete!"
}

# Check for debug flag
if [ "$1" = "--debug" ]; then
    DEBUG=true
    debug "Debug mode enabled"
fi

# Run the main setup process
main
