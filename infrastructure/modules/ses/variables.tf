variable "sender_email" {
  description = "Email address to verify in SES (used as notification sender). Leave empty to skip. SES will send a verification email to this address."
  type        = string
  default     = ""
}
