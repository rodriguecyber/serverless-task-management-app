# Frontend .env: use these after terraform apply
# terraform output -json | jq -r '.api_endpoint.value'
output "api_endpoint" {
  value       = module.api_gateway.api_endpoint
  description = "API base URL for VITE_API_BASE_URL"
}

output "user_pool_id" {
  value       = module.cognito.user_pool_id
  description = "Cognito User Pool ID for VITE_USER_POOL_ID"
}

output "app_client_id" {
  value       = module.cognito.app_client_id
  description = "Cognito App Client ID for VITE_APP_CLIENT_ID"
}


