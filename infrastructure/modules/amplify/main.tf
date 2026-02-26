data "aws_region" "current" {}

resource "aws_amplify_app" "frontend" {
  name = "task-management-frontend"
  repository = var.repository_url
  access_token = var.github_token
  build_spec = <<EOF
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory:frontend/build
    files:
      - '**/*'
    cache:
      paths:
        - frontend/node_modules/**/*
EOF

environment_variables = {
VITE_API_BASE_URL=var.api_base_url
VITE_USER_POOL_ID=var.user_pool_id
VITE_APP_CLIENT_ID=var.app_client_id
VITE_REGION=data.aws_region.current.name
}

}

resource "aws_amplify_branch" "main" {
  app_id = aws_amplify_app.frontend.id
  branch_name = "main"
  framework = "React"
  stage = "PRODUCTION"
  enable_auto_build = true
  
}