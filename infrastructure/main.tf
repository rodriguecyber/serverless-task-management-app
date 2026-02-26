terraform {
  required_providers {
    aws= {
        source = "hashicorp/aws"
        version = "~> 6.0"
    }
  }
  required_version = ">= 1.14.2"
}

provider "aws" {
  region = "eu-central-1"
}
 module "dynamodb" {
   source = "./modules/dynamodb"

 }
 module "sns" {
   source = "./modules/sns"
 }
 module "iam" {
   source               = "./modules/iam"
   sns_topic_arn        = module.sns.sns_topic_arn
   dynamotable_arn      = module.dynamodb.dynamo_table_arn
   cognito_user_pool_arn = module.cognito.user_pool_arn
 }

module "cognito" {
  source = "./modules/cognito"
  pre_signup_lambda_arn = module.lambda.pre_signup_lambda_arn
}

module "lambda" {
  source               = "./modules/lambda"
  cognito_user_pool_arn = module.cognito.user_pool_arn
  lambda_role_arn       = module.iam.lambda_role_arn
  task_table_name      = module.dynamodb.dynamo_table_name
  api_gateway_id       = module.api_gateway.api_id
  authorizer_id        = module.api_gateway.authorizer_id
  api_gateway_execution_arn = module.api_gateway.api_gateway_execution_arn
  user_pool_id         = module.cognito.user_pool_id
}

module "api_gateway" {
  source = "./modules/api-gateway"
  user_pool_id = module.cognito.user_pool_id
  app_client_id = module.cognito.app_client_id
}

module "amplify"{
  source = "./modules/amplify"
  github_token = var.github_token
  repository_url = var.repository_url
  api_base_url = module.api_gateway.api_base_url
  user_pool_id = module.cognito.user_pool_id
  app_client_id = module.cognito.app_client_id
}