variable "sender_email" {
  description = "Email address to verify in SES (used as notification sender). Leave empty to skip. SES will send a verification email to this address."
  type        = string
  default     = ""
}

variable "recipient_emails" {
  description = "List of email addresses that may receive notifications (sandbox: must be verified). Each will get a verification email on apply; after they verify, they can receive task-assigned and status-update emails."
  type        = list(string)
  default     = []
}
