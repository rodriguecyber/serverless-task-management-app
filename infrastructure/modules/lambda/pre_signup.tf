resource "aws_lambda_function" "pre_signup" {
  function_name = "task-management-pre-signup"
  role = var.lambda_role_arn
  handler = "index.handler"
  runtime = "nodejs20.x"
  filename = "${path.module}/../../../backend/pre-signup/function.zip"
  timeout = 5
}

resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = var.cognito_user_pool_arn
}