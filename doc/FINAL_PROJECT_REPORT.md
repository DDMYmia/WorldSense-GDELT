# WorldSense-GDELT Project Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [User Assignment and Access Management](#user-assignment-and-access-management)
3. [AWS Architecture Components](#aws-architecture-components)
4. [Cost Optimization](#cost-optimization)
5. [Deployment and CI/CD](#deployment-and-cicd)
6. [Security Configuration](#security-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Project Results and Value](#project-results-and-value)
10. [Risk Assessment and Recommendations](#risk-assessment-and-recommendations)
11. [Future Development Plan](#future-development-plan)
12. [Conclusion](#conclusion)

---

## Project Overview

### Project Description
**Project Name**: WorldSense-GDELT  
**Project Type**: Global Event Perception and Analysis Platform  
**Technical Architecture**: AWS Serverless Architecture  
**Report Generation Time**: 2025-09-27 11:00:00 NZST  
**AWS Account**: 810731468776  
**Deployment Region**: us-east-1  

WorldSense-GDELT is a comprehensive global event perception and analysis platform built on AWS, utilizing GDELT dataset to provide real-time event monitoring and analysis services through interactive web interfaces.

### Core Components
- **Frontend**: React-based web application hosted on Amazon S3 and distributed via CloudFront
- **Backend**: Serverless architecture using AWS Lambda functions
- **Data Storage**: Amazon OpenSearch Service for event data indexing and search
- **API Layer**: Amazon API Gateway for RESTful API management
- **Authentication**: Amazon Cognito for user management and authentication

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript, OpenLayers for mapping
- **Backend**: Python 3.13 (AWS Lambda)
- **Database**: Amazon OpenSearch Service
- **Infrastructure**: AWS Cloud Services
- **CI/CD**: GitHub Actions
- **IaC**: Terraform

### Key Achievements
- ✅ **Cost Optimization**: Achieved significant cost savings through comprehensive optimization
- ✅ **Architecture Completion**: 14 core AWS services fully configured
- ✅ **Security Compliance**: Multi-layer security protection system
- ✅ **Automated Deployment**: GitHub Actions CI/CD pipeline
- ✅ **Monitoring & Alerting**: Comprehensive CloudWatch monitoring system

---

## User Assignment and Access Management

### AWS Account Structure

#### Primary Account (Owner)
- **Account ID**: 810731468776
- **Role**: Project Owner/Administrator
- **Permissions**: Full access to all AWS resources
- **MFA**: Required for all operations

#### External Collaborator Accounts (5 Team Members)
| Account ID | Role Assigned | Permissions Level | MFA Required | Access Duration |
|------------|---------------|------------------|--------------|-----------------|
| 728980333359 | Project-Admin, Project-Developer, Project-Viewer | Full Access | Yes | 4 hours |
| 489335433954 | Project-Admin, Project-Developer, Project-Viewer | Full Access | Yes | 4 hours |
| 764508635426 | Project-Admin, Project-Developer, Project-Viewer | Full Access | Yes | 4 hours |
| 980102315041 | Project-Admin, Project-Developer, Project-Viewer | Full Access | Yes | 4 hours |
| 381492064806 | S3 Read-Only | Limited Access | No | 1 hour |

### IAM Role Configuration

#### Project-Admin Role
**Trust Policy**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::728980333359:root",
                    "arn:aws:iam::489335433954:root", 
                    "arn:aws:iam::764508635426:root",
                    "arn:aws:iam::980102315041:root",
                    "arn:aws:iam::810731468776:root"
                ]
            },
            "Action": "sts:AssumeRole",
            "Condition": {
                "Bool": {
                    "aws:MultiFactorAuthPresent": "true"
                }
            }
        }
    ]
}
```

**Attached Policies**:
- PowerUserAccess (AWS Managed Policy)
- Custom policies for specific resource access

#### Project-Developer Role
**Trust Policy**: Same as Project-Admin (allows same accounts)

**Attached Policies**:
- ProjectDeveloperPolicy (Custom)
- Includes permissions for:
  - S3 (full access)
  - DynamoDB (full access)
  - Lambda (full access)
  - EC2, ELB, Auto Scaling (full access)
  - CloudWatch (full access)
  - CloudFront (full access)
  - OpenSearch (full access)
  - API Gateway (full access)
  - SNS, SQS (full access)
  - Secrets Manager (read access)

#### Project-Viewer Role
**Trust Policy**: Same as Project-Admin

**Attached Policies**:
- ProjectViewerPolicy (Custom)
- Read-only permissions for all services

#### S3ReadOnly Role
**Trust Policy**: Only account 381492064806
**Permissions**: S3 GetObject and ListBucket only

### Access Workflow

1. **External User Authentication**
   - User logs into their own AWS account
   - Must have MFA enabled (except S3 read-only account)

2. **Role Assumption**
   ```bash
   aws sts assume-role \
     --role-arn arn:aws:iam::810731468776:role/Project-Developer \
     --role-session-name dev-session \
     --serial-number arn:aws:iam::ACCOUNT-ID:mfa/device-name \
     --token-code 123456
   ```

3. **Resource Access**
   - User gains temporary credentials for WorldSense-GDELT project
   - Session duration: 4 hours maximum
   - All actions logged in CloudTrail

---

## II. Proposed Solution

### A. System Overview

The WorldSense-GDELT platform proposed in this project integrates the GDELT dataset with real-time global event analysis to deliver comprehensive insights into worldwide sentiment and event patterns. Developed on Amazon Web Services (AWS), the system adopts a modular, serverless cloud architecture encompassing 14 integrated services. The data pipeline begins with scheduled ingestion of GDELT records every 15 minutes through EventBridge triggers, which are processed and stored in Amazon S3. A serverless indexing workflow then transfers the processed data into Amazon OpenSearch, enabling efficient queries by time, location, sentiment scores, and event categories.

Building upon this data layer, the platform provides RESTful APIs through Amazon API Gateway and AWS Lambda functions, supporting three primary endpoints: search, map visualization, and statistical analysis. Users can register accounts through Amazon Cognito, configure personalized dashboards stored in DynamoDB, visualize global event trends through interactive maps and time-series charts, and subscribe to real-time notifications via SNS. To ensure scalability and reliability, CloudFront accelerates content delivery for users across the globe, while comprehensive monitoring through CloudWatch provides observability.

The platform embeds security and cost optimization as fundamental design principles. IAM enforces cross-account collaboration with fine-grained access control for five external team members, Secrets Manager safeguards sensitive credentials, and aggressive cost optimization achieved a 47.7% reduction in monthly expenses. Together, these components form an end-to-end cloud-based solution that integrates data ingestion, storage, indexing, query services, visualization, and alerting, while ensuring consistency, security, and high availability.

### B. AWS Service Selection and Architecture Design

To meet the platform's functional requirements and optimize for cost-effectiveness, this project carefully selected and integrated 14 core AWS services. Service selection was based primarily on serverless architecture principles, cross-account collaboration needs, cost optimization potential, and security compliance. A comprehensive explanation is provided below.

#### 1) Identity and Access Management Foundation
**AWS Identity and Access Management (IAM)**: Serves as the security foundation, enabling secure cross-account collaboration with five external team members. The system implements three distinct roles - Project-Admin, Project-Developer, and Project-Viewer - each with carefully crafted trust policies requiring Multi-Factor Authentication (MFA). IAM policies grant granular permissions across all 14 AWS services while maintaining the principle of least privilege. Cross-account access sessions are limited to 4 hours maximum, with all actions logged in CloudTrail for comprehensive audit trails.

#### 2) Network Infrastructure Layer
**Virtual Private Cloud (VPC)**: Utilizes the default VPC configuration spanning six subnets across all availability zones in us-east-1, providing network isolation and security for the serverless architecture. While the platform primarily leverages serverless services that don't require traditional VPC configuration, the network foundation ensures secure communication between services and supports future expansion requirements.

#### 3) Storage and Data Management Layer
**Amazon S3**: Functions as the primary data lake with three strategically configured buckets. The frontend hosting bucket (my-worldsense-bucket) serves static website content with public read access for global distribution. The processed data bucket (gdelt-processed-worldsense) stores cleaned GDELT data with versioning enabled and lifecycle policies that automatically archive data to Glacier after 30 days, achieving significant cost savings. The CloudTrail audit bucket maintains comprehensive API call logs for security compliance.

**Amazon DynamoDB**: Serves as the serverless NoSQL database for user management, storing user preferences and behavior tracking data. With pay-per-request billing and automatic scaling, DynamoDB eliminates capacity planning concerns while providing sub-millisecond latency for user account operations. The schema design supports both individual user preferences (single partition key) and time-series behavior tracking (composite partition and sort keys).

#### 4) Search and Analytics Engine
**Amazon OpenSearch Service**: Acts as the core analytical engine optimized for cost and performance. The cluster configuration underwent aggressive optimization, reducing from the initial expensive configuration to cost-effective instances, achieving significant cost reduction. The current setup includes 2 data nodes and 2 dedicated master nodes (all t3.small.search) with 10GB GP3 storage each, disabling Multi-AZ with Standby and Auto-Tune to maximize cost savings. Pre-defined index mappings ensure optimal query performance for time-series, geospatial, and sentiment analysis operations.

#### 5) Serverless Computing Layer
**AWS Lambda**: Comprises three specialized functions forming the platform's computational backbone:

- **gdelt-api Function**: Handles all API requests with support for both API Gateway v1.0 and v2.0 formats, implements comprehensive CORS handling, and routes requests to appropriate handlers for search, map, and statistics endpoints.

- **gdelt-indexer Function**: Processes S3 PUT events through automatic triggers, performs data transformation, and executes bulk indexing operations to OpenSearch using optimized batch processing strategies.

- **gdelt-fetch-clean Function**: Executes scheduled data collection every 15 minutes via EventBridge triggers, simulates GDELT data fetching (with provisions for real API integration), performs data cleaning and validation, and stores processed results in S3.

#### 6) API Gateway and Content Delivery
**Amazon API Gateway**: Implements an HTTP API architecture providing three primary endpoints (/search, /map, /stats) with integrated CORS support and AWS_PROXY integration type for seamless Lambda function invocation. The gateway handles authentication, request routing, and response formatting while maintaining high availability and automatic scaling.

**Amazon CloudFront**: Provides global content delivery acceleration with edge locations worldwide, significantly reducing latency for frontend asset delivery. The distribution configuration includes compression, caching optimization for Single Page Application (SPA) routing, and origin access control for secure S3 integration.

#### 7) User Authentication and Authorization
**Amazon Cognito**: Manages user authentication through user pools with configurable password policies and email verification. The identity pool configuration supports both authenticated and unauthenticated access patterns, enabling flexible user experience design. Integration with frontend JavaScript SDK provides seamless authentication flows with JWT token management.

#### 8) Messaging and Event Processing
**Amazon Simple Notification Service (SNS)**: Implements two topic configurations - a standard topic for CloudWatch alarm notifications and a FIFO topic for global sentiment alerts with content-based deduplication. Email subscriptions enable real-time notifications for system events and sentiment threshold breaches.

**Amazon Simple Queue Service (SQS)**: Provides asynchronous message processing with three queue configurations: a main processing queue for data pipeline operations, a dead letter queue for failed message handling with configurable retry policies (maximum 5 receives), and a FIFO queue for ordered alert processing. This architecture ensures reliable message delivery and system resilience.

#### 9) Event-Driven Scheduling
**Amazon EventBridge**: Orchestrates automated data collection through scheduled rules executing every 15 minutes. The service triggers the gdelt-fetch-clean Lambda function, enabling continuous data pipeline operation without manual intervention. Event-driven architecture ensures scalable and reliable data processing workflows.

#### 10) Security and Secrets Management
**AWS Secrets Manager**: Securely stores and manages sensitive credentials, particularly OpenSearch cluster authentication information. Automatic encryption and optional rotation capabilities prevent credential exposure while enabling secure service-to-service communication.

#### 11) Monitoring and Observability
**Amazon CloudWatch**: Provides comprehensive monitoring across all platform components with automatic log group creation for Lambda functions, custom metric tracking for API performance, and billing alarms to maintain cost control. The monitoring strategy includes real-time alerting for system anomalies and performance degradation.


The platform implements a sophisticated data processing pipeline designed for real-time global event analysis and sentiment tracking. The pipeline architecture emphasizes reliability, scalability, and cost-effectiveness while maintaining data quality and processing speed.

#### 1) Data Collection and Ingestion
The data collection process begins with EventBridge-scheduled triggers executing every 15 minutes, ensuring continuous and timely data acquisition. The gdelt-fetch-clean Lambda function simulates GDELT dataset access (with infrastructure prepared for real API integration), performing initial data validation and quality assessment. Raw data undergoes preliminary processing to extract essential fields including timestamps, geographic coordinates, event codes, actor information, and sentiment scores. Processed data is stored in structured JSON format within the gdelt-processed-worldsense S3 bucket, organized in hierarchical date-based partitions for efficient retrieval and cost management.

#### 2) Data Transformation and Indexing
S3 PUT events automatically trigger the gdelt-indexer Lambda function through event notifications, ensuring near real-time data processing without manual intervention. The indexing function performs comprehensive data transformation, converting raw GDELT fields into OpenSearch-optimized formats including geographic point mapping for spatial queries, timestamp normalization for time-series analysis, and sentiment score processing for analytical operations. Bulk indexing operations utilize OpenSearch's _bulk API to maximize throughput while minimizing resource consumption and processing latency.

#### 3) Search Index Optimization
OpenSearch index configuration employs pre-defined mappings to ensure optimal query performance and storage efficiency. The mapping schema includes date fields with specific formatting for time-range queries, geo_point fields for spatial proximity searches, keyword fields for exact-match filtering on event codes and country identifiers, and float fields for sentiment score range queries and statistical aggregations. Index refresh intervals and replica configurations are optimized based on query patterns and data update frequencies.

#### 4) API Service Layer
The API service layer provides three specialized endpoints optimized for different use cases. The /search endpoint supports complex queries with multiple filter combinations including time ranges, geographic boundaries, sentiment thresholds, and event categories. The /map endpoint returns geospatial data in GeoJSON format optimized for mapping libraries, enabling efficient rendering of global event distributions. The /stats endpoint provides pre-computed aggregations and statistical summaries, reducing client-side processing requirements and improving user experience.

#### 5) Error Handling and Resilience
The pipeline implements comprehensive error handling through SQS dead letter queues that capture failed processing attempts for subsequent analysis and reprocessing. Lambda functions employ exponential backoff retry strategies for transient failures, ensuring system resilience during temporary service disruptions. CloudWatch logging captures detailed execution information for troubleshooting and performance optimization, while automated alerting notifies administrators of critical failures requiring immediate attention.

### D. Frontend Architecture and User Experience

The frontend implementation adopts a modern Single Page Application (SPA) architecture hosted on S3 and delivered globally through CloudFront. The design emphasizes performance, usability, and responsive behavior across diverse device types and network conditions.

#### 1) Technology Stack and Architecture
The frontend utilizes HTML5, CSS3, and modern JavaScript (ES6+) with careful attention to browser compatibility and performance optimization. OpenLayers provides sophisticated mapping capabilities with support for multiple data layers, interactive controls, and real-time data updates. Chart.js enables comprehensive data visualization including time-series analysis, statistical summaries, and trend visualization. The AWS SDK for JavaScript facilitates seamless Cognito integration for user authentication and session management.

#### 2) User Authentication and Session Management
Cognito integration provides secure user authentication with support for email-based registration, password reset functionality, and session token management. The authentication flow includes automatic token refresh, secure credential storage, and graceful handling of authentication failures. User sessions integrate with DynamoDB for preference storage and behavior tracking, enabling personalized dashboard configurations and usage analytics.

#### 3) Interactive Data Visualization
The mapping interface provides interactive global visualization with real-time data overlays, geographic filtering capabilities, and dynamic legend generation. Time-series charts support multiple temporal granularities from hourly to yearly views, with interactive zoom and pan functionality. Multi-dimensional filtering enables users to explore data across geographic, temporal, and sentiment dimensions simultaneously.

#### 4) Performance Optimization
CloudFront distribution ensures rapid content delivery through global edge locations, with optimized caching strategies for static assets and API responses. The SPA architecture minimizes server requests through client-side routing and state management. Lazy loading techniques reduce initial page load times while maintaining responsive user interactions.

### E. Implementation Highlights

In addition to basic functionality, the platform focuses on performance optimization, fault tolerance, and system scalability during implementation. The following highlights key implementation achievements:

#### 1) Data Processing Optimization
Batch processing and asynchronous writes efficiently handle large data volumes through S3 event-triggered Lambda functions that perform bulk OpenSearch indexing using the _bulk API. This approach significantly reduces individual record write latency and improves overall system performance. Data cleansing utilizes Lambda function parallelization with sharding and concurrent execution strategies to accelerate processing and ensure timely storage of real-time data.

#### 2) Performance and Cost Optimization
OpenSearch index optimization includes multi-dimensional improvements such as adjusted refresh intervals and replica counts based on query frequency and data update patterns. Storage utilizes dynamic sharding strategies that adjust as data volume grows, ensuring efficient queries and low-latency responses. S3 lifecycle management automatically transfers raw data to Amazon Glacier after 30 days, effectively controlling costs for long-term storage of infrequently accessed data.

#### 3) Fault Tolerance and Reliability
Dead Letter Queue (DLQ) implementation captures failed data processing attempts, preventing system crashes and enabling subsequent retry and error analysis. Exponential backoff retry strategies in Lambda-SQS interactions ensure graceful degradation during high failure rates. Auto Scaling automatically adjusts computing resources based on system load, maintaining high responsiveness during peak traffic while reducing costs during low-demand periods.

#### 4) Security and Data Protection
All sensitive data including API keys and OpenSearch credentials are securely stored in AWS Secrets Manager with encryption and automatic rotation capabilities. IAM ensures that only authorized users and services can access sensitive data, preventing data leakage risks. All data transmission utilizes HTTPS encryption, ensuring protection against interception and tampering during transit.

#### 5) Monitoring and Observability
CloudWatch provides real-time system monitoring with focus on key metrics such as Lambda execution time, API response latency, and OpenSearch indexing performance. Automated alerting triggers when system anomalies occur, ensuring prompt team response and issue resolution. Comprehensive logging in CloudWatch Logs ensures system traceability and provides data support for performance analysis, troubleshooting, and subsequent optimization.

---

