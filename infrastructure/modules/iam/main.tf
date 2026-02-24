resource "aws_iam_role" "lambda_execution_role" {
  name = "lambda_execution_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  
}

resource "aws_iam_policy" "lambda_policy" {
    name = "lambda_policy"

    policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
        # DynamoDB permissions
        {

        Effect = "Allow"
        Action = [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:UpdateItem",
            "dynamodb:DeleteItem",
            "dynamodb:Query"
        ]
        Resource = var.dynamotable_arn

        
        },
        # SNS Publish
        {
            Effect = "Allow"
            Action =[
                 "sns:Publish"
                 ]
                 Resource = var.sns_topic_arn            
        }
        ]
    })
  
}
resource "aws_iam_role_policy_attachment" "lambda_custom_attach" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}