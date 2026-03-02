output "sender_email" {
  value       = length(var.sender_email) > 0 ? var.sender_email : null
  description = "The email identity created (must be verified via the link SES sends)."
}
