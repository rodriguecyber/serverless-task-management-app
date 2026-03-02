# Shared assume role policy for Lambda
locals {
  lambda_assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = "sts:AssumeRole"
      Effect   = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# --- API Lambdas (create_task, assign_task, update_task, delete_task, get_task, get_all_tasks, my_tasks, list_users) ---
resource "aws_iam_role" "lambda_execution_role" {
  name               = "lambda_execution_role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "lambda_policy"
  description = "DynamoDB, Cognito, SNS for API Lambdas"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem", "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan"]
        Resource = var.dynamotable_arn
      },
      {
        Effect   = "Allow"
        Action   = ["cognito-idp:ListUsers", "cognito-idp:AdminGetUser"]
        Resource = var.cognito_user_pool_arn
      },
      {
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = var.sns_topic_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

# --- Notification Lambda (notify_task_events: SNS → SES email) ---
resource "aws_iam_role" "notification_lambda_role" {
  name               = "task-management-notification-lambda-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "notification_lambda_basic" {
  role       = aws_iam_role.notification_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy" "notification_lambda_ses" {
  name        = "notification-lambda-ses"
  description = "SES SendEmail for notify_task_events Lambda"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "notification_lambda_ses_attach" {
  role       = aws_iam_role.notification_lambda_role.name
  policy_arn = aws_iam_policy.notification_lambda_ses.arn
}
