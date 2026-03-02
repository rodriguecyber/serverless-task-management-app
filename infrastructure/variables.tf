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

variable "seed_admin_username" {
  description = "Username  for seed admin user. Set with seed_admin_temp_password to create an admin on apply."
  type        = string
  default     = ""
}

variable "seed_admin_temp_password" {
  description = "Temporary password for seed admin (min 8 chars, upper, lower, number, symbol). Sensitive."
  type        = string
  default     = ""
  sensitive   = true
}
