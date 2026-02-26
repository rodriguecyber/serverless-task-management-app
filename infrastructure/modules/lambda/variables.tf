    variable "lambda_role_arn" {
        description = "The ARN of the IAM role for the Lambda function"
        type        = string
    
    }
    variable "cognito_user_pool_arn" {
    
    }

    variable "task_table_name" {
    
    }
    variable "api_gateway_id" {
    
    }

    variable "authorizer_id" {
    
    }

    variable "api_gateway_execution_arn" {
    }

    variable "user_pool_id" {
      description = "Cognito User Pool ID for list_users Lambda"
      type        = string
    }