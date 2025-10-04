# 修复的图表 - 基于真实AWS配置

## 用户功能图 - 修复版本

```mermaid
graph TD
    subgraph "User Authentication Flow"
        A[User Browser] --> B[Cognito User Pool<br/>worldsense-users<br/>us-east-1_Wfn3se9zs]
        B --> C[JWT Token Management]
        C --> D[Session Storage]
    end
    
    subgraph "Frontend Assets Loading"
        E[CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net] --> F[S3 Static Hosting<br/>my-worldsense-bucket]
        F --> G[index.html]
        F --> H[index-v3.0-CEYIod4a.js]
        F --> I[leaflet-v3.0-CcbFxbU7.js]
        F --> J[vendor-v3.0-CNkaGmpG.js]
        F --> K[index-v3.0-B6lqBTfR.css]
    end
    
    subgraph "Interactive Mapping Features"
        L[Leaflet.js Global Map] --> M[Real-time Event Clusters]
        M --> N[Heat Map Visualization]
        N --> O[Geographic Filtering]
        O --> P[Country/Region Selection]
        P --> Q[Distance-based Search]
        Q --> R[Sub-second Response]
    end
    
    subgraph "Data Visualization Features"
        S[Chart.js Analytics] --> T[Time-series Line Charts]
        S --> U[Statistical Bar Charts]
        S --> V[Event Distribution Pie Charts]
        T --> W[Multi-timeframe Views<br/>Hourly/Daily/Weekly/Monthly/Yearly]
        U --> W
        V --> W
        W --> X[Interactive Zoom & Pan]
    end
    
    subgraph "Advanced Search Interface"
        Y[Search Form] --> Z[Time Range Picker]
        Y --> AA[Geographic Boundary Selector]
        Y --> BB[Sentiment Score Slider]
        Y --> CC[Event Category Checkboxes]
        Z --> DD[API Query Builder]
        AA --> DD
        BB --> DD
        CC --> DD
        DD --> EE[<500ms Query Response]
    end
    
    subgraph "API Endpoints Integration"
        FF[/search API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/search] --> GG[Complex Query Processing]
        HH[/map API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/map] --> II[GeoJSON Data Format]
        JJ[/stats API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/stats] --> KK[Pre-calculated Aggregations]
    end
    
    A --> E
    D --> L
    D --> S
    D --> Y
    R --> HH
    X --> JJ
    EE --> FF
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style E fill:#e1f5fe
    style L fill:#f3e5f5
    style S fill:#e8f5e8
    style Y fill:#fce4ec
    style FF fill:#f1f8e9
```

## 整体架构图 - 修复版本

```mermaid
graph TB
    subgraph "User Access Layer"
        A[Web Browser] --> B[CloudFront Distribution<br/>E3MJ8UIOB3UH8Q<br/>d7hwjrg2pdpoj.cloudfront.net]
        B --> C[S3 Static Website<br/>my-worldsense-bucket]
    end
    
    subgraph "API Gateway Layer"
        D[HTTP API Gateway<br/>worldsense-gdelt-api<br/>82z3xjob1g] --> E[Route: GET /search]
        D --> F[Route: GET /map]
        D --> G[Route: GET /stats]
        H[REST API Gateway<br/>gdelt-api<br/>sqeg4ixx58] --> I[Backup Endpoint]
    end
    
    subgraph "Lambda Functions Layer"
        J[gdelt-api Lambda<br/>Python 3.13<br/>512MB, 15s timeout<br/>gdelt-api-role] --> K[Main API Processing]
        L[gdelt-indexer Lambda<br/>Python 3.13<br/>1024MB, 300s timeout<br/>gdelt-indexer-role] --> M[Data Indexing Processing]
        N[gdelt-fetch-clean Lambda<br/>Python 3.13<br/>512MB, 300s timeout<br/>gdelt-lambda-role] --> O[Scheduled Data Collection]
    end
    
    subgraph "OpenSearch Service Layer"
        P[OpenSearch Domain<br/>worldsense-gdelt-os-dev] --> Q[Endpoint:<br/>search-worldsense-gdelt-os-dev-tfuw6rzu5dpjqqjfhsjy3lszxa.us-east-1.es.amazonaws.com]
        Q --> R[2×t3.small.search Data Nodes]
        Q --> S[2×t3.small.search Master Nodes]
        Q --> T[10GB GP3 EBS per Node<br/>3000 IOPS, 125MB/s]
        Q --> U[Index: gdelt-events<br/>Alias: gdelt-lab-v1]
    end
    
    subgraph "S3 Storage Layer"
        V[S3 Data Lake] --> W[Frontend Bucket<br/>my-worldsense-bucket]
        V --> X[Processed Data Bucket<br/>gdelt-processed-worldsense]
        V --> Y[Audit Logs Bucket<br/>aws-cloudtrail-logs-810731468776-c013728b]
        X --> Z[Lifecycle Policy<br/>30-day Glacier transition]
    end
    
    subgraph "Authentication & Security"
        AA[Cognito User Pool<br/>worldsense-users<br/>us-east-1_Wfn3se9zs] --> BB[User Authentication]
        CC[IAM Cross-Account Roles] --> DD[Project-Admin Role]
        CC --> EE[Project-Developer Role]
        CC --> FF[Project-Viewer Role]
        GG[AWS Secrets Manager<br/>opensearch/worldsense/indexer] --> HH[OpenSearch Credentials]
    end
    
    subgraph "Event Processing"
        II[EventBridge Rule<br/>GDELTFetchEvery15min<br/>rate(15 minutes)] --> N
        JJ[S3 Event Notifications] --> L
        KK[SNS Topics] --> LL[Standard Topic]
        KK --> MM[FIFO Topic]
    end
    
    C --> D
    D --> J
    E --> J
    F --> J
    G --> J
    J --> P
    J --> X
    L --> P
    L --> X
    N --> X
    II --> N
    J --> AA
    J --> GG
    L --> GG
    N --> GG
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style D fill:#f3e5f5
    style J fill:#e8f5e8
    style P fill:#fff3e0
    style V fill:#fce4ec
    style AA fill:#f1f8e9
    style II fill:#fff8e1
```

## 数据流程图 - 修复版本

```mermaid
sequenceDiagram
    participant U as User Browser
    participant CF as CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net
    participant S3 as S3 Static Hosting<br/>my-worldsense-bucket
    participant AG as API Gateway<br/>82z3xjob1g
    participant LA as gdelt-api Lambda<br/>512MB, 15s
    participant LI as gdelt-indexer Lambda<br/>1024MB, 300s
    participant LF as gdelt-fetch-clean Lambda<br/>512MB, 300s
    participant OS as OpenSearch<br/>worldsense-gdelt-os-dev
    participant SD as S3 Data<br/>gdelt-processed-worldsense
    participant EB as EventBridge<br/>15-min schedule
    participant GDELT as GDELT Data Source
    
    Note over U,GDELT: Real-time Data Processing Flow
    
    %% Data Collection Phase
    EB->>LF: Trigger every 15 minutes
    LF->>GDELT: Fetch latest data
    GDELT-->>LF: Return GDELT records
    LF->>LF: Clean & validate data
    LF->>SD: Store processed data
    
    %% Data Indexing Phase
    SD->>LI: S3 PUT event trigger
    LI->>SD: Read processed data
    LI->>LI: Transform data format
    LI->>OS: Bulk index to gdelt-events
    OS-->>LI: Index confirmation
    
    %% User Request Flow
    U->>CF: Request frontend assets
    CF->>S3: Fetch static files
    S3-->>CF: index.html, JS, CSS files
    CF-->>U: Deliver optimized content
    
    %% Search Functionality
    U->>AG: GET /search?query=...
    AG->>LA: Process search request
    LA->>OS: Query gdelt-lab-v1 alias
    OS-->>LA: Search results
    LA->>LA: Format response
    LA-->>AG: JSON response
    AG-->>U: Search results
    
    %% Map Visualization
    U->>AG: GET /map?bounds=...
    AG->>LA: Process map request
    LA->>OS: Query geospatial data
    OS-->>LA: GeoJSON results
    LA->>LA: Format GeoJSON
    LA-->>AG: Map data
    AG-->>U: GeoJSON response
    
    Note over LA: <500ms response time
    Note over LI: Bulk processing
    Note over LF: 15-min refresh cycle
    Note over OS: Sub-second queries
```

## 成本优化流程图 - 修复版本

```mermaid
graph LR
    subgraph "Phase 1: Production Setup"
        A[Initial Configuration] --> B[6 Nodes Total]
        B --> C[3×t3.large.search Data Nodes]
        B --> D[3×t3.large.search Master Nodes]
        C --> E[Multi-AZ with Standby]
        D --> E
        E --> F[Zone Awareness Enabled]
        F --> G[Auto-Tune Enabled]
        G --> H[20GB GP2 per Node]
        H --> I[Monthly Cost: $1,005]
    end
    
    subgraph "Phase 2: Laboratory Setup"
        J[Intermediate Configuration] --> K[4 Nodes Total]
        K --> L[2×t3.small.search Data Nodes]
        K --> M[2×t3.small.search Master Nodes]
        L --> N[Single-AZ Configuration]
        M --> N
        N --> O[Features Disabled]
        O --> P[10GB GP3 per Node]
        P --> Q[Monthly Cost: $105]
    end
    
    subgraph "Phase 3: Minimal Setup"
        R[Current Configuration] --> S[1 Node Total]
        S --> T[1×t3.small.search Instance]
        T --> U[No Dedicated Master]
        U --> V[Single-AZ]
        V --> W[Minimal Features]
        W --> X[10GB GP3 Storage]
        X --> Y[Monthly Cost: $25]
    end
    
    subgraph "Current Cost Breakdown"
        Z[Total: $640.67/month] --> AA[OpenSearch: $555.16<br/>86.7% of total]
        Z --> BB[Tax: $83.57<br/>13.0% of total]
        Z --> CC[Other Services: $1.94<br/>0.3% of total]
        CC --> DD[S3: $1.03]
        CC --> EE[KMS: $0.88]
    end
    
    I --> Q
    Q --> Y
    Y --> Z
    
    style I fill:#ffcdd2
    style Q fill:#fff3e0
    style Y fill:#c8e6c9
    style Z fill:#e3f2fd
```

## 安全架构图 - 修复版本

```mermaid
graph TB
    subgraph "Cross-Account Access Control"
        A[5 External AWS Accounts] --> B[Account: 728980333359]
        A --> C[Account: 489335433954]
        A --> D[Account: 764508635426]
        A --> E[Account: 980102315041]
        A --> F[Account: 381492064806]
    end
    
    subgraph "IAM Role Hierarchy"
        G[Project-Admin Role] --> H[PowerUserAccess Policy]
        G --> I[Custom Admin Policies]
        J[Project-Developer Role] --> K[ProjectDeveloperPolicy]
        K --> L[S3, DynamoDB, Lambda Full Access]
        K --> M[EC2, ELB, Auto Scaling Access]
        K --> N[CloudWatch, CloudFront Access]
        K --> O[OpenSearch, API Gateway Access]
        K --> P[SNS, SQS, Secrets Manager Access]
        Q[Project-Viewer Role] --> R[ProjectViewerPolicy]
        R --> S[Read-only Access to All Services]
        T[S3ReadOnly Role] --> U[S3 GetObject/ListBucket Only]
    end
    
    subgraph "MFA & Session Management"
        V[Multi-Factor Authentication] --> W[MFA Required for External Accounts]
        W --> X[4-Hour Session Timeout]
        X --> Y[Automatic Credential Expiration]
        Y --> Z[CloudTrail Session Logging]
    end
    
    subgraph "Data Encryption & Security"
        AA[KMS Encryption] --> BB[OpenSearch Data Encryption]
        AA --> CC[S3 Server-side Encryption]
        DD[HTTPS/TLS 1.2+] --> EE[All API Communications]
        FF[AWS Secrets Manager] --> GG[OpenSearch Credentials Storage]
        GG --> HH[opensearch/worldsense/indexer]
        HH --> II[Automatic Credential Rotation]
    end
    
    subgraph "Network Security"
        JJ[VPC Isolation<br/>vpc-017bc7b7189ac581e] --> KK[172.31.0.0/16 CIDR]
        KK --> LL[6 Subnets across AZs]
        LL --> MM[Security Groups]
        MM --> NN[sg-01514dd25e0d2689a<br/>launch-wizard-1]
        MM --> OO[sg-0263b38fead525b65<br/>default]
        PP[Network ACLs] --> QQ[acl-022ccbb5f1e3333f7<br/>Default NACL]
    end
    
    subgraph "Current Security Status"
        RR[✅ Implemented Security] --> SS[IAM Least Privilege]
        RR --> TT[VPC Network Isolation]
        RR --> UU[MFA Authentication]
        RR --> VV[Data Encryption at Rest/Transit]
        WW[⚠️ Security Improvements] --> XX[OpenSearch Access Policy<br/>Currently Open - Needs Restriction]
        WW --> YY[IP-based Access Control<br/>Recommended for Production]
        WW --> ZZ[AWS Config Rules<br/>Continuous Compliance Monitoring]
    end
    
    B --> G
    C --> G
    D --> G
    E --> G
    F --> T
    G --> V
    J --> V
    Q --> V
    AA --> JJ
    FF --> JJ
    
    style A fill:#e1f5fe
    style G fill:#f3e5f5
    style V fill:#e8f5e8
    style AA fill:#fff3e0
    style JJ fill:#fce4ec
    style RR fill:#c8e6c9
    style WW fill:#ffcdd2
```

