output "api_id" {
  value = aws_apigatewayv2_api.http_api.id
}

output "api_endpoint" {
  value = aws_apigatewayv2_api.http_api.api_endpoint
}

output "authorizer_id" {
  value = aws_apigatewayv2_authorizer.task_management_authorizer.id
}
output "api_gateway_execution_arn" {
  value = aws_apigatewayv2_api.http_api.execution_arn
}

