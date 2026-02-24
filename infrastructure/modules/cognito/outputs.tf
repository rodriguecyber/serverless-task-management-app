output "user_pool_arn" {
  value = aws_cognito_user_pool.task_user_pool.arn
}
output "user_pool_id" {
  value = aws_cognito_user_pool.task_user_pool.id
}
output "app_client_id" {
  value = aws_cognito_user_pool_client.task_user_pool_client.id
}