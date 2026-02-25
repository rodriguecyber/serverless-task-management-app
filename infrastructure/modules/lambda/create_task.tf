resource "aws_lambda_function" "create_task" {
  function_name = "task-management-create-task"
  handler = "create_task.handler"
  runtime = "nodejs20.x"
  role = var.lambda_role_arn
  filename = "${path.module}/../../../backend/dist/create_task.zip"
  memory_size = 128
  timeout = 10

  environment {
    variables = {
      TASK_TABLE=var.task_table_name

    }
  }
}

resource "aws_apigatewayv2_integration" "create_task_integration" {
  api_id = var.api_gateway_id
  integration_type = "AWS_PROXY"
  integration_uri = aws_lambda_function.create_task.arn
  payload_format_version = "2.0"
  
}

resource "aws_apigatewayv2_route" "create_task_route" {
  api_id = var.api_gateway_id
  route_key = "POST /tasks"
  target = "integrations/${aws_apigatewayv2_integration.create_task_integration.id}" 
  authorizer_id = var.authorizer_id


}

resource "aws_lambda_permission" "create_task_permission" {
  statement_id = "AllowAPIGatewayInvoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_task.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${var.api_gateway_execution_arn}/*/*"
}