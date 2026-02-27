resource "aws_apigatewayv2_api" "http_api" {
  name = "task-management-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = ["*"]
   allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"]
    max_age       = 300
  }
  

}
data "aws_region" "current" {}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_authorizer" "task_management_authorizer" {
  name = "task-management-authorizer"
  api_id = aws_apigatewayv2_api.http_api.id
    authorizer_type = "JWT"
    identity_sources = ["$request.header.Authorization"]
    jwt_configuration {
      audience = [var.app_client_id]
      issuer = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${var.user_pool_id}"
    }
}