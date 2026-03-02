# SES verified email identity. SES sends a verification email to this address;
# the recipient must click the link to complete verification. After that, you can use it as "From".
resource "aws_ses_email_identity" "notify_sender" {
  count  = length(var.sender_email) > 0 ? 1 : 0
  email  = var.sender_email
}
