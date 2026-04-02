# Monorepo Orchestration Walkthrough

The Cleerio monorepo is now fully functional, with all services (API, Worker, Dashboard) and infrastructure dependencies successfully running on Windows.

## Key Changes and Fixes

### 1. TypeScript Module Resolution
- **Issue**: Services were failing to resolve `@platform/*` workspace libraries.
- **Fix**: Added explicit `paths` mappings to `apps/api/tsconfig.json` and `apps/worker/tsconfig.json`.

### 2. Dependency Management
- **Issue**: `libs/domain` was missing critical NestJS and authentication dependencies.
- **Fix**: Installed `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, and `@nestjs/platform-express` at the root and in the domain library to ensure availability.

### 3. API & Worker Code Correctness
- **Issue**: Incorrect imports and protected property access were blocking compilation.
- **Fix**:
    - Relocated `ReportsModule` to the API's local modules to avoid circular or missing dependencies.
    - Updated `ReportsController` to import `TenantGuard` from the correct `@platform/tenant` library.
    - Fixed `JobQueueService` in the Worker to use the public `db` instance instead of accessing protected members of other services.
    - Updated `KafkaService` to use the correct schema column (`runAfter` instead of `scheduledFor`).

### 4. Windows Runtime Resolution
- **Issue**: Standard `nest start` or `tsx` commands were failing on the `D:` drive with "Cannot find module 'D'".
- **Fix**: Implemented a more robust launch command using explicit relative module registration:
  `node -r ts-node/register -r tsconfig-paths/register src/main.ts`

### 5. Infrastructure
- **Kafka**: Updated `docker-compose.yml` to use the official `apache/kafka` image in KRaft mode, replacing incompatible Bitnami environment variables.

## Current Service Status

| Service | Port | Status | Command |
| :--- | :--- | :--- | :--- |
| **API** | 3000 | **RUNNING** | `node -r ts-node/register ...` |
| **Worker** | 3001 | **RUNNING** | `node -r ts-node/register ...` |
| **Dashboard** | 3002 | **RUNNING** | `npm run dev` |

## Verification

### API Check
The API logs show a successful startup:
```text
[Nest] 27524  - 01/04/2026, 1:41:33 pm     LOG [NestApplication] Nest application successfully started +3ms
```

### Worker Check
The Worker logs show successful Cron and Kafka service initialization:
```text
[Nest] 9536   - 01/04/2026, 1:41:34 pm     LOG [Worker] Scheduled processing jobs started.
```

### Infrastructure Check
The Docker Compose stack is healthy. Kafka, Postgres, Redis, and Minio are responding on their respective ports.
