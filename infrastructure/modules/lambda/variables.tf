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
      description = "Cognito User Pool ID for list_users and assign_task Lambdas"
      type        = string
    }

    variable "notification_lambda_role_arn" {
      description = "IAM role ARN for notify_task_events Lambda (from IAM module)"
      type        = string
    }

    variable "sns_topic_arn" {
      description = "SNS topic ARN for all task notifications (assign + status update)"
      type        = string
    }

    variable "admin_emails" {
      description = "Comma-separated admin emails for status-update notifications"
      type        = string
      default     = ""
    }

    variable "notify_from_email" {
      description = "SES verified 'From' address for notification emails"
      type        = string
      default     = ""
    }