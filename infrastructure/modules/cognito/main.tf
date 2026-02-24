resource "aws_cognito_user_pool" "task_user_pool" {
  name = "task_user_pool"

#   Require email verification
auto_verified_attributes = ["email"]

# Email
schema {
  name = "email"
  required = true
  attribute_data_type = "String"

}

# prevent Unauthenticated users
mfa_configuration = "OFF"

password_policy {
  minimum_length = 8
  require_lowercase = true
  require_uppercase = true
  require_numbers = true
  require_symbols = true

}
lambda_config {
  pre_sign_up = var.pre_signup_lambda_arn
}

tags = {
  Project:"serverless-taks-management"
}

}

# aws cognito user pool client
resource "aws_cognito_user_pool_client" "task_user_pool_client" {
name = "task_user_pool_client"
user_pool_id = aws_cognito_user_pool.task_user_pool.id
generate_secret = false

explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH", 
    "ALLOW_REFRESH_TOKEN_AUTH"
    ]
    prevent_user_existence_errors = "ENABLED"

}

resource "aws_cognito_user_group" "task_admin_group" {
    name = "task_admin_group"
    user_pool_id = aws_cognito_user_pool.task_user_pool.id
    precedence = 1
  
}

resource "aws_cognito_user_group" "task_user_group" {
    name = "task_user_group"
    user_pool_id = aws_cognito_user_pool.task_user_pool.id
    precedence = 2
  
}