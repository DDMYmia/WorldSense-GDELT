# Slide 4: Core User Features - Function Flow Diagram

## Interactive Platform Capabilities

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

## User Experience Flow

### Authentication & Access
1. **User Login**: Cognito email/password authentication
2. **Session Management**: JWT token-based sessions
3. **Responsive Design**: Adaptive layouts for all devices

### Core Functionality
1. **Interactive Mapping**: Leaflet.js with real-time data
2. **Data Visualization**: Chart.js time-series analysis
3. **Advanced Search**: Multi-dimensional filtering
4. **Real-time Updates**: 15-minute refresh cycles

### Performance Features
- **Page Load**: <2 seconds
- **API Response**: <500 milliseconds
- **Offline Support**: Core functionality available offline
- **Auto-sync**: Data synchronization on reconnection

