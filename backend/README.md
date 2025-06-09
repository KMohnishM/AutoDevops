# AutoDevOps Backend

This is the Express backend for the AutoDevOps platform.

## Setup

```
cd backend
npm install
```

## Run the server

```
npm start
```

The server will start on port 4000 by default.

## Endpoints
- `POST /deploy` — Accepts deployment requests (repo URL, target)
- `GET /logs` — (To be implemented) Real-time log streaming 