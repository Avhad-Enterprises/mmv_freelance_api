# System Error Logging Implementation Plan

## Overview
This plan outlines the steps to implement a backend logging system that captures HTTP error status codes (e.g., 404, 403, 500) and stores them in a PostgreSQL database table (`system_error_logs`). This will allow for auditing and debugging of user-facing errors.

## 1. Database Schema

### 1.1 Create Schema File
Create a new file `database/system_error_logs.schema.ts` to define the table structure.

**Table Name:** `system_error_logs`

**Columns:**
- `id`: BigInteger (Primary Key, Increments)
- `user_id`: Integer (Nullable) - To link the error to a specific user if authenticated.
- `status_code`: Integer (Not Null) - e.g., 404, 403, 500.
- `method`: String (Not Null) - HTTP method (GET, POST, etc.).
- `path`: String (Not Null) - The request URL path.
- `message`: Text (Not Null) - Error message or description.
- `stack_trace`: Text (Nullable) - Full stack trace, primarily for 500 errors.
- `ip_address`: String (Nullable) - Client IP.
- `user_agent`: String (Nullable) - Browser/Client info.
- `meta_data`: JSONB (Nullable) - Extra context (query params, headers).
- `created_at`: Timestamp (Default Now).

### 1.2 Update Database Index
Modify `database/index.ts` to register the new table.

- Import `SYSTEM_ERROR_LOGS` from the new schema.
- Export it in the `T` (Table Map) object.

## 2. Service Layer

### 2.1 Create System Log Service
Create `src/features/system-log/system-log.service.ts`.

**Responsibility:**
- Provide a `logError` method that takes error details and inserts them into the `system_error_logs` table using Knex (`DB` instance).

## 3. Middleware Updates

### 3.1 Update Error Middleware
Modify `src/middlewares/error.middleware.ts`.

**Changes:**
- Import `SystemLogService`.
- Inside the error handling logic, calling `SystemLogService.logError(...)` before sending the response.
- Extract `user_id` from `req.user` (if available).

### 3.2 Create Not Found Middleware
Create `src/middlewares/not-found.middleware.ts`.

**Responsibility:**
- Instead of the inline 404 handler in `app.ts`, create a dedicated middleware that:
  - Creates a `HttpException(404, 'Route not found')`.
  - Passes it to `next(error)` so that it reaches the `error.middleware.ts` and gets logged.

### 3.3 Update App.ts
Modify `src/app.ts`.

**Changes:**
- Replace the inline `*` route handler with the new `notFoundMiddleware` (or simply ensure the default handler calls `next(new HttpException(404...))`).

## 4. Migration Execution

**Command:**
`npm run migrate:schema -- system_error_logs`

## Implementation Details (Code Context)

### Schema (`database/system_error_logs.schema.ts`)
```typescript
import DB from './index';

export const SYSTEM_ERROR_LOGS = 'system_error_logs';

export const seed = async (dropFirst = false) => {
    if (dropFirst) await DB.schema.dropTableIfExists(SYSTEM_ERROR_LOGS);
    await DB.schema.createTable(SYSTEM_ERROR_LOGS, table => {
        table.bigIncrements('id').primary();
        table.integer('status_code').notNullable();
        table.string('method').notNullable();
        table.text('path').notNullable();
        table.text('message').nullable();
        table.text('stack_trace').nullable();
        table.integer('user_id').nullable();
        table.string('ip_address').nullable();
        table.text('user_agent').nullable();
        table.jsonb('meta_data').nullable();
        table.timestamp('created_at').defaultTo(DB.fn.now());
    });
};
```

### Middleware Integration (`src/middlewares/error.middleware.ts`)
```typescript
// ... imports
import { SystemLogService } from '../features/system-log/system-log.service';

const errorMiddleware = async (error: HttpException, req: Request, res: Response, next: NextFunction) => {
    // ... existing logic
    
    // Async logging (non-blocking)
    SystemLogService.logError({
        statusCode: status,
        message: message,
        path: req.originalUrl,
        method: req.method,
        userId: (req as any).user?.user_id,
        // ... other fields
    }).catch(err => logger.error('Failed to log system error to DB', err));

    // ... response
};
```
