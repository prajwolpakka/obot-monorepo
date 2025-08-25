# obot Monorepo (Convenience Scripts)

This repo hosts three independent projects:
- `backend/` (NestJS API)
- `frontend/` (Vite + React app)
- `ai/` (FastAPI service via Poetry)

The root is not a workspace. The root `package.json` only provides convenience scripts to run each project separately.

## Prerequisites
- Node.js 18+ and npm for `backend` and `frontend`.
- Python 3.11+ and Poetry for `ai`.

## Run
- Backend (dev): `npm run backend:dev`
- Frontend (dev): `npm run frontend:dev`
- AI service (dev): `npm run ai:dev`

## Install
- Backend deps: `npm run backend:install`
- Frontend deps: `npm run frontend:install`
- AI deps: `npm run ai:install`

You can also install manually within each project directory if you prefer:
- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`
- AI: `cd ai && poetry install`

These scripts are for ease of use only and do not connect or manage the projects as a single workspace.
