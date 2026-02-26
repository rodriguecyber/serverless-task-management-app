resource "aws_lambda_function" "list_users" {
  function_name   = "task-management-list-users"
  handler         = "list_users.handler"
  runtime         = "nodejs20.x"
  role            = var.lambda_role_arn
  filename        = "${path.root}/../backend/dist/list_users.zip"
  source_code_hash = filebase64sha256("${path.root}/../backend/dist/list_users.zip")
  memory_size     = 128
  timeout         = 10

  environment {
    variables = {
      USER_POOL_ID = var.user_pool_id
    }
  }
}

resource "aws_apigatewayv2_integration" "list_users_integration" {
  api_id             = var.api_gateway_id
  integration_type   = "AWS_PROXY"
  integration_uri     = aws_lambda_function.list_users.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "list_users_route" {
  api_id             = var.api_gateway_id
  route_key          = "GET /users"
  target             = "integrations/${aws_apigatewayv2_integration.list_users_integration.id}"
  authorizer_id      = var.authorizer_id
  authorization_type = "JWT"
}

resource "aws_lambda_permission" "list_users_permission" {
  statement_id   = "AllowAPIGatewayInvoke"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.list_users.function_name
  principal      = "apigateway.amazonaws.com"
  source_arn     = "${var.api_gateway_execution_arn}/*/*"
}
