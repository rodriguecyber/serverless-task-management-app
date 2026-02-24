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
   source = "./modules/iam"
   sns_topic_arn = module.sns.sns_topic_arn
   dynamotable_arn = module.dynamodb.dynamo_table_arn
 }

module "cogmito" {
  source = "./modules/cognito"
}