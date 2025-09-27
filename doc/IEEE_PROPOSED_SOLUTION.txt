# II. Proposed Solution

## A. System Architecture and Design Philosophy

The WorldSense-GDELT platform represents a comprehensive cloud-native solution for global event analysis, implementing a serverless architecture that integrates fourteen distinct AWS services to deliver real-time insights into worldwide sentiment and event patterns. The architectural design prioritizes scalability, cost-effectiveness, and security while maintaining the flexibility required for academic research and operational analytics.

The system architecture adopts a modular approach where each AWS service fulfills specific functional requirements while contributing to the overall platform capabilities. The serverless paradigm eliminates infrastructure management overhead while providing automatic scaling capabilities that adapt to varying workloads and user demands.

Data flow architecture implements a systematic progression from raw GDELT dataset ingestion through multi-stage processing pipelines that culminate in interactive visualization and analysis capabilities. The design emphasizes near real-time processing with 15-minute data refresh cycles that balance timeliness requirements with resource efficiency.

## B. Service Integration and Architectural Components

### 1) Identity and Access Management Foundation

AWS Identity and Access Management (IAM) serves as the cornerstone of the platform's security architecture, implementing sophisticated cross-account collaboration capabilities that enable five external team members to participate in platform development and operations. The IAM design establishes three hierarchical roles—Project-Admin, Project-Developer, and Project-Viewer—each with precisely defined permissions that enforce the principle of least privilege.

The cross-account trust relationship architecture eliminates the security risks associated with shared credentials while enabling seamless collaboration across multiple AWS accounts. Multi-factor authentication requirements ensure that account compromise alone cannot grant unauthorized access to platform resources.

### 2) Compute Architecture and Processing Framework

AWS Lambda functions constitute the primary computational framework, implementing three specialized functions that handle distinct aspects of platform operations. The gdelt-api function serves as the primary interface for frontend applications, supporting both API Gateway v1.0 and v2.0 request formats while implementing comprehensive CORS handling. The gdelt-indexer function processes S3 PUT events through automatic triggers, performing data transformation and bulk indexing operations to Amazon OpenSearch.

The gdelt-fetch-clean function executes scheduled data collection operations every 15 minutes through EventBridge triggers, simulating GDELT dataset access with infrastructure prepared for production API integration.

### 3) Data Storage and Management Architecture

Amazon S3 implements a multi-tier storage strategy through three specialized buckets that support different aspects of platform operations. The frontend hosting bucket serves static website content with public read access optimized for global distribution through CloudFront integration. The processed data bucket stores cleaned GDELT data with versioning enabled and lifecycle policies that automatically transition data to Amazon Glacier after 30 days.

Amazon DynamoDB provides serverless NoSQL database capabilities for user management, preference storage, and behavior tracking. Pay-per-request billing eliminates capacity planning requirements while ensuring cost efficiency during variable usage patterns.

### 4) Search and Analytics Engine

Amazon OpenSearch Service functions as the platform's core analytical engine, optimized for cost efficiency while maintaining query performance requirements. The cluster configuration underwent comprehensive optimization through strategic instance type selection, node count reduction, and feature optimization. The current implementation utilizes cost-effective instance types for both data and master nodes.

Index configuration employs pre-defined mappings that optimize query performance and storage efficiency across multiple data types. Date fields utilize specific formatting for efficient time-range queries, while geo_point fields enable spatial proximity searches essential for geographic analysis.

### 5) API Gateway and Content Delivery Network

Amazon API Gateway implements an HTTP API architecture that provides three specialized endpoints optimized for different use cases. The /search endpoint supports complex queries with multiple filter combinations including time ranges, geographic boundaries, sentiment thresholds, and event categories. The /map endpoint delivers geospatial data in GeoJSON format optimized for mapping libraries. The /stats endpoint provides pre-computed aggregations and statistical summaries.

Amazon CloudFront provides global content delivery acceleration through strategically distributed edge locations that significantly reduce latency for users worldwide. The distribution configuration includes compression algorithms, caching optimization for Single Page Application routing, and origin access control for secure S3 integration.

### 6) Authentication and User Management

Amazon Cognito implements comprehensive user authentication through user pools with configurable password policies, email verification, and session management capabilities. The identity pool configuration supports both authenticated and unauthenticated access patterns, enabling flexible user experience design while maintaining security requirements.

User session management includes automatic token refresh capabilities, secure credential storage, and graceful handling of authentication failures. Session integration with DynamoDB enables personalized dashboard configurations and user behavior tracking that supports platform analytics.

### 7) Messaging and Event Processing Infrastructure

Amazon Simple Notification Service (SNS) implements comprehensive notification capabilities through two distinct topic configurations optimized for different message types and delivery requirements. The standard topic handles CloudWatch alarm notifications and general system alerts, while the FIFO topic manages global sentiment alerts with content-based deduplication.

Amazon Simple Queue Service (SQS) provides robust asynchronous message processing through three specialized queue configurations that ensure reliable message delivery and system resilience. Amazon EventBridge orchestrates automated data collection through precisely scheduled rules that execute every 15 minutes, ensuring continuous platform operation without manual intervention.

## C. Data Processing Pipeline and Workflow Architecture

### 1) Data Ingestion and Initial Processing

The data ingestion framework implements a systematic approach to GDELT dataset acquisition and initial processing that ensures data quality and consistency throughout the platform. EventBridge-scheduled triggers initiate data collection operations every 15 minutes, maintaining synchronization with GDELT update frequencies while accommodating platform processing capabilities.

Initial data processing extracts essential fields including timestamps, geographic coordinates, event codes, actor information, and sentiment scores while normalizing data formats for consistent downstream processing. Processed data organization follows hierarchical date-based partitioning strategies that optimize retrieval efficiency.

### 2) Data Transformation and Indexing Operations

S3 PUT events automatically trigger comprehensive data transformation operations through the gdelt-indexer Lambda function, ensuring near real-time processing without manual intervention. The transformation process converts raw GDELT fields into OpenSearch-optimized formats that support efficient querying and analysis operations.

Bulk indexing operations utilize OpenSearch _bulk API capabilities to maximize throughput while minimizing resource consumption and processing latency. Index routing and shard allocation strategies optimize query performance while maintaining cost efficiency.

### 3) Query Processing and Response Optimization

Query processing architecture implements multi-layered optimization strategies that ensure sub-second response times for typical operations while supporting complex analytical queries. Caching strategies at multiple architectural levels reduce response times and system load for frequently requested data and query patterns.

Response formatting includes data serialization optimization and compression that reduce network bandwidth requirements while maintaining data integrity. GeoJSON formatting for mapping endpoints includes geometric optimization that balances visualization quality with payload size efficiency.

## D. Frontend Architecture and User Experience Design

### 1) Single Page Application Architecture

The frontend implementation adopts a modern Single Page Application (SPA) architecture that provides responsive user experiences across diverse device types and network conditions. The architecture utilizes HTML5, CSS3, and modern JavaScript (ES6+) with careful attention to browser compatibility and performance optimization.

Performance optimization includes code splitting, asset optimization, and efficient dependency management that minimize resource requirements while maximizing user experience quality. Bundle optimization reduces download sizes while maintaining feature completeness.

### 2) Interactive Visualization and Mapping

OpenLayers integration provides sophisticated mapping capabilities with support for multiple data layers, interactive controls, and real-time data updates. The mapping interface enables users to visualize global event distributions with geographic filtering capabilities and dynamic legend generation.

Chart.js integration enables comprehensive data visualization including time-series analysis, statistical summaries, and trend visualization. Interactive charts support multiple temporal granularities from hourly to yearly views with zoom and pan functionality.

### 3) Authentication Integration and Session Management

Cognito integration provides seamless user authentication with support for email-based registration, password reset functionality, and secure session token management. User preference management through DynamoDB integration enables personalized dashboard configurations and behavioral tracking that supports platform analytics and user experience optimization.

Session management includes graceful error handling for authentication failures, network disruptions, and service unavailability scenarios. Offline capability support maintains core functionality during temporary connectivity issues while synchronizing data and preferences when connectivity is restored.
