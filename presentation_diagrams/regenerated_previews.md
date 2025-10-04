# 重新生成的图表预览

## 用户功能图预览 - 全新版本

```mermaid
graph TD
    subgraph "用户认证流程"
        A[用户浏览器] --> B[Cognito用户池<br/>worldsense-users<br/>us-east-1_Wfn3se9zs]
        B --> C[JWT令牌管理]
        C --> D[会话存储]
    end
    
    subgraph "前端资源加载"
        E[CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net] --> F[S3静态托管<br/>my-worldsense-bucket]
        F --> G[index.html主页面]
        F --> H[主要应用JS<br/>index-v3.0-CEYIod4a.js]
        F --> I[地图库JS<br/>leaflet-v3.0-CcbFxbU7.js]
        F --> J[第三方库JS<br/>vendor-v3.0-CNkaGmpG.js]
        F --> K[样式文件<br/>index-v3.0-B6lqBTfR.css]
    end
    
    subgraph "交互式地图功能"
        L[Leaflet.js全球地图] --> M[实时事件聚类]
        M --> N[热力图可视化]
        N --> O[地理过滤]
        O --> P[国家/地区选择]
        P --> Q[距离搜索]
        Q --> R[亚秒级响应]
    end
    
    subgraph "数据可视化功能"
        S[Chart.js分析] --> T[时间序列折线图]
        S --> U[统计柱状图]
        S --> V[事件分布饼图]
        T --> W[多时间框架视图<br/>小时/日/周/月/年]
        U --> W
        V --> W
        W --> X[交互式缩放平移]
    end
    
    subgraph "高级搜索界面"
        Y[搜索表单] --> Z[时间范围选择器]
        Y --> AA[地理边界选择器]
        Y --> BB[情感评分滑块]
        Y --> CC[事件类别复选框]
        Z --> DD[API查询构建器]
        AA --> DD
        BB --> DD
        CC --> DD
        DD --> EE[<500ms查询响应]
    end
    
    subgraph "API端点集成"
        FF[搜索API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/search] --> GG[复杂查询处理]
        HH[地图API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/map] --> II[GeoJSON数据格式]
        JJ[统计API<br/>82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/stats] --> KK[预计算聚合]
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

## 整体架构图预览 - 全新版本

```mermaid
graph TB
    subgraph "用户访问层"
        A[Web浏览器] --> B[CloudFront分发<br/>E3MJ8UIOB3UH8Q<br/>d7hwjrg2pdpoj.cloudfront.net]
        B --> C[S3静态网站<br/>my-worldsense-bucket]
    end
    
    subgraph "API网关层"
        D[HTTP API网关<br/>worldsense-gdelt-api<br/>82z3xjob1g] --> E[路由: GET /search]
        D --> F[路由: GET /map]
        D --> G[路由: GET /stats]
        H[REST API网关<br/>gdelt-api<br/>sqeg4ixx58] --> I[备份端点]
    end
    
    subgraph "Lambda函数层"
        J[gdelt-api Lambda<br/>Python 3.13<br/>512MB, 15s超时<br/>gdelt-api-role] --> K[主要API处理]
        L[gdelt-indexer Lambda<br/>Python 3.13<br/>1024MB, 300s超时<br/>gdelt-indexer-role] --> M[数据索引处理]
        N[gdelt-fetch-clean Lambda<br/>Python 3.13<br/>512MB, 300s超时<br/>gdelt-lambda-role] --> O[定时数据收集]
    end
    
    subgraph "OpenSearch服务层"
        P[OpenSearch域<br/>worldsense-gdelt-os-dev] --> Q[端点:<br/>search-worldsense-gdelt-os-dev-tfuw6rzu5dpjqqjfhsjy3lszxa.us-east-1.es.amazonaws.com]
        Q --> R[2×t3.small.search数据节点]
        Q --> S[2×t3.small.search主节点]
        Q --> T[每节点10GB GP3 EBS<br/>3000 IOPS, 125MB/s]
        Q --> U[索引: gdelt-events<br/>别名: gdelt-lab-v1]
    end
    
    subgraph "S3存储层"
        V[S3数据湖] --> W[前端存储桶<br/>my-worldsense-bucket]
        V --> X[处理数据存储桶<br/>gdelt-processed-worldsense]
        V --> Y[审计日志存储桶<br/>aws-cloudtrail-logs-810731468776-c013728b]
        X --> Z[生命周期策略<br/>30天Glacier转换]
    end
    
    subgraph "认证与安全"
        AA[Cognito用户池<br/>worldsense-users<br/>us-east-1_Wfn3se9zs] --> BB[用户认证]
        CC[IAM跨账户角色] --> DD[Project-Admin角色]
        CC --> EE[Project-Developer角色]
        CC --> FF[Project-Viewer角色]
        GG[AWS Secrets Manager<br/>opensearch/worldsense/indexer] --> HH[OpenSearch凭据]
    end
    
    subgraph "事件处理"
        II[EventBridge规则<br/>GDELTFetchEvery15min<br/>rate(15分钟)] --> N
        JJ[S3事件通知] --> L
        KK[SNS主题] --> LL[标准主题]
        KK --> MM[FIFO主题]
    end
    
    subgraph "监控与日志"
        NN[CloudWatch监控] --> OO[实时指标]
        PP[CloudTrail审计] --> QQ[API调用日志]
        RR[CloudWatch告警] --> SS[计费告警: $3.00阈值]
    end
    
    subgraph "网络基础设施"
        TT[VPC隔离<br/>vpc-017bc7b7189ac581e] --> UU[172.31.0.0/16 CIDR]
        UU --> VV[跨AZ的6个子网]
        VV --> WW[安全组]
        WW --> XX[sg-01514dd25e0d2689a<br/>launch-wizard-1]
        WW --> YY[sg-0263b38fead525b65<br/>default]
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
    CC --> J
    CC --> L
    CC --> N
    CC --> P
    CC --> V
    NN --> J
    NN --> L
    NN --> N
    TT --> J
    TT --> L
    TT --> N
    TT --> P
    
    style A fill:#e3f2fd
    style B fill:#e1f5fe
    style D fill:#f3e5f5
    style J fill:#e8f5e8
    style P fill:#fff3e0
    style V fill:#fce4ec
    style AA fill:#f1f8e9
    style II fill:#fff8e1
    style NN fill:#f1f8e9
    style TT fill:#e8f5e8
```

## 数据流程图预览 - 全新版本

```mermaid
sequenceDiagram
    participant U as 用户浏览器
    participant CF as CloudFront CDN<br/>d7hwjrg2pdpoj.cloudfront.net
    participant S3 as S3静态托管<br/>my-worldsense-bucket
    participant AG as API网关<br/>82z3xjob1g
    participant LA as gdelt-api Lambda<br/>512MB, 15s
    participant LI as gdelt-indexer Lambda<br/>1024MB, 300s
    participant LF as gdelt-fetch-clean Lambda<br/>512MB, 300s
    participant OS as OpenSearch<br/>worldsense-gdelt-os-dev
    participant SD as S3数据<br/>gdelt-processed-worldsense
    participant EB as EventBridge<br/>15分钟调度
    participant GDELT as GDELT数据源
    
    Note over U,GDELT: 实时数据处理流程
    
    %% 数据收集阶段
    EB->>LF: 每15分钟触发
    LF->>GDELT: 获取最新数据
    GDELT-->>LF: 返回GDELT记录
    LF->>LF: 清理和验证数据
    LF->>SD: 存储处理后的数据
    
    %% 数据索引阶段
    SD->>LI: S3 PUT事件触发
    LI->>SD: 读取处理后的数据
    LI->>LI: 转换数据格式
    LI->>OS: 批量索引到gdelt-events
    OS-->>LI: 索引确认
    
    %% 用户请求流程
    U->>CF: 请求前端资源
    CF->>S3: 获取静态文件
    S3-->>CF: index.html, JS, CSS文件
    CF-->>U: 提供优化内容
    
    %% 搜索功能
    U->>AG: GET /search?query=...
    AG->>LA: 处理搜索请求
    LA->>OS: 查询gdelt-lab-v1别名
    OS-->>LA: 搜索结果
    LA->>LA: 格式化响应
    LA-->>AG: JSON响应
    AG-->>U: 搜索结果
    
    %% 地图可视化
    U->>AG: GET /map?bounds=...
    AG->>LA: 处理地图请求
    LA->>OS: 查询地理空间数据
    OS-->>LA: GeoJSON结果
    LA->>LA: 格式化GeoJSON
    LA-->>AG: 地图数据
    AG-->>U: GeoJSON响应
    
    %% 统计仪表板
    U->>AG: GET /stats?timeframe=...
    AG->>LA: 处理统计请求
    LA->>OS: 聚合查询
    OS-->>LA: 统计数据
    LA->>LA: 计算指标
    LA-->>AG: 统计响应
    AG-->>U: 仪表板数据
    
    Note over LA: <500ms响应时间
    Note over LI: 批量处理
    Note over LF: 15分钟刷新周期
    Note over OS: 亚秒级查询
```

## 成本优化流程图预览 - 全新版本

```mermaid
graph LR
    subgraph "第一阶段: 生产设置"
        A[初始配置] --> B[总共6个节点]
        B --> C[3×t3.large.search数据节点]
        B --> D[3×t3.large.search主节点]
        C --> E[多AZ待机]
        D --> E
        E --> F[启用区域感知]
        F --> G[启用自动调优]
        G --> H[每节点20GB GP2]
        H --> I[月度成本: $1,005]
    end
    
    subgraph "第二阶段: 实验室设置"
        J[中间配置] --> K[总共4个节点]
        K --> L[2×t3.small.search数据节点]
        K --> M[2×t3.small.search主节点]
        L --> N[单AZ配置]
        M --> N
        N --> O[禁用功能]
        O --> P[每节点10GB GP3]
        P --> Q[月度成本: $105]
    end
    
    subgraph "第三阶段: 最小设置"
        R[当前配置] --> S[总共1个节点]
        S --> T[1×t3.small.search实例]
        T --> U[无专用主节点]
        U --> V[单AZ]
        V --> W[最小功能]
        W --> X[10GB GP3存储]
        X --> Y[月度成本: $25]
    end
    
    subgraph "当前成本分解"
        Z[总计: $640.67/月] --> AA[OpenSearch: $555.16<br/>占总成本的86.7%]
        Z --> BB[税费: $83.57<br/>占总成本的13.0%]
        Z --> CC[其他服务: $1.94<br/>占总成本的0.3%]
        CC --> DD[S3: $1.03]
        CC --> EE[KMS: $0.88]
    end
    
    subgraph "免费层级服务"
        FF[Lambda: $0.00] --> GG[每月100万请求]
        HH[DynamoDB: $0.00] --> II[25GB存储]
        JJ[SNS/SQS: $0.00] --> KK[在免费限制内]
        LL[EventBridge: $0.00] --> MM[每月100万事件]
        NN[Secrets Manager: $0.00] --> OO[每月1万API调用]
    end
    
    subgraph "优化结果"
        PP[总节省: $980/月] --> QQ[98%成本降低]
        QQ --> RR[年度节省: $11,760]
        RR --> SS[性能保持]
        SS --> TT[<500ms查询响应]
        SS --> UU[99.9%正常运行时间]
    end
    
    I --> Q
    Q --> Y
    Y --> Z
    Z --> PP
    
    style I fill:#ffcdd2
    style Q fill:#fff3e0
    style Y fill:#c8e6c9
    style Z fill:#e3f2fd
    style FF fill:#e8f5e8
    style PP fill:#4caf50
```

## 安全架构图预览 - 全新版本

```mermaid
graph TB
    subgraph "跨账户访问控制"
        A[5个外部AWS账户] --> B[账户: 728980333359]
        A --> C[账户: 489335433954]
        A --> D[账户: 764508635426]
        A --> E[账户: 980102315041]
        A --> F[账户: 381492064806]
    end
    
    subgraph "IAM角色层次结构"
        G[Project-Admin角色] --> H[PowerUserAccess策略]
        G --> I[自定义管理员策略]
        J[Project-Developer角色] --> K[ProjectDeveloperPolicy]
        K --> L[S3, DynamoDB, Lambda完全访问]
        K --> M[EC2, ELB, Auto Scaling访问]
        K --> N[CloudWatch, CloudFront访问]
        K --> O[OpenSearch, API Gateway访问]
        K --> P[SNS, SQS, Secrets Manager访问]
        Q[Project-Viewer角色] --> R[ProjectViewerPolicy]
        R --> S[对所有服务的只读访问]
        T[S3ReadOnly角色] --> U[仅S3 GetObject/ListBucket]
    end
    
    subgraph "MFA和会话管理"
        V[多因素认证] --> W[外部账户需要MFA]
        W --> X[4小时会话超时]
        X --> Y[自动凭据过期]
        Y --> Z[CloudTrail会话日志]
    end
    
    subgraph "数据加密和安全"
        AA[KMS加密] --> BB[OpenSearch数据加密]
        AA --> CC[S3服务器端加密]
        DD[HTTPS/TLS 1.2+] --> EE[所有API通信]
        FF[AWS Secrets Manager] --> GG[OpenSearch凭据存储]
        GG --> HH[opensearch/worldsense/indexer]
        HH --> II[自动凭据轮换]
    end
    
    subgraph "网络安全"
        JJ[VPC隔离<br/>vpc-017bc7b7189ac581e] --> KK[172.31.0.0/16 CIDR]
        KK --> LL[跨AZ的6个子网]
        LL --> MM[安全组]
        MM --> NN[sg-01514dd25e0d2689a<br/>launch-wizard-1]
        MM --> OO[sg-0263b38fead525b65<br/>default]
        PP[网络ACL] --> QQ[acl-022ccbb5f1e3333f7<br/>默认NACL]
    end
    
    subgraph "当前安全状态"
        RR[✅ 已实施安全] --> SS[IAM最小权限]
        RR --> TT[VPC网络隔离]
        RR --> UU[MFA认证]
        RR --> VV[静态/传输数据加密]
        WW[⚠️ 安全改进] --> XX[OpenSearch访问策略<br/>当前开放 - 需要限制]
        WW --> YY[基于IP的访问控制<br/>生产环境推荐]
        WW --> ZZ[AWS Config规则<br/>持续合规监控]
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

