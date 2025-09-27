# WorldSense-GDELT AWS Infrastructure as Code
# Terraform configuration for automated deployment

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Recommended to configure backend storage
  # backend "s3" {
  #   bucket = "worldsense-terraform-state"
  #   key    = "terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  # Recommended to use IAM role instead of access keys
  # assume_role {
  #   role_arn = "arn:aws:iam::ACCOUNT_ID:role/TerraformDeploymentRole"
  # }
}

# Data sources for existing resources
data "aws_caller_identity" "current" {}

# S3 Buckets (existing)
data "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name
}

data "aws_s3_bucket" "data" {
  bucket = var.data_bucket_name
}

# Lambda Functions
resource "aws_lambda_function" "api" {
  function_name = var.api_function_name
  runtime       = "python3.13"
  handler       = "lambda_function.lambda_handler"
  memory_size   = 512
  timeout       = 15
  
  # Code package needs to be built first
  # filename      = "lambda.zip"
  # source_code_hash = filebase64sha256("lambda.zip")
  
  role = aws_iam_role.lambda_role.arn
  
  environment {
    variables = {
      OPENSEARCH_SECRET_NAME = "opensearch/worldsense/indexer"
      INDEX_ALIAS           = "gdelt-lab-v1"
    }
  }
  
  lifecycle {
    ignore_changes = [source_code_hash] # Updated by CI/CD
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "worldsense-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# CloudWatch Logs permission for Lambda
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# API Gateway (existing resources referenced)
data "aws_api_gateway_rest_api" "api" {
  name = "worldsense-gdelt-api"
}

# Outputs
output "lambda_function_arn" {
  value = aws_lambda_function.api.arn
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "frontend_bucket_name" {
  description = "Frontend S3 bucket name"
  type        = string
  default     = "my-worldsense-bucket"
}

variable "data_bucket_name" {
  description = "Data S3 bucket name"
  type        = string
  default     = "gdelt-processed-worldsense"
}

variable "api_function_name" {
  description = "API Lambda function name"
  type        = string
  default     = "gdelt-api"
}
