# Serverless Task Management

Task management app with role-based access: **admins** create, assign, update, and delete tasks and view users; **users** see assigned tasks and update their status. Built with React, AWS Cognito, API Gateway (HTTP API), Lambda, and DynamoDB.

## Architecture

- **Frontend:** React (Vite) + AWS Amplify (Cognito auth). Login, register, verify email, then role-based UI.
- **Auth:** AWS Cognito User Pool with JWT authorizer; groups `task_admin_group` (admin) and `task_user_group` (user).
- **API:** API Gateway HTTP API (v2), JWT authorizer, Lambda proxy integrations.
- **Backend:** Node.js 20 Lambdas; DynamoDB single table with GSI for “my tasks” by assignee.
- **Infrastructure:** Terraform (AWS provider ~> 6.0); optional Amplify Hosting module.

## Prerequisites

- Node.js 18+
- Terraform >= 1.14.2
- AWS CLI configured (for Terraform and optional Amplify)

## Project structure

```
├── backend/                 # Lambda functions
│   ├── lambda_functions/    # create_task, assign_task, update_task, delete_task, get_task, get_all_tasks, my_tasks, list_users, pre_signup
│   ├── esbuild.config.js    # Bundle and zip each Lambda
│   └── dist/                # Built .zip artifacts (gitignored)
├── frontend/                # React SPA
│   ├── src/
│   │   ├── config/amplify.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/      # Login, Register, VerifyAccount
│   │   └── App.jsx
│   └── .env                 # VITE_* 
├── infrastructure/           # Terraform
│   ├── main.tf
│   ├── outputs.tf
│   ├── variables.tf        # github_token, repository_url (for Amplify)
│   └── modules/
│       ├── api-gateway/     # HTTP API + JWT authorizer
│       ├── cognito/         # User pool, app client, groups
│       ├── dynamodb/        # Tasks table + GSI1 (user → tasks)
│       ├── iam/             # Lambda role (DynamoDB, Cognito ListUsers, SNS)
│       ├── lambda/          # All Lambdas + routes
│       └── amplify/        
└── README.md
```

## API (all require JWT)

| Method | Path | Description | Role |
|--------|------|-------------|------|
| POST   | `/tasks` | Create task (title, description) | Admin |
| GET    | `/tasks` | List all tasks | Admin |
| GET    | `/tasks/mine` | List my assigned tasks | User |
| GET    | `/tasks/:taskId` | Get one task | Admin or assignee/creator |
| PUT    | `/tasks/:taskId` | Update status (body: `{ status }`) | Admin or assignee |
| POST   | `/tasks/assign/:taskId` | Assign task (body: `{ assignedTo }`) | Admin |
| DELETE | `/tasks/:taskId` | Delete task | Admin |
| GET    | `/users` | List Cognito users | Admin |

Task ID is always in the path (`:taskId`).

## Setup

### 1. Backend (Lambdas)

```bash
cd backend
npm install
npm run build
```

Builds each Lambda from `lambda_functions/<name>/index.js` into `dist/<name>.zip`. On Windows, the build script uses `zip`; ensure it’s available (e.g. Git Bash) or adjust `esbuild.config.js`.

### 2. Infrastructure (Terraform)

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```




### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env` with the Terraform outputs :

```env
VITE_API_BASE_URL=https://xxxxxxxx.execute-api.eu-central-1.amazonaws.com
VITE_USER_POOL_ID=eu-central-1_xxxxxxxxx
VITE_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_REGION=eu-central-1
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

 used the Terraform Amplify module to connect the repo and deploy with the same env vars in Amplify Console.

## Users and roles

- **Cognito groups:** `task_admin_group` (admin), `task_user_group` (user). Add users to groups in Cognito (Console or CLI).
- **Flow:** Register (email + password) → verify with code from email → sign in. UI switches by group: admins get create/assign/delete/list users; users get “My tasks” and update status.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_API_BASE_URL` | Frontend | API Gateway HTTP API base URL |
| `VITE_USER_POOL_ID` | Frontend | Cognito User Pool ID |
| `VITE_APP_CLIENT_ID` | Frontend | Cognito App client ID |
| `VITE_REGION` | Frontend | AWS region (optional, default eu-central-1) |

Lambdas get `TASKS_TABLE` and (for list_users) `USER_POOL_ID` from Terraform.


