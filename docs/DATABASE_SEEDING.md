# Database Seeding Workflows

This document describes how to execute the database seeding pipelines to populate initial data for Quran Surahs, Islamic Events, and Lessons.

---

## 1. Seeding Workflows

The server service provides utility scripts to populate or initialize the database under `server/src/app/seeder/`. These are exposed via the package scripts and must be executed in the Docker service context.

---

## 2. Seed Scripts Reference

### A. Seed Quran & Surahs
Populates the Quran Surah cache and seeds it into the MongoDB collections.
- **Execution (Root)**:
  ```bash
  docker compose exec server pnpm run seed:quran
  ```
- **Clean Execution**:
  ```bash
  docker compose exec server pnpm run seed:quran:clean
  ```

### B. Seed Islamic Events
Seeds Islamic events data (such as Hijri years, months, and special events).
- **Execution (Root)**:
  ```bash
  docker compose exec server pnpm run seed:events
  ```
- **Execution with Flags**:
  - `seed:events:current` - Seeds events for current year.
  - `seed:events:year` - Seeds events for a specific year.
  - `seed:events:stats` - Displays database event seeding status.
  - `seed:events:delete` - Clears events for a specific year.

### C. Seed Education Lessons
Seeds Islamic lessons and contents into the education hub collections.
- **Execution (Root)**:
  ```bash
  docker compose exec server pnpm run seed:lessons
  ```

---

## 3. Seeding Best Practices

All seeding scripts must enforce **Idempotency** (can be executed multiple times without generating duplicate documents or corrupted states):
1. **Uniqueness Check**: Before inserting, check if the record exists by a unique key (e.g. `surahNumber`, `eventKey`, `lessonTitle`).
2. **Upsert Operations**: Use MongoDB's `updateOne` or `bulkWrite` with `upsert: true` to prevent duplicates.
