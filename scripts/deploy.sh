#!/bin/bash

# WorldSense-GDELT Automated Deployment Script
# Usage: ./scripts/deploy.sh [environment]

set -e  # Exit immediately on error

ENVIRONMENT=${1:-"prod"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check AWS CLI configuration
check_aws_config() {
    log_info "Checking AWS configuration..."
    
    if ! aws sts get-caller-identity &>/dev/null; then
        log_error "AWS CLI not properly configured or credentials invalid"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    REGION=$(aws configure get region)
    REGION=${REGION:-us-east-1}
    
    log_success "AWS configuration verified - Account: $ACCOUNT_ID, Region: $REGION"
}

# Deploy Lambda functions
deploy_lambda_functions() {
    log_info "Deploying Lambda functions..."
    
    # Deploy gdelt-api function
    if [ -f "$PROJECT_ROOT/src/lambda/lambda_function.py" ]; then
        log_info "Updating gdelt-api Lambda function..."
        cd "$PROJECT_ROOT/src/lambda"
        zip -r lambda_deploy.zip . 2>/dev/null || true
        
        if [ -f "lambda_deploy.zip" ]; then
            aws lambda update-function-code \
                --function-name gdelt-api \
                --zip-file fileb://lambda_deploy.zip \
                --region us-east-1 \
                --profile 810731468776
            log_success "gdelt-api function update completed"
        else
            log_warning "Lambda code file not found, skipping update"
        fi
    fi
    
    # Deploy data-expander function
    if aws lambda get-function --function-name data-expander-2015 --region us-east-1 --profile 810731468776 &>/dev/null; then
        log_info "Checking data-expander-2015 function status..."
        # Update logic can be added here
    fi
}

# Deploy frontend resources
deploy_frontend() {
    log_info "Deploying frontend resources..."
    
    if [ -d "$PROJECT_ROOT/src/frontend" ] && [ "$(ls -A "$PROJECT_ROOT/src/frontend" 2>/dev/null)" ]; then
        log_info "Uploading frontend resources to S3..."
        aws s3 sync "$PROJECT_ROOT/src/frontend" s3://my-worldsense-bucket \
            --delete \
            --region us-east-1 \
            --profile 810731468776
        log_success "Frontend resources deployment completed"
    else
        log_warning "Frontend resource directory not found, skipping deployment"
    fi
}

# Update API Gateway
update_api_gateway() {
    log_info "Checking API Gateway configuration..."
    
    # Check if API Gateway exists
    if aws apigateway get-rest-api --rest-api-id sqeg4ixx58 --region us-east-1 --profile 810731468776 &>/dev/null; then
        log_success "API Gateway configuration normal"
    else
        log_warning "API Gateway may need reconfiguration"
    fi
}

# Run system tests
run_system_tests() {
    log_info "Running system tests to verify deployment..."
    
    if [ -f "$PROJECT_ROOT/test-system.sh" ]; then
        chmod +x "$PROJECT_ROOT/test-system.sh"
        if "$PROJECT_ROOT/test-system.sh"; then
            log_success "System tests passed"
        else
            log_error "System tests failed"
            exit 1
        fi
    else
        log_warning "Test script not found"
    fi
}

# Main deployment process
main() {
    echo "🚀 WorldSense-GDELT automated deployment starting"
    echo "Environment: $ENVIRONMENT"
    echo "Time: $(date)"
    echo "================================="
    
    # Switch to project root directory
    cd "$PROJECT_ROOT"
    
    # Execute deployment steps
    check_aws_config
    deploy_lambda_functions
    deploy_frontend
    update_api_gateway
    run_system_tests
    
    echo ""
    log_success "🎉 Deployment completed!"
    echo "Environment: $ENVIRONMENT"
    echo "Time: $(date)"
    echo "Status: ✅ Success"
}

# Parameter validation
case "$ENVIRONMENT" in
    dev|staging|prod)
        log_info "Deployment environment: $ENVIRONMENT"
        ;;
    *)
        log_error "Invalid environment parameter: $ENVIRONMENT"
        log_info "Supported environments: dev, staging, prod"
        exit 1
        ;;
esac

# Execute main function
main "$@"
