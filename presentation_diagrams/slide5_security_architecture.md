# Slide 5: Security Design - Multi-layer Security Framework

## Comprehensive Security Architecture

```mermaid
graph TB
    subgraph "Identity & Access Management"
        A[5 External AWS Accounts] --> B[3-Tier IAM Roles]
        B --> C[Project-Admin]
        B --> D[Project-Developer]
        B --> E[Project-Viewer]
        C --> F[MFA Required]
        D --> F
        E --> F
        F --> G[4-Hour Session Timeout]
    end
    
    subgraph "Data Security Layer"
        H[KMS Encryption] --> I[OpenSearch Encryption]
        H --> J[S3 Server-side Encryption]
        K[HTTPS/TLS 1.2+] --> L[All Communications]
        M[AWS Secrets Manager] --> N[Credential Storage]
        N --> O[Automatic Rotation]
    end
    
    subgraph "Network Security"
        P[VPC Isolation<br/>vpc-017bc7b7189ac581e] --> Q[172.31.0.0/16]
        Q --> R[Security Groups]
        R --> S[API Rate Limiting]
        S --> T[DDoS Protection]
    end
    
    subgraph "Monitoring & Auditing"
        U[CloudWatch Monitoring] --> V[Real-time Alerts]
        W[CloudTrail Logging] --> X[Complete Audit Trail]
        Y[Automated Security Alerts] --> Z[Threat Response]
    end
    
    subgraph "Compliance & Privacy"
        AA[GDPR Compliance] --> BB[Data Privacy Protection]
        CC[CCPA Compliance] --> BB
        DD[Data Anonymization] --> EE[User Rights Management]
    end
    
    subgraph "Current Security Status"
        FF[✅ Implemented] --> GG[IAM Least Privilege]
        FF --> HH[VPC Network Isolation]
        FF --> II[MFA Authentication]
        FF --> JJ[Comprehensive Encryption]
        KK[⚠️ Improvements Needed] --> LL[OpenSearch Access Policy]
        KK --> MM[IP-based Access Control]
    end
    
    A --> H
    A --> P
    A --> U
    H --> U
    P --> U
    U --> AA
    
    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style P fill:#e8f5e8
    style U fill:#fff3e0
    style AA fill:#fce4ec
    style FF fill:#c8e6c9
    style KK fill:#ffcdd2
```

## Security Implementation Details

### Cross-Account Access Control
- **5 External Accounts**: 728980333359, 489335433954, 764508635426, 980102315041, 381492064806
- **3-Tier IAM Roles**: Admin (full access), Developer (development permissions), Viewer (read-only)
- **MFA Enforcement**: Mandatory for all external accounts
- **Session Management**: 4-hour maximum timeout

### Data Protection
- **Encryption**: KMS for OpenSearch, SSE-S3 for storage
- **Transmission**: HTTPS/TLS 1.2+ for all communications
- **Secrets Management**: AWS Secrets Manager with automatic rotation

### Network Security
- **VPC Isolation**: Default VPC with 6 subnets across availability zones
- **Security Groups**: Controlled network access
- **API Protection**: Rate limiting and DDoS protection

### Monitoring & Compliance
- **Real-time Monitoring**: CloudWatch alerts and metrics
- **Audit Logging**: Complete CloudTrail audit trail
- **Compliance**: GDPR and CCPA compliance framework

