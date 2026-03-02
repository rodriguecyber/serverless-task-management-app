variable "pre_signup_lambda_arn" {
  type        = string
  description = "Pre-signup Lambda ARN"
}

# Seed admin user (optional)
variable "seed_admin_username" {
  type        = string
  default     = ""
  description = "Username (e.g. email) for seed admin user. Leave empty to skip."
}

variable "seed_admin_temp_password" {
  type        = string
  default     = ""
  sensitive   = true
  description = "Temporary password for seed admin (min 8 chars, upper, lower, number, symbol). User should change on first sign-in."
}