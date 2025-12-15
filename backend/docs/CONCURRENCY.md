# Concurrency & Seat Allocation

This document summarizes the concurrency approach and how to run automated tests.

## Current approach
- Each seat is stored in a per-seat `Seat` document rather than embedded in `Event`. This allows atomic single-document updates (e.g., `findOneAndUpdate`) to safely change a seat's status from `available` -> `reserved`.
- When reserving multiple seats, the backend attempts to lock seats one by one and rolls back any partially-reserved seats if all cannot be reserved.
- This approach keeps the code simple and works under moderate load; for strict atomic multi-seat reservation consider MongoDB transactions (requires replica set or Atlas).

## How to run the concurrency test
1. Start the backend (must be reachable at `http://localhost:4000` or set `API_URL`):

```powershell
cd "C:\Users\Shashwat Kashyap\Desktop\projectpm\backend"
npm run dev
```

2. Seed the DB (creates an event and per-seat documents):

```powershell
npm run seed
# note the printed event id (use it in STEP 3)
```

3. Run the automated concurrency mocha test (ensure `EVENT_ID` is set):

```powershell
$env:EVENT_ID='693e87909e5cb82e04ea2c3f' # replace with your seeded event id
$env:CONCURRENT='20'
npm run test:concurrency
```

Expected: the test asserts that at most one reservation for the same seat succeeded.

## Notes & next steps
- To make multi-seat reservations fully atomic, enable MongoDB transactions (use a replica set/Atlas) and implement a transaction-scoped update for all seats.
- CI integration can run this test against an ephemeral test environment (start backend + test containers), but this requires more setup in CI.

## When to create a MongoDB Atlas cluster

- If you need multi-document transactions (e.g., atomically reserving multiple seats), you must use a MongoDB **replica set**. MongoDB Atlas clusters are configured as replica sets and support transactions.
- For local development you can either:
	- Run a single-node replica set locally (via `mongod --replSet rs0` and `rs.initiate()`), or
	- Use an Atlas cluster (Free M0 or paid tiers). Free clusters are suitable for development and initial testing.
- Steps to create and use an Atlas cluster:
	1. Sign in to MongoDB Atlas and create a new cluster (Free tier is fine for testing).
	2. Create a database user with a strong password.
	3. Add your IP (or `0.0.0.0/0` temporarily) to the Network Access whitelist.
	4. Copy the connection string (replace <user>, <pass>, <dbname>) and set it in your backend `.env` as `MONGO_URI`.
	5. Restart the backend so it connects to Atlas — after that the transaction-based path will be used automatically when possible.

If you'd like, I can add an optional Docker Compose file that runs a local single-node replica set for testing transactions locally.
I added a helper compose file: `docker-compose.mongo-repl.yml` at the project root and an init script at `backend/docker/init-rs.js` that initiates `rs0` on first run.

Quick steps to run the local replica set:

1. Ensure Docker Desktop is running on your machine.
2. From the project root run:

```powershell
docker compose -f docker-compose.mongo-repl.yml up -d
```

3. Wait a few seconds for the `mongo-repl` container to become healthy, then set your backend `MONGO_URI` to:

```text
mongodb://localhost:27017/ticketflow?replicaSet=rs0
```

4. Restart the backend so it connects to the replica set; after that the transaction-based reservation path will be used automatically.

If you'd like, I can attempt to start the compose stack from here, but I won't do that without permission (Docker may not be running on your machine).
