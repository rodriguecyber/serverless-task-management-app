resource "aws_dynamodb_table" "task_table" {
  name = "serverless-task-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key = "PK"
  range_key = "SK"


  # primary key attribute definitions

attribute {
  name = "PK"
  type = "S"

}

attribute {
  name = "SK"
  type = "S"

}

# GSI Key attribute definitions
attribute {
  name = "GSI1PK"
  type = "S"

}

attribute {
  name = "GSI1SK"
  type = "S"

}

# GSI definition

global_secondary_index {
  name = "GSI1"
  hash_key = "GSI1PK"
  range_key = "GSI1SK"
  
  projection_type = "ALL"
}

tags = {
  "Project" = "Serveless-task-management"
}
}