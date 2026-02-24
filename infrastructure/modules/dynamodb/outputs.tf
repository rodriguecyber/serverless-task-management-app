output "dynamo_table_arn" {
  value = aws_dynamodb_table.task_table.arn
}