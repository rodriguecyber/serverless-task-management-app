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
  description = "SES sender (From) email. Terraform creates this identity; verify via the link SES sends."
  type        = string
  default     = ""
}

variable "ses_verified_recipient_emails" {
  description = "List of emails that may receive notifications (SES sandbox: each must be verified). Include admins and any assignees. Each gets a verification email on apply."
  type        = list(string)
  default     = ["rodrigue.rwigara@amalitech.com","rodrigue.rwigara@amalitechtraining.org"]
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


 