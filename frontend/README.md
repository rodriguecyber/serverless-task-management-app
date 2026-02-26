# Frontend (React + Vite)

This app is a small API console for your task backend.

## 1) Install and run

```bash
cd frontend
npm install
npm run dev
```

## 2) Configure

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Set:

- `VITE_API_BASE_URL`: API Gateway endpoint
- `VITE_JWT_TOKEN`: Cognito JWT access token (optional, you can paste it in UI)

## 3) Supported API actions

- `POST /tasks`
- `GET /tasks/{taskId}`
- `PUT /tasks/{taskId}`
- `POST /tasks/assign`
- `DELETE /tasks/{taskId}`

## Notes

- Your API Gateway must allow CORS for browser requests from your frontend origin.
