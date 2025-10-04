# Simplified User Features Diagram - English Version

## User Features Diagram Preview - Simplified Version

```mermaid
graph TD
    subgraph "Authentication"
        A[User Browser] --> B[Cognito User Pool<br/>worldsense-users]
        B --> C[JWT Token]
    end
    
    subgraph "Frontend Loading"
        D[CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net] --> E[S3 Static Hosting<br/>my-worldsense-bucket]
        E --> F[React SPA]
        E --> G[Leaflet.js Map]
        E --> H[Chart.js Charts]
    end
    
    subgraph "Interactive Features"
        I[Global Map] --> J[Event Clusters]
        J --> K[Heat Maps]
        K --> L[Geographic Filtering]
        
        M[Analytics Dashboard] --> N[Time-series Charts]
        M --> O[Statistical Charts]
        M --> P[Event Distribution]
        
        Q[Search Interface] --> R[Time Range Filter]
        Q --> S[Location Filter]
        Q --> T[Sentiment Filter]
        Q --> U[Category Filter]
    end
    
    subgraph "API Integration"
        V[Search API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/search] --> W[Query Processing]
        X[Map API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/map] --> Y[GeoJSON Data]
        Z[Stats API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/stats] --> AA[Aggregations]
    end
    
    A --> D
    C --> I
    C --> M
    C --> Q
    L --> X
    N --> Z
    U --> V
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style D fill:#e1f5fe
    style I fill:#f3e5f5
    style M fill:#e8f5e8
    style Q fill:#fce4ec
    style V fill:#f1f8e9
```

## Ultra-Simplified Version for Presentations

```mermaid
graph TD
    subgraph "User Interface"
        A[Web Browser] --> B[CloudFront CDN]
        B --> C[React Frontend]
    end
    
    subgraph "Core Features"
        D[Interactive Map] --> E[Real-time Events]
        F[Data Analytics] --> G[Charts & Graphs]
        H[Advanced Search] --> I[Multi-dimensional Filters]
    end
    
    subgraph "Backend Services"
        J[API Gateway<br/>82z3xjob1g] --> K[Lambda Functions]
        K --> L[OpenSearch Database]
    end
    
    C --> D
    C --> F
    C --> H
    E --> J
    G --> J
    I --> J
    
    style A fill:#e3f2fd
    style C fill:#e1f5fe
    style D fill:#f3e5f5
    style F fill:#e8f5e8
    style H fill:#fce4ec
    style J fill:#f1f8e9
```

## Minimal Version for Quick Overview

```mermaid
graph LR
    A[User] --> B[Frontend<br/>React + Leaflet]
    B --> C[API Gateway<br/>82z3xjob1g]
    C --> D[Lambda Functions]
    D --> E[OpenSearch<br/>worldsense-gdelt-os-dev]
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#fff3e0
```

## Feature Flow Diagram

```mermaid
graph TD
    A[User Login] --> B[Authentication<br/>Cognito]
    B --> C[Dashboard Access]
    C --> D[Map Visualization]
    C --> E[Data Analytics]
    C --> F[Search Functions]
    
    D --> G[Real-time Events<br/>Leaflet.js]
    E --> H[Charts & Statistics<br/>Chart.js]
    F --> I[Advanced Filters<br/>Time/Location/Sentiment]
    
    G --> J[API Calls<br/>82z3xjob1g]
    H --> J
    I --> J
    
    J --> K[OpenSearch Queries<br/>worldsense-gdelt-os-dev]
    K --> L[Sub-500ms Response]
    
    style A fill:#e3f2fd
    style B fill:#fff3e0
    style C fill:#e1f5fe
    style G fill:#f3e5f5
    style H fill:#e8f5e8
    style I fill:#fce4ec
    style J fill:#f1f8e9
    style K fill:#fff3e0
    style L fill:#c8e6c9
```

