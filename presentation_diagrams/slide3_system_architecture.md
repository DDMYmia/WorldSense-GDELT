# Slide 3: System Architecture - Detailed Design

## 14 AWS Services Integration Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[S3 Static Hosting<br/>my-worldsense-bucket] --> B[CloudFront CDN<br/>E3MJ8UIOB3UH8Q]
        B --> C[d7hwjrg2pdpoj.cloudfront.net]
    end
    
    subgraph "API Layer"
        D[API Gateway HTTP API<br/>82z3xjob1g] --> E[gdelt-api Lambda<br/>512MB, 15s]
        D --> F[gdelt-indexer Lambda<br/>1024MB, 300s]
        D --> G[gdelt-fetch-clean Lambda<br/>512MB, 300s]
        H[REST API Backup<br/>sqeg4ixx58]
    end
    
    subgraph "Data Layer"
        I[OpenSearch Service<br/>worldsense-gdelt-os-dev] --> J[2×t3.small Data Nodes]
        I --> K[2×t3.small Master Nodes]
        I --> L[10GB GP3 EBS per Node]
        M[S3 Data Lake] --> N[Frontend Bucket]
        M --> O[Processed Data Bucket]
        M --> P[Audit Logs Bucket]
    end
    
    subgraph "Security & Monitoring"
        Q[Cognito<br/>worldsense-users] --> R[User Authentication]
        S[IAM Cross-Account Roles] --> T[5 External Accounts]
        U[CloudWatch] --> V[Monitoring & Alerts]
        W[VPC<br/>vpc-017bc7b7189ac581e] --> X[Network Isolation]
    end
    
    subgraph "Data Flow"
        Y[GDELT Data] --> Z[EventBridge<br/>15-min triggers]
        Z --> G
        G --> O
        O --> F
        F --> I
        I --> E
        E --> D
        D --> C
    end
    
    C --> A
    E --> I
    F --> I
    G --> M
    Q --> C
    S --> E
    S --> F
    S --> G
    U --> E
    U --> F
    U --> G
    W --> E
    W --> F
    W --> G
    
    style A fill:#e1f5fe
    style I fill:#f3e5f5
    style M fill:#e8f5e8
    style Q fill:#fff3e0
    style S fill:#fce4ec
```

## Architecture Components Details

### Frontend Layer
- **S3**: Static website hosting
- **CloudFront**: Global CDN distribution

### API Layer
- **API Gateway**: HTTP API v2.0 + REST API backup
- **Lambda Functions**: 3 specialized functions with different configurations

### Data Layer
- **OpenSearch**: Cost-optimized cluster with 4 nodes total
- **S3**: 3-bucket data lake architecture

### Security & Monitoring
- **Cognito**: User authentication
- **IAM**: Cross-account collaboration
- **CloudWatch**: Comprehensive monitoring
- **VPC**: Network isolation

