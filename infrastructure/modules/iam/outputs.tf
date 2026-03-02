output "lambda_role_arn" {
  value = aws_iam_role.lambda_execution_role.arn
}

output "notification_lambda_role_arn" {
  value = aws_iam_role.notification_lambda_role.arn
}