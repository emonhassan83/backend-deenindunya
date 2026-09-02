# Workspace Layout & Folder Structure

This document outlines the organization of codebases, schemas, configurations, and scripts across the Deenindunya repository.

---

## 1. Repository Layout

```text
.
├── docker-compose.yaml        # Multi-container orchestration config (Development)
├── docker-compose.prod.yaml   # Multi-container orchestration config (Production)
├── docs/                      # Central developer documentation system
│   ├── ARCHITECTURE.md        # System architecture maps & service flows
│   ├── AUTHENTICATION.md      # JWT session lifetimes, status gates, & RBAC
│   ├── API_GUIDELINES.md      # Success/error formats and versioning
│   ├── FOLDER_STRUCTURE.md    # Repository layout maps & module conventions
│   ├── DATABASE_SEEDING.md    # Seeding scripts & execution instructions
│   └── REVENUECAT_SUBSCRIPTION_README.md  # RevenueCat subscription integration guide
├── nodemailer/                # Standalone SMTP mail service (pnpm package)
│   ├── src/
│   │   ├── app.ts             # Express app and mail routes
│   │   ├── index.ts           # HTTP entrypoint
│   │   └── app/
│   │       ├── configs/       # Environment & SMTP transporter config
│   │       └── utils/         # Mail helpers and validation
│   ├── scripts/               # Build and start shell scripts
│   ├── package.json           # Package manifest (pnpm)
│   └── pnpm-lock.yaml         # Dependency lockfile
├── server/                    # Express API Server directory
│   ├── src/
│   │   ├── app.ts             # App initialization and middleware configuration
│   │   ├── server.ts          # Server startup, database connection, & sockets
│   │   ├── socket.ts          # Socket.io connection and event listeners
│   │   └── app/
│   │       ├── builder/       # Query builder utilities for filtering/paging
│   │       ├── config/        # Environment configurations (Firebase, S3, credentials)
│   │       ├── constants/     # Global constants
│   │       ├── errors/        # Custom error handlers (AppError, cast error, validation error)
│   │       ├── interface/     # Global interfaces and express overrides
│   │       ├── middleware/    # Auth verification, rate limiting, files parsing
│   │       ├── modules/       # Feature domain modules (Auth, User, Sunnah, Surah, Room, etc.)
│   │       ├── routes/        # Router bindings (v1 endpoint index)
│   │       ├── job/           # Scheduled cron jobs (Islamic events, etc.)
│   │       ├── worker/        # BullMQ workers (email, notification queues)
│   │       ├── seeder/        # Administrative seeder scripts
│   │       └── utils/         # System utility helper methods
│   ├── tsconfig.json          # TypeScript project mapping
│   └── package.json           # Node project manifest (pnpm)
└── README.md                  # Main developer onboarding guide
```

---

## 2. Server Application Structure

The API application lives inside [server/src](file:///d:/bd-calling/task/backend-deenduniya/server/src):

- `server.ts` is the main entry point. It boots up connection to the MongoDB Atlas cluster, registers socket listeners, and starts listening on the defined port.
- `app.ts` initializes body parsers, CORS settings, cookie parser, route bindings, and global error handlers.
- `socket.ts` handles the Socket.IO setup and registers connection namespaces.

---

## 3. Module Directory Structure

Features are isolated inside domain folders inside `server/src/app/modules/<module>`:

```text
user/
├── user.controller.ts     # Express controller actions
├── user.services.ts       # Business logic and database access
├── user.routes.ts         # Express router configuration
├── user.validators.ts     # Input validator schemas (Zod)
├── user.interface.ts      # Module interfaces
├── user.model.ts          # Mongoose model schema definition
└── user.constant.ts       # Module constants & enums
```
Each file name follows the format `<module-name>.<type>.ts` for clear separation of concerns.
