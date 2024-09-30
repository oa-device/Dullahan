# Dullahan Project TODO List

## 1. Hybrid Architecture Setup

- [x] Set up native Python environment for Tracker component
- [ ] Create Dockerfile for Proxy Cache component
- [ ] Create Dockerfile for Orchestrator component
- [ ] Develop docker-compose.yml for Proxy Cache and Orchestrator
- [x] Update setup.sh script to include both native Python and Docker setup
- [ ] Create .dockerignore files for Docker components
- [ ] Set up networking between native Tracker and Docker containers

## 2. Project Structure Refactoring

- [x] Reorganize project structure to align with hybrid architecture
- [x] Update import statements and file paths in all components
- [ ] Ensure communication works between native Tracker and containerized components
- [ ] Create environment variable files for both native and Docker components

## 3. Tracker Component (Native Python)

- [x] Integrate oaTracker functionality into the main project
- [x] Implement YOLO-based object detection using Ultralytics
- [x] Develop multi-source video support
- [x] Create HTTP API for data access
- [x] Ensure cross-platform compatibility (Mac and Ubuntu)
- [x] Optimize Tracker for GPU usage (if applicable)

## 4. Proxy Cache Component (Docker)

- [ ] Create basic Node.js application structure
- [ ] Implement request caching mechanism
- [ ] Develop network interruption handling
- [ ] Create auto-resend functionality
- [ ] Set up 5-minute network check interval
- [ ] Implement cloud integration with HTTP/HTTPS transmission
- [ ] Configure volume mounting for persistent cache storage

## 5. Orchestrator Component (Docker)

- [ ] Create basic Python application structure
- [ ] Develop central management for multiple Tracker instances
- [ ] Implement data flow coordination between Tracker and Proxy Cache
- [ ] Create system-wide optimization logic
- [ ] Implement container health checks and restart policies

## 6. Configuration Management

- [x] Update config.yaml to include both native and Docker-specific configurations
- [x] Implement secure configuration loading for both environments
- [x] Add validation for all configuration options
- [ ] Create a mechanism for updating configurations without rebuilding Docker containers

## 7. API Development

- [x] Implement POST /cameras/{id}/observations/{type} endpoint
- [x] Add support for different observation types (crowd, doors, views, waiting_time, objects)
- [x] Implement error handling and input validation
- [ ] Ensure API endpoints are accessible in the hybrid environment
- [ ] Implement API versioning for future compatibility

## 8. Testing in Hybrid Environment

- [ ] Develop unit tests for each component (native and containerized)
- [ ] Create integration tests for communication between native and Docker components
- [ ] Implement system-wide tests using both native Python and docker-compose
- [ ] Set up CI/CD pipeline with support for both native and Docker components
- [ ] Implement automated testing for different configurations

## 9. Documentation Updates

- [x] Update README.md with hybrid setup and run instructions
- [x] Update WORKFLOW.md to reflect the new hybrid architecture
- [ ] Create API documentation reflecting the hybrid architecture
- [ ] Write developer guidelines for working with both native Python and Docker in this project
- [ ] Document installation and setup process for hybrid deployment
- [ ] Create troubleshooting guide for common issues in the hybrid setup

## 10. Performance Optimization

- [x] Profile each component for performance bottlenecks in the hybrid environment
- [x] Optimize real-time video processing in the native Tracker
- [ ] Implement efficient data transmission between native and Docker components
- [ ] Optimize Docker image sizes for faster deployment of containerized components

## 11. Security Enhancements

- [ ] Implement secure communication between native Tracker and Docker containers
- [ ] Add data encryption for cloud transmission
- [ ] Conduct security audit of the hybrid application
- [ ] Implement least privilege principle in both native and Docker configurations
- [ ] Set up secure management for sensitive information

## 12. Deployment

- [x] Create build process for native Tracker on Mac and Ubuntu
- [ ] Develop deployment scripts for Docker components
- [ ] Set up container registry for storing and distributing Docker images
- [ ] Implement update strategy for both native and Docker components

## 13. Monitoring and Logging

- [x] Implement centralized logging for both native and Docker components
- [ ] Set up monitoring for overall system health and performance
- [ ] Create alerting mechanism for critical issues in the hybrid environment
- [ ] Integrate with external monitoring tools (e.g., Prometheus, Grafana)

## 14. User Interface (if required)

- [ ] Design user interface for system management compatible with hybrid backend
- [ ] Implement UI for configuration and monitoring of the entire system
- [ ] Ensure UI can handle multiple Tracker instances and Docker components

## 15. Final Testing and Quality Assurance

- [ ] Conduct thorough system testing in production-like hybrid environment
- [ ] Perform user acceptance testing with hybrid deployment
- [ ] Address and fix any identified issues related to the hybrid architecture
- [ ] Conduct load testing on the entire system

## 16. Documentation Finalization

- [ ] Review and update all documentation to reflect the hybrid architecture
- [ ] Create user manual for hybrid deployment and management
- [ ] Prepare release notes highlighting the new architecture
- [ ] Document backup and restore procedures for both native and Docker components

## 17. Project Handover and Training

- [ ] Prepare handover documentation including details on both native and Docker components
- [ ] Conduct training sessions on hybrid development and deployment
- [ ] Set up support channels for post-release assistance
- [ ] Create FAQ document for common questions about the hybrid setup

## 18. Continuous Improvement

- [ ] Establish process for regular updates and security patches for both native and Docker components
- [ ] Plan for future scalability using the hybrid architecture
- [ ] Set up automated performance testing and optimization for all components
- [ ] Implement a feedback loop for continuous improvements in the hybrid system

This updated TODO list reflects the current state of the project with the hybrid architecture, including completed tasks and new specific tasks for the orchestrator and proxy components.
