# Ticketflow — Local run instructions

This repository contains a simple ticketing app (Vite/React frontend and Node/Express backend with MongoDB).

## Quick start (Docker) 🔧

Requirements: Docker Desktop (Linux containers) running.

1. Start the stack:

```powershell
docker compose up -d --build
```

This will start a single-node MongoDB replica set (needed for transaction testing), the backend on port `4000`, and the frontend on port `3000`.

2. Seed the database (once):

```powershell
docker compose run --rm backend npm run seed
```

3. Open the frontend: http://localhost:3000 and test the site. The backend API is at http://localhost:4000.

## Local development (no Docker)

Start Mongo locally or use `docker compose -f docker-compose.mongo-repl.yml up -d`.

Start the backend in dev mode (auto-restarts on change):

```powershell
cd backend
npm install
npm run dev
```

Start the frontend dev server:

```powershell
cd frontend
npm install
npm run dev
```

Seed DB (local):

```powershell
cd backend
npm run seed
```

## Troubleshooting
- If you see connection failures during heavy stress tests, check `backend/logs/critical.log`, `backend/logs/out.log`, and `backend/logs/err.log` for diagnostics.

If you'd like, I can also add a GitHub Actions workflow to run the concurrency tests in CI using the same docker-compose setup. Let me know and I'll add it next.
# 🎟️ TicketFlow — Venue Ticketing System

> A full-featured ticketing system for venues to sell event tickets, manage seating arrangements, handle customer support, and manage season passes. Frontend: Vite + React (JavaScript). Backend: Node.js (Express) + MongoDB (Atlas recommended for deployment).

Abbreviated README — full documentation in `docs/` and per-folder README files. Set `MONGO_URI` in `backend/.env` to your MongoDB Atlas connection string before deploying to production.
