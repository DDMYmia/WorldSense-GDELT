#!/bin/bash

# WorldSense-GDELT Deployment Validation Script
# Used to verify if GitHub Actions deployment is successful

set -e

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check GitHub Actions status
check_github_actions() {
    log_info "Checking GitHub Actions workflow status..."
    
    # GitHub API calls can be added here to check Actions status
    # Temporarily using local validation
    if [ -f ".github/workflows/deploy.yml" ]; then
        log_info "✅ GitHub Actions workflow file exists"
    else
        log_error "❌ GitHub Actions workflow file does not exist"
        return 1
    fi
}

# Check deployment scripts
check_deployment_scripts() {
    log_info "Checking deployment scripts..."
    
    if [ -x "scripts/deploy.sh" ]; then
        log_info "✅ Deployment script exists and is executable"
    else
        log_error "❌ Deployment script does not exist or is not executable"
        return 1
    fi
    
    if [ -f "scripts/config.env" ]; then
        log_info "✅ Environment configuration file exists"
    else
        log_warning "⚠️ Environment configuration file does not exist"
    fi
}

# Check infrastructure code
check_infrastructure() {
    log_info "Checking infrastructure code..."
    
    if [ -f "infrastructure/terraform/main.tf" ]; then
        log_info "✅ Terraform configuration exists"
    else
        log_warning "⚠️ Terraform configuration does not exist"
    fi
}

# Validate AWS resource status
validate_aws_resources() {
    log_info "Validating AWS resource status..."
    
    # Check AWS CLI configuration
    if ! aws sts get-caller-identity &>/dev/null; then
        log_error "❌ AWS CLI not properly configured"
        return 1
    fi
    
    # Check critical resources
    if aws lambda get-function --function-name gdelt-api --region us-east-1 --profile 810731468776 &>/dev/null; then
        log_info "✅ Lambda function exists"
    else
        log_error "❌ Lambda function does not exist"
        return 1
    fi
    
    if aws s3 ls s3://my-worldsense-bucket --profile 810731468776 &>/dev/null; then
        log_info "✅ S3 bucket exists"
    else
        log_error "❌ S3 bucket does not exist"
        return 1
    fi
}

# Main function
main() {
    echo "🚀 WorldSense-GDELT deployment validation starting"
    echo "=================================="
    
    local errors=0
    
    check_github_actions || ((errors++))
    check_deployment_scripts || ((errors++))
    check_infrastructure || ((errors++))
    validate_aws_resources || ((errors++))
    
    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 All validations passed! Deployment configuration is correct${NC}"
        echo ""
        echo "📋 Next steps:"
        echo "1. Configure AWS Secrets in GitHub repository settings"
        echo "2. Push code to main branch to trigger automatic deployment"
        echo "3. Monitor GitHub Actions execution status"
        echo "4. Check CloudWatch to confirm deployment success"
    else
        echo -e "${RED}❌ Found $errors configuration issues, please fix and retry${NC}"
        exit 1
    fi
}

main "$@"
