# Serverless Task Management

Task management app with role-based access: **admins** create, assign, update, and delete tasks and view users; **users** see assigned tasks and update their status. Built with React, AWS Cognito, API Gateway (HTTP API), Lambda, and DynamoDB.

## Architecture

- **Frontend:** React (Vite) + AWS Amplify (Cognito auth). Login, register, verify email, then role-based UI.
- **Auth:** AWS Cognito User Pool with JWT authorizer; groups `task_admin_group` (admin) and `task_user_group` (user).
- **API:** API Gateway HTTP API (v2), JWT authorizer, Lambda proxy integrations.
- **Backend:** Node.js 20 Lambdas; DynamoDB single table with GSI for “my tasks” by assignee.
- **Notifications:** One SNS topic (`task_definitions`) receives all task events. A single Lambda (`notify_task_events`) is subscribed to it and sends email via SES: **assignee** when a task is assigned; **admins** when a task’s status is updated.
- **Infrastructure:** Terraform (AWS provider ~> 6.0); optional Amplify Hosting module.

## Prerequisites

- Node.js 18+
- Terraform >= 1.14.2
- AWS CLI configured (for Terraform and optional Amplify)

## Project structure

```
├── backend/                 # Lambda functions
│   ├── lambda_functions/    # create_task, assign_task, update_task, delete_task, get_task, get_all_tasks, my_tasks, list_users, notify_task_events, pre_signup
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
|       |__ sns
|       
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

 used the Terraform Amplify module to connect  the repo and deploy with the same env vars in Amplify Console.

## Users and roles

- **Cognito groups:** `Admin` (admin), `User` (user). Add users to groups in Cognito (Console or CLI), or seed an admin with Terraform (see below).
- **Flow:** Register (email + password) → verify with code from email → sign in. UI switches by group: admins get create/assign/delete/list users; users get “My tasks” and update status.

### Seed admin user (Terraform)

To create one admin user and add them to the **Admin** group at apply time, set:

- `seed_admin_username` – e.g. `admin@example.com` (used as username and email).
- `seed_admin_temp_password` – temporary password meeting the pool policy (min 8 chars, upper, lower, number, symbol). Prefer setting via `-var` so it isn’t stored in state or tfvars.

Example (one-time):

```bash
cd infrastructure
terraform apply -var="seed_admin_username=admin@example.com" -var="seed_admin_temp_password=TempPass1!"
```

Leave both variables empty (default) to skip seeding. The seed runs only when the null_resource is created; if the user already exists, remove or change the seed vars and re-apply, or taint the resource to re-run.

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_API_BASE_URL` | Frontend | API Gateway HTTP API base URL |
| `VITE_USER_POOL_ID` | Frontend | Cognito User Pool ID |
| `VITE_APP_CLIENT_ID` | Frontend | Cognito App client ID |
| `VITE_REGION` | Frontend | AWS region (optional, default eu-central-1) |

Lambdas get `TASKS_TABLE` and (for list_users) `USER_POOL_ID` from Terraform.

## Email notifications (SNS + SES)

When a task is **assigned**, the assignee receives an email (address from Cognito). When a task **status** is updated, admins receive an email. Both events are published to the same SNS topic (`task_definitions`); one Lambda (`notify_task_events`) handles all notification types and sends email via SES.

1. **SES:** In AWS SES (same region as the app), verify the “From” address (or domain) you want to use. In sandbox, verify recipient addresses too unless you’re out of sandbox.
2. **Terraform variables** (e.g. in `terraform.tfvars` or `-var`):
   - `admin_emails` – comma-separated admin emails to notify on status update (e.g. `"admin@example.com"`).
   - `notify_from_email` – SES-verified email used as the “From” for all notification emails (e.g. `"noreply@example.com"`).
3. **Sandbox:** Set `ses_verified_recipient_emails` to a list of emails that may receive (admins + assignees). Terraform creates an SES identity for each; each gets a verification email—they must click the link. Only these addresses can receive until you request production access.
4. After `terraform apply` and verifying all links, assign and status-update flows send emails via SES. If a recipient isn’t verified (sandbox), the Lambda logs a warning and continues without failing.

