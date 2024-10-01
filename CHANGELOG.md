# Changelog

All notable changes to the Dullahan project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2024-10-01

### Added

- Command-line options for setup.sh script could be found by running with --help
- Improved documentation for setup.sh script usage in README.md

### Changed

- Enhanced setup.sh script to pass additional arguments to the tracker's setup script
- Updated README.md with new setup script options and usage examples

## [0.4.0] - 2024-09-29

### Added

- Improved error handling in setup script
- Debug mode for setup script with detailed logging

### Changed

- Enhanced setup.sh script to preserve local changes in submodules
- Updated submodule update process to use `git merge` instead of `git reset --hard`
- Implemented stashing of local changes before updating submodules
- Added branch-specific updates for submodules (e.g., 'dev' branch for proxy)

### Fixed

- Issue with losing newest updates when running the setup script

## [0.3.0] - 2024-09-26

### Added

- Docker directory structure for containerization
- Placeholder Dockerfiles for Tracker, Proxy Cache, and Orchestrator components

### Changed

- Updated project structure to prepare for Docker integration

### Planned

## [0.2.0] - 2024-09-26

### Added

- Initial project structure and documentation
- README.md with project overview, architecture, and usage instructions
- WORKFLOW.md detailing system components and data flow
- TODO.md listing planned tasks and features
- Basic setup script (setup.sh)
- Dummy Tracker implementation for testing purposes
- Logging system for both Python and Node.js components

### Changed

- Revised TODO list to include comprehensive Docker-related tasks
- Updated README.md to reflect Docker-based setup and usage
- Modified WORKFLOW.md to describe Docker-based architecture and workflow

### Planned

- Complete Docker integration for all components (Tracker, Proxy Cache, Orchestrator)
- Implementation of YOLO-based object detection within Docker container
- Development of Proxy Cache with robust error handling and cloud integration
- Creation of Orchestrator for multi-tracker management in containerized environment
- API endpoint implementation for various observation types
- Cross-platform compatibility enhancements for Mac and Ubuntu within containers
- Comprehensive testing suite including unit, integration, and system tests for containerized components
- Performance optimizations for real-time video processing in Docker environment
- Security enhancements including secure inter-container communication and data encryption
- Deployment scripts and CI/CD pipeline for Docker-based workflow
- Monitoring and logging solutions for containerized application
- Documentation updates for Docker-based development and deployment processes

## [0.1.0] - 2024-09-24

### Added

- Initial commit with basic project structure
