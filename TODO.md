# Dullahan Project TODO List

## 1. Docker Integration

- [ ] Create Dockerfile for Tracker component
- [ ] Create Dockerfile for Proxy Cache component
- [ ] Create Dockerfile for Orchestrator component
- [ ] Develop docker-compose.yml for local development and testing
- [ ] Update setup.sh script to include Docker setup

## 2. Project Structure Refactoring

- [ ] Reorganize project structure to align with Docker best practices
- [ ] Update import statements and file paths in all components
- [ ] Ensure cross-component communication works in containerized environment

## 3. Tracker Component

- [ ] Port oaTracker functionality to Docker container
- [ ] Implement YOLO-based object detection using Ultralytics
- [ ] Develop multi-source video support
- [ ] Create HTTP API for data access
- [ ] Ensure cross-platform compatibility (Mac and Ubuntu) within container

## 4. Proxy Cache Component

- [ ] Implement request caching mechanism
- [ ] Develop network interruption handling
- [ ] Create auto-resend functionality
- [ ] Set up 5-minute network check interval
- [ ] Implement cloud integration with HTTP/HTTPS transmission

## 5. Orchestrator Component

- [ ] Develop central management for multiple Tracker containers
- [ ] Implement data flow coordination between containers
- [ ] Create system-wide optimization logic

## 6. Configuration Management

- [ ] Update config.yaml to include Docker-specific configurations
- [ ] Implement secure configuration loading in containerized environment
- [ ] Add validation for Docker-related configuration options

## 7. API Development

- [ ] Implement POST /cameras/{id}/observations/{type} endpoint
- [ ] Add support for different observation types (crowd, doors, views, waiting_time, objects)
- [ ] Implement error handling and input validation
- [ ] Ensure API endpoints are accessible in containerized environment

## 8. Testing in Containerized Environment

- [ ] Develop unit tests for each component running in containers
- [ ] Create integration tests for inter-container communication
- [ ] Implement system-wide tests using docker-compose
- [ ] Set up CI/CD pipeline with Docker support (e.g., GitHub Actions, GitLab CI)

## 9. Documentation Updates

- [ ] Update README.md with Docker-based setup and run instructions
- [ ] Create API documentation reflecting containerized architecture
- [ ] Write developer guidelines for working with Docker in this project
- [ ] Document installation and setup process for Docker-based deployment

## 10. Performance Optimization

- [ ] Profile each component for performance bottlenecks in containerized environment
- [ ] Optimize real-time video processing within Docker constraints
- [ ] Implement efficient data caching and transmission between containers

## 11. Security Enhancements

- [ ] Implement secure inter-container communication
- [ ] Add data encryption for cloud transmission
- [ ] Conduct security audit of containerized application
- [ ] Implement least privilege principle in Docker configurations

## 12. Deployment

- [ ] Create Docker-based build process for Mac and Ubuntu
- [ ] Develop deployment scripts for container orchestration (e.g., Kubernetes)
- [ ] Set up container registry for storing and distributing Docker images

## 13. Monitoring and Logging

- [ ] Implement centralized logging for all containers
- [ ] Set up monitoring for container health and performance
- [ ] Create alerting mechanism for critical issues in containerized environment

## 14. User Interface (if required)

- [ ] Design user interface for system management compatible with containerized backend
- [ ] Implement UI for configuration and monitoring of Docker-based system

## 15. Final Testing and Quality Assurance

- [ ] Conduct thorough system testing in production-like containerized environment
- [ ] Perform user acceptance testing with Docker-based deployment
- [ ] Address and fix any identified issues related to containerization

## 16. Documentation Finalization

- [ ] Review and update all documentation to reflect Docker-based architecture
- [ ] Create user manual for Docker-based deployment and management
- [ ] Prepare release notes highlighting Docker integration

## 17. Project Handover and Training

- [ ] Prepare handover documentation including Docker-specific details
- [ ] Conduct training sessions on Docker-based development and deployment
- [ ] Set up support channels for post-release assistance with containerized system

## 18. Continuous Improvement

- [ ] Establish process for regular Docker image updates and security patches
- [ ] Plan for future scalability using container orchestration technologies
- [ ] Set up automated performance testing and optimization for containerized components
