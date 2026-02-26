resource "aws_lambda_function" "pre_signup" {
  function_name = "task-management-pre-signup"
  role = var.lambda_role_arn
  handler = "pre-signup.handler"
  runtime = "nodejs20.x"
  filename = "${path.root}/../backend/dist/pre-signup.zip"
  timeout = 5
  source_code_hash = filebase64sha256("${path.root}/../backend/dist/pre-signup.zip")
}

resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = var.cognito_user_pool_arn
}