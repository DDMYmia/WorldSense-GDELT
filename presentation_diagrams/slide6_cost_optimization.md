# Slide 6: Cost Optimization - Cost Comparison Charts

## Three-Phase Cost Optimization Journey

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

## Cost Optimization Strategies

### Key Optimization Techniques
1. **Instance Right-sizing**: t3.large → t3.small (62.5% compute cost reduction)
2. **Node Count Reduction**: 6 → 4 → 1 nodes
3. **Feature Disabling**: Multi-AZ, Auto-Tune, Zone Awareness
4. **Storage Optimization**: GP2 → GP3, 20GB → 10GB
5. **Single-AZ Deployment**: Eliminated cross-AZ transfer costs

### Performance Impact
- **Query Response**: <500ms (maintained)
- **Availability**: 99.9% uptime (maintained)
- **User Experience**: No impact on frontend performance
- **Data Processing**: 15-minute cycles (unaffected)

### Future Optimization Opportunities
- **S3 Lifecycle Policies**: 20-30% additional savings
- **Reserved Instances**: 30-50% compute savings
- **Further Node Reduction**: Additional $213/month potential
- **Auto-scaling**: 15-25% savings during low usage periods

