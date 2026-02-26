variable "dynamotable_arn" {
    description = "The ARN of the DynamoDB table"
    type        = string
  
}

variable "sns_topic_arn" {
    description = "The ARN of the SNS topic"
    type        = string
}

variable "cognito_user_pool_arn" {
    description = "The ARN of the Cognito User Pool (for ListUsers)"
    type        = string
}