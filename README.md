# obot Monorepo (Convenience Scripts)

This repo hosts two projects:
- `backend/` (NestJS API — now includes AI, embeddings, and vector DB integration)
- `frontend/` (Vite + React app)

The root is not a workspace. The root `package.json` only provides convenience scripts to run each project separately.

## Prerequisites
- Node.js 18+ and npm for `backend` and `frontend`.

## Run
- Backend (dev): `npm run backend:dev`
- Frontend (dev): `npm run frontend:dev`

## Install
- Backend deps: `npm run backend:install`
- Frontend deps: `npm run frontend:install`

You can also install manually within each project directory if you prefer:
- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`

These scripts are for ease of use only and do not connect or manage the projects as a single workspace.
