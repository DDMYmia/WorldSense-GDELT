# Overall System Diagram - WorldSense-GDELT Platform

## Complete System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface"
        A[Web Browser] --> B[React SPA Frontend]
        B --> C[Leaflet.js Mapping]
        B --> D[Chart.js Visualization]
    end
    
    subgraph "Content Delivery"
        E[CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net] --> F[S3 Static Hosting<br/>my-worldsense-bucket]
    end
    
    subgraph "API Gateway Layer"
        G[HTTP API<br/>82z3xjob1g] --> H[gdelt-api Lambda<br/>512MB, 15s]
        G --> I[gdelt-indexer Lambda<br/>1024MB, 300s]
        G --> J[gdelt-fetch-clean Lambda<br/>512MB, 300s]
        K[REST API Backup<br/>sqeg4ixx58] --> H
    end
    
    subgraph "Data Processing Pipeline"
        L[GDELT Data Source] --> M[EventBridge<br/>15-min triggers]
        M --> J
        J --> N[S3 Data Storage<br/>gdelt-processed-worldsense]
        N --> I
        I --> O[OpenSearch Service<br/>worldsense-gdelt-os-dev]
        O --> H
    end
    
    subgraph "Security & Authentication"
        P[Cognito User Pool] --> Q[User Authentication]
        R[IAM Cross-Account Roles] --> S[5 External AWS Accounts]
        T[Secrets Manager] --> U[Credential Storage]
    end
    
    subgraph "Monitoring & Logging"
        V[CloudWatch] --> W[Real-time Monitoring]
        X[CloudTrail] --> Y[Audit Logging]
        Z[VPC Network<br/>vpc-017bc7b7189ac581e] --> AA[Network Isolation]
    end
    
    A --> E
    E --> G
    H --> O
    H --> N
    P --> B
    R --> H
    R --> I
    R --> J
    V --> H
    V --> I
    V --> J
    X --> H
    X --> I
    X --> J
    
    style A fill:#e3f2fd
    style O fill:#f3e5f5
    style N fill:#e8f5e8
    style P fill:#fff3e0
    style R fill:#fce4ec
    style V fill:#f1f8e9
```

## System Performance Metrics

### Response Times
- **Frontend Load**: <2 seconds
- **API Response**: <500 milliseconds
- **Data Processing**: 15-minute refresh cycles
- **Query Performance**: Sub-second search results

### Cost Optimization
- **Current Monthly Cost**: $640.67
- **Cost Reduction**: 98% from production configuration
- **OpenSearch Dominance**: 86.7% of total costs
- **Free Tier Services**: Lambda, DynamoDB, SNS, SQS, EventBridge

### Security Features
- **5 External AWS Accounts**: Cross-account collaboration
- **3-Tier IAM Roles**: Admin, Developer, Viewer
- **MFA Required**: All external accounts
- **Encryption**: KMS + TLS 1.2+ for all communications

### Architecture Highlights
- **14 AWS Services**: Integrated serverless architecture
- **3 Lambda Functions**: Specialized data processing
- **Real-time Processing**: 15-minute GDELT data refresh
- **Global Distribution**: CloudFront CDN worldwide

