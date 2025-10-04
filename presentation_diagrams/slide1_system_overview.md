# Slide 1: Project Overview - System Architecture

## WorldSense-GDELT Platform Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React SPA] --> B[Leaflet.js Mapping]
        A --> C[Chart.js Visualization]
        B --> D[CloudFront CDN]
        C --> D
    end
    
    subgraph "API Layer"
        E[API Gateway HTTP API] --> F[gdelt-api Lambda]
        E --> G[gdelt-indexer Lambda]
        E --> H[gdelt-fetch-clean Lambda]
    end
    
    subgraph "Data Layer"
        I[OpenSearch Service] --> J[GDELT Events Index]
        K[S3 Data Lake] --> L[Processed Data]
        K --> M[Frontend Assets]
        K --> N[Audit Logs]
    end
    
    subgraph "Security & Auth"
        O[Cognito User Pool] --> P[User Authentication]
        Q[IAM Roles] --> R[Cross-Account Access]
    end
    
    D --> E
    F --> I
    F --> K
    G --> I
    H --> K
    O --> A
    Q --> F
    Q --> G
    Q --> H
    
    style A fill:#e1f5fe
    style I fill:#f3e5f5
    style K fill:#e8f5e8
    style O fill:#fff3e0
```

## Key Components Overview

- **Frontend**: React SPA with Leaflet.js mapping
- **Backend**: 3 Lambda functions (Python 3.13)
- **Data**: OpenSearch + S3 data lake
- **API**: API Gateway HTTP API v2.0
- **Live Demo**: https://d7hwjrg2pdpoj.cloudfront.net

