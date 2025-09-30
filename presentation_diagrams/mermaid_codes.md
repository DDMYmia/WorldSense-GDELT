# Mermaid Diagrams for WorldSense-GDELT Presentation

## 第1页：项目概述 - 系统架构图

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

---

## 第2页：团队协作 - 协作流程图

```mermaid
graph TD
    subgraph "Team Members & Roles"
        A[Maxing<br/>Project Overview] --> B[Xiaoyi Yu<br/>Project Manager & DevOps]
        B --> C[Zhaoxuan Chen<br/>Backend Developer]
        C --> D[Yang Liu<br/>Data Analyst & QA]
        D --> E[Zhiyuan Wei<br/>Frontend Developer]
        E --> F[Xiang Ma<br/>Security Specialist]
    end
    
    subgraph "Key Achievements"
        B --> G[77.4% Cost Reduction]
        C --> H[Real-time 15-min Processing]
        E --> I[<2s Page Load Time]
        F --> J[5 External Accounts + MFA]
        D --> K[95% Test Coverage<br/>$1,061→$240 Savings]
    end
    
    subgraph "Cross-Account Collaboration"
        L[5 External AWS Accounts] --> M[3-Tier IAM Roles]
        M --> N[Admin/Developer/Viewer]
        N --> O[4-Hour Session Timeout]
        O --> P[MFA Required]
    end
    
    subgraph "Collaboration Flow"
        Q[Project Planning] --> R[Development Sprint]
        R --> S[Code Review]
        S --> T[Testing & QA]
        T --> U[Deployment]
        U --> V[Monitoring]
        V --> Q
    end
    
    style B fill:#e3f2fd
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#f3e5f5
    style F fill:#fce4ec
```

---

## 第3页：系统架构 - 详细架构设计图

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

---

## 第4页：核心功能 - 用户功能流程图

```mermaid
graph TD
    subgraph "User Interface Layer"
        A[User Login] --> B[Cognito Authentication]
        B --> C[Responsive Dashboard]
        C --> D[Mobile/Tablet/Desktop Support]
    end
    
    subgraph "Interactive Mapping"
        E[Leaflet.js Global Map] --> F[Real-time Event Visualization]
        F --> G[Clustering & Heat Maps]
        G --> H[Geographic Filtering]
        H --> I[Sub-second Response Time]
    end
    
    subgraph "Data Visualization"
        J[Chart.js Analytics] --> K[Time-series Analysis]
        K --> L[Multi-timeframe Views]
        L --> M[Hourly to Yearly Views]
        M --> N[Interactive Zoom & Pan]
    end
    
    subgraph "Advanced Search"
        O[Multi-dimensional Filtering] --> P[Time Range Filter]
        O --> Q[Geographic Boundary Filter]
        O --> R[Sentiment Threshold Filter]
        O --> S[Event Category Filter]
        P --> T[<500ms Query Response]
        Q --> T
        R --> T
        S --> T
    end
    
    subgraph "Real-time Features"
        U[15-minute Data Refresh] --> V[Automatic Frontend Updates]
        V --> W[Error Handling & Recovery]
        W --> X[Offline Functionality]
        X --> Y[Auto-sync on Reconnect]
    end
    
    subgraph "Performance Metrics"
        Z[<2s Page Load Time] --> AA[<3s Time to Interactive]
        AA --> BB[Sub-500ms API Response]
        BB --> CC[99.9% Uptime]
    end
    
    C --> E
    C --> J
    C --> O
    C --> U
    B --> Z
    
    style E fill:#e1f5fe
    style J fill:#f3e5f5
    style O fill:#e8f5e8
    style U fill:#fff3e0
    style Z fill:#fce4ec
```

---

## 第5页：安全设计 - 多层安全架构图

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

---

## 第6页：成本优化 - 成本对比图表

```mermaid
graph TB
    subgraph "Phase 1: Production Configuration"
        A[Initial Setup] --> B[3 Data + 3 Master Nodes]
        B --> C[t3.large.search instances]
        C --> D[Multi-AZ with Standby]
        D --> E[Zone Awareness Enabled]
        E --> F[Monthly Cost: $1,005]
    end
    
    subgraph "Phase 2: Laboratory Configuration"
        G[Intermediate Setup] --> H[2 Data + 2 Master Nodes]
        H --> I[t3.small.search instances]
        I --> J[Single-AZ Configuration]
        J --> K[Features Disabled]
        K --> L[Monthly Cost: $105]
    end
    
    subgraph "Phase 3: Minimal Configuration"
        M[Current Setup] --> N[1 Node Configuration]
        N --> O[t3.small.search instance]
        O --> P[No Dedicated Master]
        P --> Q[Single Node]
        Q --> R[Monthly Cost: $25]
    end
    
    subgraph "Current Cost Structure (September 2025)"
        S[Total Monthly Cost: $640.67] --> T[OpenSearch: $555.16 (86.7%)]
        S --> U[Tax: $83.57 (13.0%)]
        S --> V[Other Services: $1.94 (0.3%)]
        V --> W[S3: $1.03]
        V --> X[KMS: $0.88]
    end
    
    subgraph "Free Tier Services"
        Y[Lambda: $0.00] --> Z[1M requests/month]
        AA[DynamoDB: $0.00] --> BB[25GB storage]
        CC[SNS/SQS: $0.00] --> DD[Within free limits]
        EE[EventBridge: $0.00] --> FF[1M events/month]
        GG[Secrets Manager: $0.00] --> HH[10K API calls/month]
    end
    
    subgraph "Optimization Results"
        II[Cost Reduction: 98%] --> JJ[From $1,005 to $25]
        KK[Monthly Savings: $980] --> LL[Annual Savings: $11,760]
        MM[Performance Maintained] --> NN[<500ms query response]
        MM --> OO[99.9% uptime]
    end
    
    F --> G
    L --> M
    R --> S
    
    style F fill:#ffcdd2
    style L fill:#fff3e0
    style R fill:#c8e6c9
    style S fill:#e3f2fd
    style Y fill:#e8f5e8
    style II fill:#4caf50
```

---

## 综合展示图表 - 系统总览图

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

## 使用说明

### 渲染方式
1. **GitHub**: 直接在Markdown文件中显示
2. **Mermaid Live Editor**: https://mermaid.live/
3. **VS Code**: 安装Mermaid Preview扩展
4. **在线工具**: 各种Mermaid在线编辑器

### 自定义颜色
- 使用 `style` 指令自定义节点颜色
- 颜色代码格式：`fill:#颜色代码`
- 建议使用Material Design颜色调色板

### 导出格式
- PNG/SVG: 用于PPT演示
- PDF: 用于文档报告
- HTML: 用于网页展示

