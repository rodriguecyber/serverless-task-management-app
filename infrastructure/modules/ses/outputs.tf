output "sender_email" {
  value       = length(var.sender_email) > 0 ? var.sender_email : null
  description = "The sender identity (verify via the link SES sends)."
}

output "recipient_emails" {
  value       = var.recipient_emails
  description = "Recipient emails registered for verification (sandbox)."
}
