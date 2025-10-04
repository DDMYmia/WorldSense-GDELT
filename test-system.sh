#!/bin/bash

# WorldSense-GDELT System Test Script
# Used to verify the integrity and functionality of front-end and back-end architecture

echo "🚀 WorldSense-GDELT system testing starting"
echo "Time: $(date)"
echo "========================================"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local command="$2"
    
    ((TOTAL_TESTS++))
    echo -n "Test: $test_name ... "
    
    if eval "$command" &>/dev/null; then
        echo -e "${GREEN}✓ Passed${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
}

echo "1. Frontend Resources Test (CloudFront + S3)"

# Test CloudFront distribution status
run_test "CloudFront Distribution Status" "aws cloudfront get-distribution --id E3MJ8UIOB3UH8Q --profile 810731468776 --region us-east-1 | jq -e '.Distribution.Status == \"Deployed\"'"

# Test frontend S3 bucket access
run_test "Frontend S3 Bucket Access" "aws s3 ls s3://my-worldsense-bucket/index.html --profile 810731468776"

# Test frontend resource integrity
run_test "Frontend Resource Integrity" "aws s3 ls s3://my-worldsense-bucket/assets/ --profile 810731468776 | wc -l | grep -q '4'"

echo ""
echo "2. API Gateway Test"

# HTTP API (v2) existence and routes
run_test "HTTP API Existence (v2)" "aws apigatewayv2 get-api --api-id 82z3xjob1g --profile 810731468776 --region us-east-1"
run_test "HTTP API Routes (v2)" "aws apigatewayv2 get-routes --api-id 82z3xjob1g --profile 810731468776 --region us-east-1 | jq -e '.Items | length > 0'"

# Legacy REST API (v1)
run_test "Legacy REST API Existence (v1)" "aws apigateway get-rest-api --rest-api-id sqeg4ixx58 --profile 810731468776 --region us-east-1"
run_test "Legacy REST API Stage (v1)" "aws apigateway get-stage --rest-api-id sqeg4ixx58 --stage-name prod --profile 810731468776 --region us-east-1"

echo ""
echo "3. Lambda Functions Test"

# Test Lambda function existence
run_test "gdelt-api Lambda Function" "aws lambda get-function --function-name gdelt-api --profile 810731468776 --region us-east-1"
run_test "gdelt-indexer Lambda Function" "aws lambda get-function --function-name gdelt-indexer --profile 810731468776 --region us-east-1"
run_test "data-expander-2015 Lambda Function" "aws lambda get-function --function-name data-expander-2015 --profile 810731468776 --region us-east-1"

echo ""
echo "4. OpenSearch Test"

# Test OpenSearch cluster status
run_test "OpenSearch Cluster Configuration" "aws opensearch describe-domain --domain-name worldsense-gdelt-os-dev --profile 810731468776 --region us-east-1 | jq -e '.DomainStatus != null'"

echo ""
echo "5. Data Storage Test"

# Test data S3 buckets
run_test "Raw Data S3 Bucket" "aws s3 ls s3://gdelt-raw-worldsense --profile 810731468776"
run_test "Processed Data S3 Bucket" "aws s3 ls s3://gdelt-processed-worldsense --profile 810731468776"

# Test processed data files (allow empty but path exists)
run_test "Processed Prefix Exists" "aws s3 ls s3://gdelt-processed-worldsense/processed/ --profile 810731468776 >/dev/null 2>&1"

echo ""
echo "6. IAM and Security Test"

# Test critical IAM roles
run_test "gdelt-api-role Existence" "aws iam get-role --role-name gdelt-api-role --profile 810731468776"
run_test "gdelt-indexer-role Existence" "aws iam get-role --role-name gdelt-indexer-role --profile 810731468776"

echo ""
echo "7. Cognito Test"

# Test Cognito user pool
run_test "Cognito User Pool Configuration" "aws cognito-idp describe-user-pool --user-pool-id us-east-1_Wfn3se9zs --profile 810731468776 --region us-east-1"

echo ""
echo "8. CloudWatch Monitoring Test"

# Test CloudWatch log groups
run_test "Lambda Log Groups Existence" "aws logs describe-log-groups --log-group-name-prefix /aws/lambda/gdelt --profile 810731468776 --region us-east-1 | jq '.logGroups | length > 0'"

echo ""
echo "📊 Test Results Summary"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

if [ "$SUCCESS_RATE" -eq 100 ]; then
    echo -e "${GREEN}🎉 All tests passed! System running normally${NC}"
elif [ "$SUCCESS_RATE" -ge 75 ]; then
    echo -e "${YELLOW}⚠️  Most tests passed ($PASSED_TESTS/$TOTAL_TESTS), system basically normal${NC}"
else
    echo -e "${RED}❌ Too many test failures ($PASSED_TESTS/$TOTAL_TESTS), please check system configuration${NC}"
fi

echo ""
echo "Pass Rate: $SUCCESS_RATE% ($PASSED_TESTS/$TOTAL_TESTS)"
echo ""
echo "🔍 Detailed Check Suggestions:"
echo "- Check CloudWatch Logs for detailed error information"
echo "- Verify API Gateway endpoint response: https://sqeg4ixx58.execute-api.us-east-1.amazonaws.com/prod"
echo "- Check frontend access: https://d7hwjrg2pdpoj.cloudfront.net"
echo ""
echo "✨ WorldSense-GDELT system testing completed"
