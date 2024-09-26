# Dullahan Project TODO List

## 1. Docker Integration

- [ ] Create Dockerfile for Tracker component
- [ ] Create Dockerfile for Proxy Cache component
- [ ] Create Dockerfile for Orchestrator component
- [ ] Develop docker-compose.yml for local development and testing
- [ ] Update setup.sh script to include Docker setup
- [ ] Create .dockerignore files for each component
- [ ] Set up Docker networking for inter-container communication

## 2. Project Structure Refactoring

- [ ] Reorganize project structure to align with Docker best practices
- [ ] Update import statements and file paths in all components
- [ ] Ensure cross-component communication works in containerized environment
- [ ] Create Docker-specific environment variable files (.env)

## 3. Tracker Component

- [ ] Port oaTracker functionality to Docker container
- [ ] Implement YOLO-based object detection using Ultralytics
- [ ] Develop multi-source video support
- [ ] Create HTTP API for data access
- [ ] Ensure cross-platform compatibility (Mac and Ubuntu) within container
- [ ] Optimize Tracker container for GPU usage (if applicable)

## 4. Proxy Cache Component

- [ ] Implement request caching mechanism
- [ ] Develop network interruption handling
- [ ] Create auto-resend functionality
- [ ] Set up 5-minute network check interval
- [ ] Implement cloud integration with HTTP/HTTPS transmission
- [ ] Configure volume mounting for persistent cache storage

## 5. Orchestrator Component

- [ ] Develop central management for multiple Tracker containers
- [ ] Implement data flow coordination between containers
- [ ] Create system-wide optimization logic
- [ ] Implement container health checks and restart policies

## 6. Configuration Management

- [ ] Update config.yaml to include Docker-specific configurations
- [ ] Implement secure configuration loading in containerized environment
- [ ] Add validation for Docker-related configuration options
- [ ] Create a mechanism for updating configurations without rebuilding containers

## 7. API Development

- [ ] Implement POST /cameras/{id}/observations/{type} endpoint
- [ ] Add support for different observation types (crowd, doors, views, waiting_time, objects)
- [ ] Implement error handling and input validation
- [ ] Ensure API endpoints are accessible in containerized environment
- [ ] Implement API versioning for future compatibility

## 8. Testing in Containerized Environment

- [ ] Develop unit tests for each component running in containers
- [ ] Create integration tests for inter-container communication
- [ ] Implement system-wide tests using docker-compose
- [ ] Set up CI/CD pipeline with Docker support (e.g., GitHub Actions, GitLab CI)
- [ ] Implement automated testing for different Docker configurations

## 9. Documentation Updates

- [ ] Update README.md with Docker-based setup and run instructions
- [ ] Create API documentation reflecting containerized architecture
- [ ] Write developer guidelines for working with Docker in this project
- [ ] Document installation and setup process for Docker-based deployment
- [ ] Create troubleshooting guide for common Docker-related issues

## 10. Performance Optimization

- [ ] Profile each component for performance bottlenecks in containerized environment
- [ ] Optimize real-time video processing within Docker constraints
- [ ] Implement efficient data caching and transmission between containers
- [ ] Optimize Docker image sizes for faster deployment

## 11. Security Enhancements

- [ ] Implement secure inter-container communication
- [ ] Add data encryption for cloud transmission
- [ ] Conduct security audit of containerized application
- [ ] Implement least privilege principle in Docker configurations
- [ ] Set up Docker secrets for sensitive information management

## 12. Deployment

- [ ] Create Docker-based build process for Mac and Ubuntu
- [ ] Develop deployment scripts for container orchestration (e.g., Kubernetes)
- [ ] Set up container registry for storing and distributing Docker images
- [ ] Implement rolling updates strategy for zero-downtime deployments

## 13. Monitoring and Logging

- [ ] Implement centralized logging for all containers
- [ ] Set up monitoring for container health and performance
- [ ] Create alerting mechanism for critical issues in containerized environment
- [ ] Integrate with external monitoring tools (e.g., Prometheus, Grafana)

## 14. User Interface (if required)

- [ ] Design user interface for system management compatible with containerized backend
- [ ] Implement UI for configuration and monitoring of Docker-based system
- [ ] Ensure UI can handle dynamic scaling of Tracker containers

## 15. Final Testing and Quality Assurance

- [ ] Conduct thorough system testing in production-like containerized environment
- [ ] Perform user acceptance testing with Docker-based deployment
- [ ] Address and fix any identified issues related to containerization
- [ ] Conduct load testing on the containerized system

## 16. Documentation Finalization

- [ ] Review and update all documentation to reflect Docker-based architecture
- [ ] Create user manual for Docker-based deployment and management
- [ ] Prepare release notes highlighting Docker integration
- [ ] Document backup and restore procedures for Docker volumes

## 17. Project Handover and Training

- [ ] Prepare handover documentation including Docker-specific details
- [ ] Conduct training sessions on Docker-based development and deployment
- [ ] Set up support channels for post-release assistance with containerized system
- [ ] Create FAQ document for Docker-related questions

## 18. Continuous Improvement

- [ ] Establish process for regular Docker image updates and security patches
- [ ] Plan for future scalability using container orchestration technologies
- [ ] Set up automated performance testing and optimization for containerized components
- [ ] Implement a feedback loop for continuous Docker-based improvements

This updated TODO list provides a comprehensive overview of tasks required for the Docker integration and overall project development. It covers all aspects of the containerized architecture while maintaining the original project goals.
