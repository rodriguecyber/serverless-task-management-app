resource "aws_cognito_user_pool" "task_user_pool" {
  name = "task_user_pool"

# Require email verification
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
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
    ]
    prevent_user_existence_errors = "ENABLED"

}

resource "aws_cognito_user_group" "task_admin_group" {
    name = "Admin"
    user_pool_id = aws_cognito_user_pool.task_user_pool.id
    precedence = 1
  
}

resource "aws_cognito_user_group" "task_user_group" {
    name = "User"
    user_pool_id = aws_cognito_user_pool.task_user_pool.id
    precedence = 2
  
}

# Seed admin user via AWS CLI (Cognito has no Terraform resource for users)
resource "null_resource" "seed_admin_user" {
  count = length(var.seed_admin_username) > 0 && length(var.seed_admin_temp_password) > 0 ? 1 : 0

  triggers = {
    user_pool_id = aws_cognito_user_pool.task_user_pool.id
    username     = var.seed_admin_username
  }

  provisioner "local-exec" {
    when = create
    command = join(" ", [
      "aws cognito-idp admin-create-user",
      "--user-pool-id", aws_cognito_user_pool.task_user_pool.id,
      "--username", var.seed_admin_username,
      "--user-attributes", "Name=email,Value=${var.seed_admin_username} Name=email_verified,Value=true",
      "--temporary-password", var.seed_admin_temp_password,
      "--message-action SUPPRESS"
    ])
    environment = {
      AWS_DEFAULT_REGION = data.aws_region.current.name
    }
  }

  provisioner "local-exec" {
    when = create
    command = join(" ", [
      "aws cognito-idp admin-set-user-password",
      "--user-pool-id", aws_cognito_user_pool.task_user_pool.id,
      "--username", var.seed_admin_username,
      "--password", var.seed_admin_temp_password,
      "--permanent"
    ])
    environment = {
      AWS_DEFAULT_REGION = data.aws_region.current.name
    }
  }

  provisioner "local-exec" {
    when = create
    command = join(" ", [
      "aws cognito-idp admin-add-user-to-group",
      "--user-pool-id", aws_cognito_user_pool.task_user_pool.id,
      "--username", var.seed_admin_username,
      "--group-name", aws_cognito_user_group.task_admin_group.name
    ])
    environment = {
      AWS_DEFAULT_REGION = data.aws_region.current.name
    }
  }

  depends_on = [aws_cognito_user_group.task_admin_group]
}

data "aws_region" "current" {}