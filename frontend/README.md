# TicketFlow Frontend

This is the minimal Vite + React (JavaScript) frontend for TicketFlow.

Quick start:

```powershell
cd frontend
npm install
cp .env.example .env
npm run dev
```

Auth pages:
- /login
- /register

Flow:
- Login/Register will save the access token in memory via `AuthProvider` and set a refresh cookie.
- The client will attempt to refresh the access token automatically when requests return 401.

The frontend expects the backend API at `VITE_API_URL` (set in `.env`).
