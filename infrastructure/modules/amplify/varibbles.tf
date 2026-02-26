variable "github_token" {
  description = "GitHub token for authentication"
  type        = string
  
}

variable "repository_url" {
  description = "URL of the GitHub repository"
  type        = string
  
}
variable "api_base_url" {
  description = "Base URL of the API Gateway"
  type        = string
  
}
variable "user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
  
}
variable "app_client_id" {
  description = "Cognito App Client ID"
  type        = string
  
}
