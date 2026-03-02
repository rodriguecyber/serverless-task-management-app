variable "repository_url" {
  description = "URL of the GitHub repository"
  type        = string
  default = "https://github.com/rodriguecyber/serverless-task-management-app"
}
variable "github_token" {
  description = "GitHub token for authentication"
  type        = string
}

variable "admin_emails" {
  description = "Comma-separated admin emails to notify when a task status is updated"
  type        = string
  default     = ""
}

variable "notify_from_email" {
  description = "SES-verified email address used as 'From' for notification emails (must be verified in SES)"
  type        = string
  default     = ""
}
