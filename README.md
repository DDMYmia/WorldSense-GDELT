# WorldSense-GDELT Project
[![Deploy WorldSense-GDELT to AWS](https://github.com/DDMYmia/WorldSense-GDELT/actions/workflows/deploy.yml/badge.svg)](https://github.com/DDMYmia/WorldSense-GDELT/actions/workflows/deploy.yml)
## Project Overview

WorldSense-GDELT is a global event perception and analysis platform built on AWS, utilizing GDELT datasets to provide real-time event monitoring and analysis services through interactive web interfaces.

## AWS Architecture Services Checklist

### Completed AWS Service Configurations:

1. **IAM Identity and Access Management**
   - User role creation and management
   - Permission policy configuration
   - Security credential management

2. **Security Groups and Network Configuration**
   - VPC (Virtual Private Cloud) settings
   - Network ACL configuration
   - Serverless architecture security considerations

3. **S3 Storage Architecture**
   - Frontend hosting buckets
   - Data storage bucket configuration
   - Static website hosting

4. **OpenSearch Service**
   - Cluster configuration and scaling
   - Index mapping design
   - Security authentication and access control

5. **Lambda Functions**
   - Execution role configuration
   - Environment variable management
   - Performance optimization and monitoring

6. **API Gateway**
   - HTTP API configuration
   - Route and method settings
   - Lambda integration

7. **CloudFront Distribution**
   - Global CDN configuration
   - Cache policy optimization
   - Edge computing

8. **Cognito User Authentication**
   - User pool configuration
   - Client application settings
   - Identity pools and federated authentication

9. **CloudWatch Monitoring**
   - Log recording and aggregation
   - Metric monitoring and visualization
   - Alert configuration and response

## Overall Architecture

```
[CloudFront (d7hwjrg2pdpoj.cloudfront.net)] → [API Gateway (worldsense-gdelt-api)]
     ↓                                              ↓
[S3 Frontend (my-worldsense-bucket)]         [Lambda Functions]
     ↓                                              ↓
[CloudWatch Monitoring] ← [Cognito (worldsense-users)] ← [OpenSearch (worldsense-gdelt-os-dev)]
     ↓                                              ↓
[IAM Roles & Policies] ← [VPC & Security Groups]
```

### Actual Deployed Resources Inventory

#### IAM Identity and Access Management
- **Users**: 11111, ak1880@students.waikato.ac.nz, dean.mason@waikato.ac.nz
- **Roles**:
  - gdelt-api-role, gdelt-api-role-1moc88uh (API access)
  - gdelt-indexer-role (index processing)
  - gdelt-lambda-role (Lambda execution)
  - gdelt-backfill-to-processed-role (data processing)
  - Project-Admin, Project-Developer, Project-Viewer (project management)
- **Policies**:
  - OpenSearchAccessPolicy, worldsense-os-dev-all-write
  - gdelt_lambda_combined, gdelt-api-os-http-minimal
  - ProjectViewerPolicy, ProjectDeveloperPolicy

#### Network and Security Configuration
- **VPC**: vpc-017bc7b7189ac581e (172.31.0.0/16, default VPC)
- **Security Groups**: launch-wizard-1 (sg-01514dd25e0d2689a), default (sg-0263b38fead525b65)

#### S3 Storage Architecture
- **Data Buckets**:
  - gdelt-processed-worldsense (processed data storage)
- **Frontend Bucket**: my-worldsense-bucket (CloudFront origin)
- **Log Bucket**: aws-cloudtrail-logs-810731468776-c013728b

#### OpenSearch Service
- **Domain**: worldsense-gdelt-os-dev
- **Cluster Configuration**: 2 x t3.small.search data nodes, Single AZ cost optimized
- **Storage**: 10GB GP3 EBS, 3000 IOPS, 125 MB/s throughput
- **Dedicated Master Nodes**: 2 x t3.small.search
- **Access Policy**: Open to all principals (development environment)

#### Lambda Functions
- **gdelt-api** (Python 3.13): Main API function (512MB, 15s)
- **gdelt-indexer** (Python 3.13): Data indexing processing (1024MB, 300s)
- **gdelt-fetch-clean** (Python 3.13): Scheduled fetch & clean (512MB, 300s)
- Legacy: **data-expander-2015** (Node.js 18.x): 2015 data expansion

#### API Gateway
- **HTTP API**: worldsense-gdelt-api (ID: 82z3xjob1g)
- **Routes**: GET /search, GET /map, GET /stats
- **Legacy REST API**: gdelt-api (ID: sqeg4ixx58)

#### CloudFront Distribution
- **Distribution ID**: E3MJ8UIOB3UH8Q
- **Domain**: d7hwjrg2pdpoj.cloudfront.net
- **Origin**: my-worldsense-bucket.s3.us-east-1.amazonaws.com

#### Cognito User Authentication
- **User Pool**: worldsense-users (ID: us-east-1_Wfn3se9zs)

#### EventBridge
- **Rule**: GDELTFetchEvery15min (ENABLED, rate(15 minutes))

#### Secrets Manager
- **Secret**: opensearch/worldsense/indexer

#### CloudWatch Monitoring
- **Alarms**: billing alert (billing monitoring)
- **Log Groups**: /aws/lambda/* (all Lambda function logs)

## Deployment and Configuration

### Prerequisites
- AWS CLI installed and configured
- Appropriate IAM permissions
- Node.js and Python runtimes

### Environment Variables
- `AWS_REGION`: AWS region
- `AWS_ACCOUNT_ID`: AWS account ID
- `ENVIRONMENT`: Environment identifier

## Security Considerations

### Current Configuration Status ✅
- ✅ IAM least privilege principle (multiple dedicated roles)
- ✅ VPC network isolation (default VPC configuration)
- ✅ CloudTrail audit logs enabled
- ✅ Multi-factor authentication (MFA) support

### Security Improvement Recommendations 🚨
- **High Priority**:
  - OpenSearch access policy is too open (currently allows all principals access)
  - IP-based access control or VPC endpoints recommended
  - S3 bucket encryption configuration verification needed
- **Medium Priority**:
  - AWS Config rules for continuous compliance monitoring
  - AWS WAF for API Gateway protection
  - Secrets Manager replacement for plaintext credentials

## Monitoring and Alerting

### Current Configuration 📊
- ✅ CloudWatch metrics and logs (basic configuration)
- ❌ X-Ray distributed tracing (not configured)
- ❌ Auto scaling configuration (Lambda without reserved concurrency)

### Monitoring Improvement Recommendations 📈
- Comprehensive CloudWatch monitoring dashboard
- Critical metric alert settings (Lambda error rates, latency, etc.)
- X-Ray implementation for distributed tracing
- CloudWatch Logs metric filters

## Cost Optimization

### Current Configuration Analysis 📊
- **OpenSearch**: Single AZ cost optimized configuration, instance types optimized
- **Lambda**: On-demand execution, no reserved concurrency
- **S3**: Standard storage, no lifecycle policies configured
- **CloudFront**: Global CDN, cache policies need optimization

### Cost Optimization Progress ✅
- **Completed**:
  - OpenSearch data node downgrade: `r7g.large` → `r6g.large` → `m6g.large` → `t3.small` (savings ~\$125/month)
  - OpenSearch master node downgrade: `m7g.large` → `m6g.large` → `t3.small` (savings ~\$138/month)
  - Disabled Multi-AZ with Standby for low-cost instance support
  - Autotune disabled for optimization
  - Storage optimization: 20GB → 10GB GP3 (savings ~\$5/month)
  - Index data volume confirmed: `gdelt-lab-v1` only 10,000 documents
  - **Discovered 5 external AWS accounts with cross-account access permissions**
  - **Fixed Project-Developer role API Gateway permission issue**
  - **Added complete project role access permissions for owner account (810731468776)**
  - **Established complete GitHub Actions CI/CD automated deployment pipeline**
  - Current monthly cost: ~\$240 (original ~\$1,061)
  - Savings ratio: 77.4% (~\$821/month)

### Cost Optimization Recommendations 💰
- **Immediate Implementation**:
  - S3 lifecycle policy configuration (intelligent tiered storage)
  - Lambda reserved concurrency settings to control cold start costs
  - CloudFront cache optimization and compression
- **Medium-term Optimization**:
  - Evaluate 2-node reduction (additional savings ~\$213/month)
  - Consider further downgrade to m6g.large (savings ~\$74/month)
  - Auto-scaling strategy implementation
  - Performance verification after optimization

## Development Guide

### Local Development
1. Clone the project
2. Install dependencies
3. Configure AWS credentials
4. Run tests

## GitHub Automated Deployment 🚀

### Deployment Process
1. **GitHub Actions CI/CD** - Automated testing and deployment
2. **Infrastructure as Code Deployment** - Terraform automated configuration
3. **Lambda Function Updates** - Automated code deployment
4. **Frontend Resource Upload** - S3 static resource synchronization
5. **Configuration Verification** - Automated system testing

### GitHub Actions Workflow

The project has a complete CI/CD pipeline configured:

- Automatic testing (test-system.sh)
- Security scanning
- Multi-environment deployment (dev/staging/prod)
- Deployment verification

#### Workflow Triggers
- **Push to main**: Automatic production environment deployment
- **Push to develop**: Automatic development environment deployment
- **Pull Request**: Run testing validation
- **Manual Trigger**: Support environment selection for deployment

#### Deployment Environments
- **Development**: develop branch → dev environment
- **Staging**: staging branch → staging environment
- **Production**: main branch → prod environment

### Deployment Scripts

#### Automated Deployment Script (`scripts/deploy.sh`)

```bash
# Usage
./scripts/deploy.sh prod      # Production environment deployment
./scripts/deploy.sh dev       # Development environment deployment
```

**Deployment Process**:
1. AWS configuration verification
2. Lambda function code updates
3. Frontend resource synchronization to S3
4. API Gateway configuration check
5. System function testing validation

#### Environment Configuration (`scripts/config.env`)

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=810731468776

# Resource Identifiers
FRONTEND_BUCKET=my-worldsense-bucket
API_FUNCTION_NAME=gdelt-api
OPENSEARCH_DOMAIN=worldsense-gdelt-os-dev
```

### Infrastructure as Code

#### Terraform Configuration (`infrastructure/terraform/`)
- **main.tf**: Core infrastructure definition
- **Existing resource references**: Avoid duplicate creation
- **Modular design**: Extensible architecture

#### Deployment Commands

```bash
# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

### GitHub Secrets Configuration

Configure the following Secrets in GitHub repository settings:

```bash
# Production Environment
AWS_ACCESS_KEY_ID          # Production AWS Access Key
AWS_SECRET_ACCESS_KEY      # Production AWS Secret Key

# Development Environment (Optional)
AWS_ACCESS_KEY_ID_DEV      # Development AWS Access Key
AWS_SECRET_ACCESS_KEY_DEV  # Development AWS Secret Key
```

### Local Development Deployment Process
1. **Clone Repository**
2. **Local Testing**
3. **Manual Deployment** (if needed)
4. **Submit Changes**

   ```bash
   git commit -m "deployment description"
   git push origin main  # Triggers automatic deployment
   ```

### Deployment Monitoring

#### CloudWatch Alerts
- Deployment status monitoring
- Performance metric alerts
- Error rate monitoring

#### Deployment Logs
- GitHub Actions logs
- System testing reports

### Troubleshooting

#### Common Issues
1. **AWS Credential Errors**: Check GitHub Secrets configuration
2. **Test Failures**: View detailed logs for issue location
3. **Deployment Timeouts**: Check network connection and resource status

#### Rollback Strategy
- Automatic rollback of failed deployments
- Keep last 3 deployment versions
- Manual rollback operation triggering

### Architecture Validation Tests

#### Quick Test Script
Run automated testing scripts to verify system integrity:

```bash
# Run complete system testing
./test-system.sh

# Or manually verify core components
curl -I https://d7hwjrg2pdpoj.cloudfront.net  # Frontend access test
curl "https://82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod/search"  # HTTP API test
curl https://sqeg4ixx58.execute-api.us-east-1.amazonaws.com/prod  # Legacy REST API
```

#### Detailed Manual Verification Commands

**AWS CLI Verification**:

```bash
# Verify AWS CLI connection
aws sts get-caller-identity

# Check all core service statuses
aws lambda list-functions --region us-east-1
aws opensearch describe-domains --region us-east-1
aws s3 ls --region us-east-1

# Verify S3 bucket access
aws s3 ls s3://my-worldsense-bucket
```

**System Access Addresses**:
- **Frontend Application**: https://d7hwjrg2pdpoj.cloudfront.net
- **API Endpoint**: https://82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod (HTTP API v2.0)
- **Backup REST API**: https://sqeg4ixx58.execute-api.us-east-1.amazonaws.com/prod (REST API v1.0)

## Front-end and Back-end Project Detailed Architecture Analysis

### 🎯 Project Overview
WorldSense-GDELT is a global event perception and analysis platform built on AWS, using GDELT datasets to provide real-time event monitoring and visualization services.

### 🖥️ Frontend Architecture (CloudFront + S3)

**Distribution Configuration (E3MJ8UIOB3UH8Q)**:
- **Domain**: `d7hwjrg2pdpoj.cloudfront.net`
- **Origin**: `my-worldsense-bucket.s3.us-east-1.amazonaws.com`
- **Default Root Object**: `index.html`
- **Cache Policy**: `658327ea-f89d-4fab-a63d-7e88639e58f6`
- **Allowed Methods**: HEAD, GET, OPTIONS
- **Redirect Policy**: HTTP → HTTPS
- **Error Pages**: 403/404 → `/index.html` (SPA routing support)
- **Compression**: Enabled
- **Price Class**: PriceClass_All (global coverage)

**Frontend Resource Structure**:

```
frontend/
├── index.html (main page)
├── assets/
│   ├── index-v3.0-CEYIod4a.js (main app JS)
│   ├── vendor-v3.0-CNkaGmpG.js (third-party libraries)
│   ├── leaflet-v3.0-CcbFxbU7.js (mapping library)
│   └── index-v3.0-B6lqBTfR.css (styles)
```

### 🌐 API Gateway Architecture

**Main API Configuration (82z3xjob1g)**:
- **Name**: worldsense-gdelt-api
- **Type**: HTTP API v2.0 (high performance)
- **Endpoint**: `https://82z3xjob1g.execute-api.us-east-1.amazonaws.com/prod`
- **Protocol**: HTTP/2 + WebSocket support
- **Authentication**: None (public access)
- **Routes**: GET /search, GET /map, GET /stats
- **Integration**: AWS_PROXY (direct proxy to Lambda)
- **Payload Format**: 2.0 (modern event format)

**Backup REST API (sqeg4ixx58)**:
- **Name**: gdelt-api
- **Type**: REST API v1.0 (EDGE optimized)
- **Endpoint**: `https://sqeg4ixx58.execute-api.us-east-1.amazonaws.com/prod`
- **Protocol**: HTTP/1.1
- **Authentication**: None (public access)
- **Resources**: /search, /map, /stats
- **Integration**: AWS_PROXY (direct proxy to Lambda)

**Route Configuration**:
- **Path**: `/*` (wildcard routing)
- **Method**: ANY (supports all HTTP methods)
- **Integration Type**: AWS_PROXY
- **Lambda Function**: `gdelt-api`
- **Timeout**: 29 seconds

### 🔍 OpenSearch Search Engine

**Cluster Configuration (worldsense-gdelt-os-dev)**:
- **Endpoint**: `search-worldsense-gdelt-os-dev-tfuw6rzu5dpjqqjfhsjy3lszxa.us-east-1.es.amazonaws.com`
- **Version**: OpenSearch 2.19
- **Instance Type**: t3.small.search
- **Instance Count**: 2 data nodes
- **Availability Zone**: Single AZ (cost optimized)
- **Dedicated Master Nodes**: 2 x t3.small.search
- **Storage**: 10GB GP3 EBS (IOPS: 3000, Throughput: 125MB/s)
- **Encryption**: Enabled (KMS + node-to-node encryption)
- **Auto-Tune**: Disabled (cost optimized)
- **Access Policy**: Open to all principals (development environment)

**Index Configuration**:
- **Primary Index**: `gdelt-events` (gdelt-indexer)
- **Alias**: `gdelt-lab-v1` (gdelt-api)

### ⚡ Lambda Function Ecosystem

#### 1. **gdelt-api** (Python 3.13)
- **Purpose**: Main API processing function
- **Memory**: 512MB
- **Timeout**: 15 seconds
- **Environment Variables**:
  - `OPENSEARCH_SECRET_NAME`: opensearch/worldsense/indexer
  - `INDEX_ALIAS`: gdelt-lab-v1
- **Role**: gdelt-api-role

#### 2. **gdelt-indexer** (Python 3.13)
- **Purpose**: Data indexing processing
- **Memory**: 1024MB
- **Timeout**: 300 seconds (5 minutes)
- **Environment Variables**:
  - `PROC_PREFIX`: processed/
  - `INDEX_NAME`: gdelt-events
  - `PROC_BUCKET`: gdelt-processed-worldsense
  - `OPENSEARCH_SECRET_NAME`: opensearch/worldsense/indexer
  - `LOG_LEVEL`: DEBUG
- **Role**: gdelt-indexer-role

#### 3. **gdelt-fetch-clean** (Python 3.13)
- **Purpose**: Scheduled fetch and clean (EventBridge every 15 minutes)
- **Memory**: 512MB
- **Timeout**: 300 seconds
- **Environment Variables**:
  - `PROC_BUCKET`: gdelt-processed-worldsense
  - `OPENSEARCH_SECRET_NAME`: opensearch/worldsense/indexer
- **Role**: gdelt-lambda-role

#### Legacy: **data-expander-2015** (Node.js 18.x)
- Exists in account; not used by current pipeline

### 📊 Data Flow Architecture

```
Data Processing → Lambda (gdelt-fetch-clean)
    ↓
Index Building → Lambda (gdelt-indexer)
    ↓
Search Index → OpenSearch (gdelt-events)
    ↓
API Query → Lambda (gdelt-api)
    ↓
Frontend Display → CloudFront + S3 (SPA)
```

### 🔐 Security Configuration

**Access Control**:
- OpenSearch: Currently open access (⚠️ production environment improvement needed)
- API Gateway: No authentication (public API)
- S3 Bucket: Through CloudFront Origin Access Control

**Encryption**:
- ✅ OpenSearch: KMS encryption + node-to-node encryption
- ✅ Lambda: Environment variable encryption storage
- ✅ CloudFront: HTTPS redirection

### 📈 Performance Configuration

**CloudFront Optimization**:
- Global CDN coverage
- Automatic compression
- SPA routing support (error page redirection)

**Lambda Optimization**:
- Python 3.13 / Node.js 18.x runtime
- Moderate memory allocation (512MB-1024MB)
- Reasonable timeout settings

**OpenSearch Optimization**:
- High-performance t3 instances
- GP3 high IOPS storage
- Auto-Tune disabled (cost optimization)

### 📋 Project Documentation

- **[PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)** - Complete English project documentation with all details from user assignment to deployment maintenance
- **Diagrams (Mermaid)**:
  - `doc/diagrams/ARCHITECTURE.mmd`
  - `doc/diagrams/DATA_PIPELINE.mmd`
  - `doc/diagrams/SEQUENCE_API_SEARCH.mmd`
  - `doc/diagrams/SECURITY_OVERVIEW.mmd`

---

## Change Log

### v0.1.2 (2025-10-01) - AWS Services Inventory and Shutdown Documentation

* ✅ **OpenSearch Domain (worldsense-gdelt-os-dev) - CONFIRMED FULLY DELETED**
* ✅ **Updated service shutdown status in documentation**

#### 📋 Current Active AWS Services Inventory

**Storage Services:**
- **S3 Buckets** (3 total):
  - `aws-cloudtrail-logs-810731468776-c013728b` - CloudTrail audit logs
  - `gdelt-processed-worldsense` - Processed GDELT data storage
  - `my-worldsense-bucket` - Frontend application hosting

**Compute Services:**
- **Lambda Functions** (4 total):
  - `gdelt-fetch-clean` - Data fetching and cleaning (Python 3.13, 512MB)
  - `gdelt-indexer` - Data indexing to OpenSearch (Python 3.13, 1024MB)
  - `data-expander-2015` - 2015 data expansion (Node.js 18.x, 1024MB)
  - `gdelt-api` - Main API endpoint (Python 3.13, 512MB)

**Database & Search Services:**
- **OpenSearch Domain** (1 total):
  - `worldsense-gdelt-os-dev` - GDELT data search engine (t3.small x3 nodes, 10GB GP3)

**API & Integration Services:**
- **API Gateway HTTP API** (1 total):
  - `worldsense-gdelt-api` (ID: 82z3xjob1g) - REST API for frontend integration

**Content Delivery Services:**
- **CloudFront Distribution** (1 total):
  - `E3MJ8UIOB3UH8Q` - Global CDN (d7hwjrg2pdpoj.cloudfront.net)

**Authentication Services:**
- **Cognito User Pool** (1 total):
  - `worldsense-users` (ID: us-east-1_Wfn3se9zs) - User authentication

**Monitoring Services:**
- **CloudWatch Alarms** (1 total):
  - `billing alert` - Cost monitoring alarm ($3 threshold)

**Identity & Access Management:**
- **IAM Roles** (8 total):
  - `gdelt-api-role`, `gdelt-api-role-1moc88uh` - API access roles
  - `gdelt-indexer-role` - Data indexing role
  - `gdelt-lambda-role` - Lambda execution role
  - `gdelt-backfill-to-processed-role` - Data processing role
  - `Project-Admin`, `Project-Developer`, `Project-Viewer` - Project management roles
- **IAM Users** (3 total):
  - `11111`, `ak1880@students.waikato.ac.nz`, `dean.mason@waikato.ac.nz`

**Network Services:**
- **Security Groups** (2 total):
  - `launch-wizard-1` (sg-01514dd25e0d2689a)
  - `default` (sg-0263b38fead525b65)

#### 🚨 Services Shutdown Plan (In Progress)

*Services will be shut down in reverse dependency order to avoid conflicts*

**✅ Completed Shutdowns:**
- **CloudFront Distribution**: `E3MJ8UIOB3UH8Q` - Disabled (deletion pending)
- **API Gateway HTTP API**: `worldsense-gdelt-api` (ID: 82z3xjob1g) - Deleted
- **Lambda Functions** (4 total): All deleted
  - `gdelt-fetch-clean` ✅
  - `gdelt-indexer` ✅
  - `data-expander-2015` ✅
  - `gdelt-api` ✅
- **OpenSearch Domain**: `worldsense-gdelt-os-dev` - Deletion in progress
- **Cognito User Pool**: `worldsense-users` (ID: us-east-1_Wfn3se9zs) - Deleted
- **CloudWatch Alarms**: `billing alert` - Deleted
- **IAM Roles**: Partial progress
  - `gdelt-api-role` ✅ (policies detached and deleted)

**⚠️ Partial Completion Status:**

*Major services have been successfully shut down. Remaining cleanup requires manual intervention due to versioning complexities.*

**✅ Successfully Shut Down:**
- CloudFront Distribution (disabled, pending final deletion)
- API Gateway HTTP API
- All Lambda Functions (4 total)
- **OpenSearch Domain (worldsense-gdelt-os-dev) - ✅ FULLY DELETED**
- Cognito User Pool
- CloudWatch Alarms
- Partial IAM Role cleanup

**❌ Remaining Services (Require Manual Cleanup):**
- **S3 Buckets** (3 total): Complex version cleanup needed
  - `my-worldsense-bucket` - Frontend hosting (versioned objects)
  - `gdelt-processed-worldsense` - Data storage
  - `aws-cloudtrail-logs-810731468776-c013728b` - CloudTrail logs
- **IAM Resources** (8 roles, 3 users): Policy detachment required
- **Security Groups** (2 total): System default groups

**💡 Cleanup Recommendations:**
1. Use AWS Console for S3 bucket version cleanup (delete all versions and delete markers)
2. Manually detach policies from remaining IAM roles before deletion
3. System default security groups cannot be deleted but are harmless

**💰 Billing Appeal Resources:**
4. **AWS Billing Appeal Email Template** (`aws_billing_appeal_email.txt`) - Professional appeal letter for unexpected OpenSearch charges

### v0.1.1 (2025-09-27) - Frontend Code Update and GitHub Deployment

* ✅ Merged remote repository changes with local frontend modifications
* ✅ Resolved README.md merge conflict preserving comprehensive documentation
* ✅ Updated frontend components (App.jsx, AppFinal.jsx) and dependencies
* ✅ Successful GitHub repository synchronization
* ✅ Verified frontend build process and code compilation
* ✅ Maintained all existing AWS infrastructure and backend services

### v0.1.0 (2025-09-27) - Initial Project Setup and Complete AWS Architecture

* ✅ Complete AWS architecture implementation with 9 core services
* ✅ IAM identity and access management with cross-account roles
* ✅ S3 storage architecture for frontend and data
* ✅ OpenSearch Service cluster with cost optimization (77.4% savings)
* ✅ Lambda function ecosystem (4 functions)
* ✅ API Gateway with HTTP and REST API configurations
* ✅ CloudFront global CDN distribution
* ✅ Cognito user authentication system
* ✅ CloudWatch monitoring and alerting
* ✅ GitHub Actions CI/CD automated deployment pipeline
* ✅ Terraform infrastructure as code templates
* ✅ Complete English documentation and project setup
* ✅ Cost optimization: \$1,061/month → \$240/month (77.4% reduction)

---

*Version: 0.1.2 | Last updated: 2025-10-01 | AWS Account: 810731468776 | Region: us-east-1*

