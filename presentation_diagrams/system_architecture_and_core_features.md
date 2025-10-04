# System Architecture & Core User Features Diagrams

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[User Browser] --> B[CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net<br/>Distribution ID: E3MJ8UIOB3UH8Q]
        B --> C[S3 Static Website<br/>my-worldsense-bucket]
    end
    
    subgraph "API Gateway Layer"
        D[HTTP API Gateway<br/>worldsense-gdelt-api<br/>ID: 82z3xjob1g] --> E[Route: /search]
        D --> F[Route: /map]
        D --> G[Route: /stats]
        H[REST API Gateway<br/>gdelt-api<br/>ID: sqeg4ixx58] --> I[Backup Routes]
    end
    
    subgraph "Compute Layer"
        J[gdelt-api Lambda<br/>Python 3.13, 512MB, 15s<br/>Role: gdelt-api-role] --> K[API Processing]
        L[gdelt-indexer Lambda<br/>Python 3.13, 1024MB, 300s<br/>Role: gdelt-indexer-role] --> M[Data Indexing]
        N[gdelt-fetch-clean Lambda<br/>Python 3.13, 512MB, 300s<br/>Role: gdelt-lambda-role] --> O[Data Collection]
    end
    
    subgraph "Data Layer"
        P[OpenSearch Service<br/>worldsense-gdelt-os-dev<br/>Endpoint: search-worldsense-gdelt-os-dev-tfuw6rzu5dpjqqjfhsjy3lszxa.us-east-1.es.amazonaws.com] --> Q[2×t3.small.search Data Nodes]
        P --> R[2×t3.small.search Master Nodes]
        P --> S[10GB GP3 EBS per Node<br/>3000 IOPS, 125MB/s]
        P --> T[Index: gdelt-events<br/>Alias: gdelt-lab-v1]
        
        U[S3 Data Lake] --> V[Frontend Bucket<br/>my-worldsense-bucket]
        U --> W[Processed Data Bucket<br/>gdelt-processed-worldsense]
        U --> X[Audit Logs Bucket<br/>aws-cloudtrail-logs-810731468776-c013728b]
    end
    
    subgraph "Authentication & Security"
        Y[Cognito User Pool<br/>worldsense-users<br/>ID: us-east-1_Wfn3se9zs] --> Z[User Authentication]
        AA[IAM Cross-Account Roles] --> BB[Project-Admin Role]
        AA --> CC[Project-Developer Role]
        AA --> DD[Project-Viewer Role]
        EE[AWS Secrets Manager<br/>opensearch/worldsense/indexer] --> FF[OpenSearch Credentials]
    end
    
    subgraph "Event Processing"
        GG[EventBridge Rule<br/>GDELTFetchEvery15min<br/>rate(15 minutes)] --> N
        HH[S3 Event Notifications] --> L
        II[SNS Topics] --> JJ[Standard Topic]
        II --> KK[FIFO Topic]
    end
    
    subgraph "Monitoring & Networking"
        LL[CloudWatch Monitoring] --> MM[Logs & Metrics]
        NN[CloudTrail Audit] --> OO[API Call Logging]
        PP[VPC Network<br/>vpc-017bc7b7189ac581e<br/>172.31.0.0/16] --> QQ[Security Groups<br/>sg-01514dd25e0d2689a, sg-0263b38fead525b65]
    end
    
    C --> D
    D --> J
    E --> J
    F --> J
    G --> J
    J --> P
    J --> W
    L --> P
    L --> W
    N --> W
    GG --> N
    J --> Y
    J --> EE
    L --> EE
    N --> EE
    AA --> J
    AA --> L
    AA --> N
    AA --> P
    AA --> U
    LL --> J
    LL --> L
    LL --> N
    PP --> J
    PP --> L
    PP --> N
    PP --> P
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style D fill:#f3e5f5
    style J fill:#e8f5e8
    style P fill:#fff3e0
    style U fill:#fce4ec
    style Y fill:#f1f8e9
    style GG fill:#fff8e1
    style LL fill:#f1f8e9
    style PP fill:#e8f5e8
```

## Core User Features Diagram

```mermaid
graph TD
    subgraph "User Authentication & Access"
        A[User Login] --> B[Cognito Authentication<br/>worldsense-users<br/>us-east-1_Wfn3se9zs]
        B --> C[JWT Token Management]
        C --> D[Session Storage]
        D --> E[Dashboard Access]
    end
    
    subgraph "Interactive Mapping Features"
        F[Global Event Map<br/>Leaflet.js] --> G[Real-time Event Clusters]
        G --> H[Heat Map Visualization]
        H --> I[Geographic Filtering]
        I --> J[Country/Region Selection]
        J --> K[Distance-based Search]
        K --> L[Sub-second Response Time]
    end
    
    subgraph "Data Visualization & Analytics"
        M[Analytics Dashboard<br/>Chart.js] --> N[Time-series Line Charts]
        M --> O[Statistical Bar Charts]
        M --> P[Event Distribution Pie Charts]
        N --> Q[Multi-timeframe Views<br/>Hourly/Daily/Weekly/Monthly/Yearly]
        O --> Q
        P --> Q
        Q --> R[Interactive Zoom & Pan]
        Q --> S[Export Functionality]
    end
    
    subgraph "Advanced Search & Filtering"
        T[Search Interface] --> U[Time Range Picker<br/>Date/Time Selection]
        T --> V[Geographic Boundary Selector<br/>Map-based Selection]
        T --> W[Sentiment Score Slider<br/>-100 to +100 Scale]
        T --> X[Event Category Checkboxes<br/>Multiple Selection]
        T --> Y[Keyword Search<br/>Full-text Search]
        U --> Z[API Query Builder]
        V --> Z
        W --> Z
        X --> Z
        Y --> Z
        Z --> AA[<500ms Query Response]
    end
    
    subgraph "Real-time Data Features"
        BB[15-minute Data Refresh] --> CC[Automatic Frontend Updates]
        CC --> DD[Progress Indicators]
        DD --> EE[Error Handling & Recovery]
        EE --> FF[Offline Functionality]
        FF --> GG[Auto-sync on Reconnect]
    end
    
    subgraph "API Integration & Performance"
        HH[Search API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/search] --> II[Complex Query Processing]
        JJ[Map API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/map] --> KK[GeoJSON Data Format]
        LL[Stats API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/stats] --> MM[Pre-calculated Aggregations]
        
        NN[Performance Metrics] --> OO[<2s Page Load Time]
        NN --> PP[<3s Time to Interactive]
        NN --> QQ[Sub-500ms API Response]
        NN --> RR[99.9% Uptime]
    end
    
    subgraph "User Experience Features"
        SS[Responsive Design] --> TT[Mobile/Tablet/Desktop Support]
        UU[Accessibility] --> VV[WCAG 2.1 Compliance]
        WW[User Preferences] --> XX[Dynamic Theme Switching]
        WW --> YY[Customizable Dashboard Layout]
        WW --> ZZ[Saved Search Filters]
    end
    
    E --> F
    E --> M
    E --> T
    E --> BB
    L --> JJ
    R --> LL
    AA --> HH
    CC --> NN
    E --> SS
    E --> UU
    E --> WW
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style F fill:#f3e5f5
    style M fill:#e8f5e8
    style T fill:#fce4ec
    style BB fill:#fff8e1
    style HH fill:#f1f8e9
    style SS fill:#e1f5fe
```

