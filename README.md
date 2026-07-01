# 🚀 Deenindunya Backend System

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Framework-Express%20v5-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Container-Docker-blue.svg)](https://www.docker.com/)
[![License-ISC](https://img.shields.io/badge/License-ISC-orange.svg)](https://opensource.org/licenses/ISC)

> [!WARNING]
> **This project is strictly Docker-centric.**
> Do not attempt to run the Node.js server directly on your host machine for development.
> Always use Docker Compose to manage, run, and scale services locally.

---

## 1. Purpose & Overview

This repository houses the backend system for the **Deenindunya** application. It provides a robust, decoupled, and layered API designed to manage:
- User accounts, roles, profiles, and status gate checks.
- Quran Surahs data and caches.
- Islamic events, Hijri year events, and stats.
- Educational lessons and education hub contents.
- Real-time integrations via Socket.IO.
- Payments and subscriptions processing.
- Direct media uploads to AWS S3.

---

## 2. Technology Stack & Integrations

- **Core Runtime**: Node.js (LTS v22.14.0)
- **Programming Language**: TypeScript
- **Web Framework**: Express (v5.2.1) & Socket.IO (v4.8.3)
- **Database**: MongoDB (via Mongoose v9.6.3)
- **Third-Party Services**:
  - **AWS S3**: Cloud media storage and retrieval
  - **Stripe**: Credit card billing and subscription webhooks
  - **Nodemailer**: Email transaction dispatch
  - **Firebase Admin**: Real-time push notification delivery

---

## 3. Directory Layout

Below is a bird's-eye view of the project's directory structure:

```text
.
├── docker-compose.yaml        # Development Compose file (mounts local sources)
├── docker-compose.prod.yaml   # Production Compose file (no local volume mounts)
├── docs/                      # Central developer guides & architectural maps
│   ├── ARCHITECTURE.md        # Decoupled layered design diagrams and flowcharts
│   ├── AUTHENTICATION.md      # JWT session lifecycles, status checks, and RBAC
│   ├── API_GUIDELINES.md      # Standardised response/error structures
│   ├── FOLDER_STRUCTURE.md    # Naming standards and folder maps
│   └── DATABASE_SEEDING.md    # Seeding scripts reference
├── server/                    # API Server source package
│   ├── Dockerfile             # Production build (multi-stage alpine build)
│   ├── Dockerfile.dev         # Development build (live hot-reloading)
│   ├── scripts/               # Build and administrative helper scripts
│   ├── src/                   # Source files
│   │   ├── app.ts             # Express setup and middleware attachment
│   │   ├── server.ts          # Server entrypoint (db connection & worker startup)
│   │   ├── socket.ts          # Socket.io connection handlers
│   │   └── app/
│   │       ├── config/        # Environment configurations (AWS, Stripe, Firebase)
│   │       ├── middleware/    # Auth, error handling, file parsing
│   │       ├── modules/       # Domain modules (auth, user, room, surah, etc.)
│   │       └── routes/        # Router bindings (v1 endpoint index)
│   └── tsconfig.json          # TypeScript project mapping
└── README.md                  # Unified root setup guide (This file)
```

---

## 4. Environment Variables Configuration

To run the application, create a `.env` file in the `server` directory using the template provided:

```bash
cp server/.env.example server/.env
```

Ensure all variables are populated correctly:
- **`DATABASE_URL`**: Connection string to your MongoDB Atlas cloud database cluster.
- **`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`**: Cryptographic keys for signing user tokens.
- **`EMAIL` / `APP_PASS`**: Nodemailer mail server credentials.
- **`S3_BUCKET_ACCESS_KEY` / `S3_BUCKET_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_BUCKET_NAME`**: AWS credentials for file uploads.
- **`STRIPE_API_KEY` / `STRIPE_API_SECRET`**: Stripe billing secret keys.
- **`FIREBASE_PROJECT_ID` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL`**: Firebase push notification settings.

---

## 5. Development Stack Setup

Start the local stack with code hot-reloading enabled:

```bash
docker compose up --build
```

### What this does:
1. Builds the server image using `Dockerfile.dev`.
2. Installs dependencies using `pnpm install`.
3. Mounts the `./server/src` directory inside the container for hot-reloading using `ts-node-dev`.
4. Saves dependencies inside container volumes.

### Useful Commands:
```bash
# Check running container statuses
docker compose ps

# Stream logs of the running Express server
docker compose logs -f server

# Stop the development stack
docker compose down
```

---

## 6. Database Seeding & Seeding Workflows

Once the development stack is running, seed the initial application database collections:

### A. Seed Quran & Surahs
```bash
docker compose exec server pnpm run seed:quran
```

### B. Seed Islamic Events
```bash
docker compose exec server pnpm run seed:events
```

### C. Seed Education Hub Lessons
```bash
docker compose exec server pnpm run seed:lessons
```

---

## 7. Production Stack Setup

To run an optimized production configuration locally or in a staging environment:

```bash
# Start production containers in detached mode
docker compose -f docker-compose.prod.yaml up --build -d

# Check running production containers
docker compose -f docker-compose.prod.yaml ps

# Stream logs of the production server
docker compose -f docker-compose.prod.yaml logs -f server

# Stop the production stack and preserve volumes
docker compose -f docker-compose.prod.yaml down
```

### Production Security & Optimization Details:
- Uses `server/Dockerfile` (a multi-stage Alpine configuration).
- Compiles TS, runs formatting lint validations, and prunes development dependencies.
- Runs as a non-root `nodejs` user.
- Employs `dumb-init` for container signal trapping and process management.
- Includes container-level healthchecks.

---

## 8. Health Verification

The API server exposes a root health endpoint to verify startup integrity:

- **Endpoint**: `GET /`
- **Expected Status**: `HTTP 200`
- **Expected Payload**:
```json
{
  "message": "Deenindunya app is running!",
  "status": "success",
  "timestamp": "2026-07-01T08:50:38.000Z"
}
```

---

## 9. Developer Scripts Reference

All scripts must be executed within the `server` environment.

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **build** | `tsc` | Compiles TS files |
| **dev** | `ts-node-dev ...` | Starts server with live-reloads |
| **start:prod** | `node ./dist/server.js` | Starts built production files |
| **lint** | `eslint src ...` | Static code analysis check |
| **prettier** | `prettier --write ...` | Standardizes code styling formatting |
| **seed:quran** | `ts-node src/app/seeder/surah.seed.ts` | Seeds Quran Surahs |
| **seed:events** | `ts-node src/app/seeder/events.seed.ts` | Seeds Islamic events |
| **seed:lessons** | `ts-node src/app/seeder/lesson.seeder.ts` | Seeds educational lessons |

---

## 10. Developer Documentation Index

Explore the directories in `docs/` to detail conventions used across the project:

- [System Architecture Details](docs/ARCHITECTURE.md): Structural layout and data workflows.
- [Authentication and Sessions](docs/AUTHENTICATION.md): Session logic, RBAC, and credentials.
- [API Conventions](docs/API_GUIDELINES.md): Return templates and error structure formats.
- [Workspace Folder Structure](docs/FOLDER_STRUCTURE.md): Layout and module organization.
- [Database & Seed Routines](docs/DATABASE_SEEDING.md): Seeding scripts and idempotency rules.
