output "dynamo_table_arn" {
  value = aws_dynamodb_table.task_table.arn
}
output "dynamo_table_name" {
  value = aws_dynamodb_table.task_table.name
}