#!/bin/bash

# Configuration
LOG_DIR="logs"
MAX_LOG_SIZE=10485760 # 10MB
MAX_LOG_FILES=5

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Function to rotate logs
rotate_logs() {
    local base_name="$1"
    if [ -f "${LOG_DIR}/${base_name}.log" ] && [ $(stat -f%z "${LOG_DIR}/${base_name}.log") -ge $MAX_LOG_SIZE ]; then
        for i in $(seq $((MAX_LOG_FILES - 1)) -1 1); do
            if [ -f "${LOG_DIR}/${base_name}.${i}.log" ]; then
                mv "${LOG_DIR}/${base_name}.${i}.log" "${LOG_DIR}/${base_name}.$((i + 1)).log"
            fi
        done
        mv "${LOG_DIR}/${base_name}.log" "${LOG_DIR}/${base_name}.1.log"
    fi
}

# Main logging function
log() {
    local level="$1"
    local module="$2"
    local message="$3"
    local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
    local log_file="${LOG_DIR}/${module}.log"

    # Rotate logs if necessary
    rotate_logs "$module"

    # Write log entry
    echo "${timestamp} - ${level} - ${module}: ${message}" >>"$log_file"
}

# Check if the script is being sourced or run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script is being run directly
    if [ $# -lt 3 ]; then
        echo "Usage: $0 <level> <module> <message>"
        exit 1
    fi
    log "$1" "$2" "$3"
fi
