# Simplified System Architecture Diagram - 14 AWS Services

## System Architecture Diagram - Simplified Version

```mermaid
graph TB
    subgraph "Frontend Services"
        A[CloudFront CDN] --> B[S3 Static Hosting]
    end
    
    subgraph "API Layer"
        C[API Gateway HTTP API] --> D[API Gateway REST API]
    end
    
    subgraph "Compute Services"
        E[Lambda Function 1<br/>gdelt-api] --> F[Lambda Function 2<br/>gdelt-indexer]
        F --> G[Lambda Function 3<br/>gdelt-fetch-clean]
    end
    
    subgraph "Data Services"
        H[OpenSearch Service] --> I[S3 Data Lake]
        I --> J[DynamoDB]
    end
    
    subgraph "Security Services"
        K[Cognito User Pool] --> L[IAM Roles & Policies]
        L --> M[Secrets Manager]
    end
    
    subgraph "Event & Messaging"
        N[EventBridge] --> O[SNS]
        O --> P[SQS]
    end
    
    subgraph "Monitoring & Networking"
        Q[CloudWatch] --> R[CloudTrail]
        R --> S[VPC Network]
    end
    
    A --> C
    C --> E
    E --> H
    E --> I
    F --> H
    F --> I
    G --> I
    N --> G
    K --> A
    L --> E
    L --> F
    L --> G
    L --> H
    L --> I
    M --> E
    M --> F
    M --> G
    Q --> E
    Q --> F
    Q --> G
    S --> E
    S --> F
    S --> G
    S --> H
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#fff3e0
    style I fill:#fce4ec
    style J fill:#fce4ec
    style K fill:#f1f8e9
    style L fill:#fff3e0
    style M fill:#f1f8e9
    style N fill:#fff8e1
    style O fill:#fff8e1
    style P fill:#fff8e1
    style Q fill:#f1f8e9
    style R fill:#f1f8e9
    style S fill:#e8f5e8
```

## System Architecture Diagram - Ultra-Simplified Version

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[CloudFront] --> B[S3]
    end
    
    subgraph "API Layer"
        C[API Gateway]
    end
    
    subgraph "Compute Layer"
        D[Lambda Functions<br/>3 Functions]
    end
    
    subgraph "Data Layer"
        E[OpenSearch] --> F[S3 Data Lake]
        F --> G[DynamoDB]
    end
    
    subgraph "Security Layer"
        H[Cognito] --> I[IAM]
        I --> J[Secrets Manager]
    end
    
    subgraph "Event Layer"
        K[EventBridge] --> L[SNS] --> M[SQS]
    end
    
    subgraph "Monitoring Layer"
        N[CloudWatch] --> O[CloudTrail] --> P[VPC]
    end
    
    A --> C
    C --> D
    D --> E
    D --> F
    K --> D
    H --> A
    I --> D
    I --> E
    I --> F
    J --> D
    N --> D
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#fce4ec
    style G fill:#fce4ec
    style H fill:#f1f8e9
    style I fill:#fff3e0
    style J fill:#f1f8e9
    style K fill:#fff8e1
    style L fill:#fff8e1
    style M fill:#fff8e1
    style N fill:#f1f8e9
    style O fill:#f1f8e9
    style P fill:#e8f5e8
```

## System Architecture Diagram - Service Overview Only

```mermaid
graph LR
    subgraph "14 AWS Services"
        A[CloudFront] --> B[S3]
        B --> C[API Gateway]
        C --> D[Lambda]
        D --> E[OpenSearch]
        E --> F[DynamoDB]
        F --> G[Cognito]
        G --> H[IAM]
        H --> I[Secrets Manager]
        I --> J[EventBridge]
        J --> K[SNS]
        K --> L[SQS]
        L --> M[CloudWatch]
        M --> N[CloudTrail]
        N --> O[VPC]
    end
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#fce4ec
    style G fill:#f1f8e9
    style H fill:#fff3e0
    style I fill:#f1f8e9
    style J fill:#fff8e1
    style K fill:#fff8e1
    style L fill:#fff8e1
    style M fill:#f1f8e9
    style N fill:#f1f8e9
    style O fill:#e8f5e8
```

