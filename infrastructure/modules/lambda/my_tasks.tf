resource "aws_lambda_function" "my_tasks" {
  function_name   = "task-management-my-tasks"
  handler         = "my_tasks.handler"
  runtime         = "nodejs20.x"
  role            = var.lambda_role_arn
  filename        = "${path.root}/../backend/dist/my_tasks.zip"
  source_code_hash = filebase64sha256("${path.root}/../backend/dist/my_tasks.zip")
  memory_size     = 128
  timeout         = 10

  environment {
    variables = {
      TASKS_TABLE = var.task_table_name
    }
  }
}

resource "aws_apigatewayv2_integration" "my_tasks_integration" {
  api_id             = var.api_gateway_id
  integration_type   = "AWS_PROXY"
  integration_uri     = aws_lambda_function.my_tasks.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "my_tasks_route" {
  api_id             = var.api_gateway_id
  route_key          = "GET /tasks/mine"
  target             = "integrations/${aws_apigatewayv2_integration.my_tasks_integration.id}"
  authorizer_id      = var.authorizer_id
  authorization_type = "JWT"
}

resource "aws_lambda_permission" "my_tasks_permission" {
  statement_id   = "AllowAPIGatewayInvoke"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.my_tasks.function_name
  principal      = "apigateway.amazonaws.com"
  source_arn     = "${var.api_gateway_execution_arn}/*/*"
}
