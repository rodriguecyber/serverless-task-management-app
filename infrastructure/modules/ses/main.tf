# Sender (From): must be verified to send. SES sends a verification email; click the link to verify.
resource "aws_ses_email_identity" "notify_sender" {
  count  = length(var.sender_email) > 0 ? 1 : 0
  email  = var.sender_email
}

# Sandbox: recipients must be verified to receive. Create an identity for each; each gets a verification email.
resource "aws_ses_email_identity" "recipients" {
  count  = length(var.recipient_emails)
  email  = var.recipient_emails[count.index]
}
