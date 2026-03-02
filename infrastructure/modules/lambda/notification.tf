
resource "aws_lambda_function" "notify_task_events" {
  function_name   = "task-management-notify-task-events"
  handler         = "notify_task_events.handler"
  runtime         = "nodejs20.x"
  role            = var.notification_lambda_role_arn
  filename        = "${path.root}/../backend/dist/notify_task_events.zip"
  source_code_hash = filebase64sha256("${path.root}/../backend/dist/notify_task_events.zip")
  memory_size     = 128
  timeout         = 10

  environment {
    variables = {
      NOTIFY_FROM_EMAIL = var.notify_from_email
    }
  }
}

resource "aws_sns_topic_subscription" "notify_task_events" {
  topic_arn = var.sns_topic_arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.notify_task_events.arn
}

resource "aws_lambda_permission" "sns_notify_task_events" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notify_task_events.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = var.sns_topic_arn
}
