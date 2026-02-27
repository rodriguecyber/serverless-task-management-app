    resource "aws_lambda_function" "delete_task" {
    function_name = "task-management-delete-task"
    handler = "delete_task.handler"
    runtime = "nodejs20.x"
    role = var.lambda_role_arn
    filename = "${path.root}/../backend/dist/delete_task.zip"
    source_code_hash = filebase64sha256("${path.root}/../backend/dist/delete_task.zip")
    memory_size = 128
    timeout = 10

    environment {
    variables = {
    TASKS_TABLE=var.task_table_name
        
    }
    }
    }


    
  resource "aws_apigatewayv2_integration" "delete_task_integration" {
    api_id = var.api_gateway_id
    integration_type = "AWS_PROXY"
    integration_uri = aws_lambda_function.delete_task.arn
    payload_format_version = "2.0"
    
  }

  resource "aws_apigatewayv2_route" "delete_task_route" {
    api_id = var.api_gateway_id
    route_key = "DELETE /tasks/{taskId}"
    target = "integrations/${aws_apigatewayv2_integration.delete_task_integration.id}" 
    authorizer_id = var.authorizer_id
    authorization_type = "JWT"

  }

   resource "aws_lambda_permission" "delete_task_permission" {
    statement_id = "AllowAPIGatewayInvoke"
    action = "lambda:InvokeFunction"
    function_name = aws_lambda_function.delete_task.function_name
    principal = "apigateway.amazonaws.com"
    source_arn = "${var.api_gateway_execution_arn}/*/*"
  }
