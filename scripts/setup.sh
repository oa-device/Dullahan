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
FORCE_UPDATE=false
SKIP_UPDATE=false

# Array to store arguments for tracker setup
TRACKER_ARGS=()

# Function to display usage information
display_usage() {
    cat << EOF
Usage: ./setup.sh [OPTIONS] [TRACKER_OPTIONS]

This script sets up the Dullahan project, including its submodules.

OPTIONS:
  --debug         Enable debug mode for this script
  --force-update  Force update submodules, overwriting local changes
  --skip-update   Skip updating submodules

TRACKER_OPTIONS:
  Any additional options will be passed to the tracker's setup script.
  Common tracker options include:
    -h, --help              Display tracker help message and exit
    -c, --clean             Clean up previous installations before setup
    -p, --pyenv <option>    Specify pyenv installation option:
                              skip    - Skip pyenv installation/update (default)
                              update  - Update existing pyenv installation
                              force   - Force a fresh pyenv installation
    --force                 Equivalent to --pyenv force
    --dry-run               Perform a dry run without making changes
    --no-backup             Skip creating a backup before making changes
    --restore <backup_dir>  Restore from a specific backup directory

Examples:
  ./setup.sh                            # Run setup with default options
  ./setup.sh --debug                    # Run setup in debug mode
  ./setup.sh --force-update             # Force update submodules
  ./setup.sh -p update                  # Update pyenv in tracker setup
  ./setup.sh --debug -p update --force  # Debug mode, update pyenv, force pyenv installation
  ./setup.sh --skip-update --dry-run    # Skip updates, dry run tracker setup

For more information on tracker-specific options, run:
  ./setup.sh -- --help

EOF
}

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
                if [ "$FORCE_UPDATE" = true ]; then
                    warn "Local changes detected in $submodule. Force update is enabled. Overwriting changes..."
                    git reset --hard
                    git clean -fd
                else
                    warn "Local changes detected in $submodule. Skipping update to preserve changes."
                    return 0
                fi
            fi

            if [ "$SKIP_UPDATE" = true ]; then
                warn "Update skipped for $submodule due to --skip-update flag."
                return 0
            fi

            debug "Fetching from origin..."
            if ! git fetch origin; then
                error "Failed to fetch from origin for $submodule"
                return 1
            fi

            debug "Checking out $branch branch..."
            if ! git checkout "$branch"; then
                error "Failed to checkout $branch branch for $submodule"
                return 1
            fi

            debug "Merging origin/$branch..."
            if ! git merge --ff-only "origin/$branch"; then
                error "Failed to merge origin/$branch for $submodule. You may need to resolve conflicts manually."
                return 1
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
    shift
    log "Setting up $submodule..."
    if [ -f "apps/$submodule/setup.sh" ]; then
        (
            cd "apps/$submodule" || {
                error "Failed to change directory to apps/$submodule"
                exit 1
            }
            debug "Running setup.sh for $submodule with arguments: ${TRACKER_ARGS[*]}"
            if ! bash setup.sh "${TRACKER_ARGS[@]}"; then
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

# Function to install Node.js dependencies
install_node_dependencies() {
    local module=$1
    log "Installing Node.js dependencies for $module..."
    if [ -f "apps/$module/package.json" ]; then
        (
            cd "apps/$module" || {
                error "Failed to change directory to apps/$module"
                exit 1
            }
            if ! npm install; then
                error "Failed to install Node.js dependencies for $module"
                return 1
            fi
        )
    else
        warn "package.json not found in $module directory. Skipping Node.js setup."
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

    setup_submodule "proxy"
    install_node_dependencies "proxy"

    if [ -d "apps/orch" ]; then
        setup_submodule "orch"
        install_node_dependencies "orch"
    else
        warn "Orchestrator submodule not found. Skipping."
    fi

    log "Dullahan project setup complete!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
    -h|--help)
        display_usage
        exit 0
        ;;
    --debug)
        DEBUG=true
        shift
        ;;
    --force-update)
        FORCE_UPDATE=true
        shift
        ;;
    --skip-update)
        SKIP_UPDATE=true
        shift
        ;;
    *)
        # Add all other arguments to TRACKER_ARGS array
        TRACKER_ARGS+=("$1")
        shift
        ;;
    esac
done

if [ "$DEBUG" = true ]; then
    debug "Debug mode enabled"
fi

if [ "$FORCE_UPDATE" = true ]; then
    warn "Force update mode enabled. This may overwrite local changes."
fi

if [ "$SKIP_UPDATE" = true ]; then
    warn "Skip update mode enabled. Submodules will not be updated."
fi

# Run the main setup process
main
