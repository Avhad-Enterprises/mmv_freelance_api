# Users Table Alteration Migration

## Overview

This migration alters the existing `users` table to clean up unused columns and rename address fields for better consistency.

## Changes Made

### Columns Removed:
- `timezone` - VARCHAR(50) - Not used in current implementation
- `category` - VARCHAR(255) - Not used in current implementation
- `address_line_second` - VARCHAR(255) - Redundant address field

### Columns Renamed:
- `address_line_first` → `address` - Simplified naming for consistency

## Migration Details

**File:** `scripts/alter-users-table.js`
**Type:** Custom table alteration migration
**Safety:** Transaction-based with rollback capability

## How to Run

### Option 1: Using npm script (Recommended)
```bash
npm run migrate:custom -- alter-users-table.js
```

### Option 2: Direct execution
```bash
npx ts-node scripts/alter-users-table.js
```

## What the Migration Does

1. **Checks existing columns** - Safely verifies which columns exist before attempting changes
2. **Renames address column** - `address_line_first` → `address`
3. **Drops unused columns** - Removes `timezone`, `category`, and `address_line_second`
4. **Verifies changes** - Confirms all changes were applied correctly
5. **Transaction safety** - All changes wrapped in database transaction

## Rollback Capability

The migration includes a rollback function that can restore the original structure:

```javascript
// To rollback (if needed)
import { down as rollback } from './alter-users-table.js';
await rollback();
```

## Before/After Schema Comparison

### Before:
```sql
users (
  user_id, first_name, last_name, username, email, password,
  phone_number, phone_verified, email_verified,
  profile_picture, bio, timezone, category,
  address_line_first, address_line_second, city, state, country, pincode,
  latitude, longitude, is_active, is_banned, is_deleted, banned_reason,
  reset_token, reset_token_expires, login_attempts, last_login_at,
  email_notifications, created_at, updated_at
)
```

### After:
```sql
users (
  user_id, first_name, last_name, username, email, password,
  phone_number, phone_verified, email_verified,
  profile_picture, bio,
  address, city, state, country, pincode,
  latitude, longitude, is_active, is_banned, is_deleted, banned_reason,
  reset_token, reset_token_expires, login_attempts, last_login_at,
  email_notifications, created_at, updated_at
)
```

## Safety Features

- ✅ **Transaction-based** - All changes in single transaction
- ✅ **Column existence checks** - Won't fail if columns don't exist
- ✅ **Data preservation** - No data loss during migration
- ✅ **Rollback capability** - Can undo changes if needed
- ✅ **Verbose logging** - Detailed progress and error reporting
- ✅ **Dry-run verification** - Checks results after migration

## Testing

### Test the migration on development first:
```bash
# On development environment
npm run migrate:custom -- alter-users-table.js

# Check the table structure
psql -d your_dev_db -c "\d users"
```

### Verify data integrity:
```sql
-- Check that all users still exist
SELECT COUNT(*) FROM users;

-- Verify address data is preserved
SELECT user_id, address, city, state, country FROM users LIMIT 5;
```

## Production Deployment

### Pre-deployment checklist:
- [ ] Backup production database
- [ ] Test migration on staging environment
- [ ] Verify no application code references removed columns
- [ ] Schedule maintenance window
- [ ] Notify team of potential brief downtime

### Deployment steps:
```bash
# 1. Backup database
pg_dump your_production_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
npm run migrate:custom -- alter-users-table.js

# 3. Verify changes
psql -d your_production_db -c "\d users"

# 4. Test application functionality
# (Login, profile updates, etc.)
```

## Troubleshooting

### Migration fails with "column does not exist"
- This is normal if columns were already removed
- The migration handles this gracefully and continues

### Migration fails with "column already exists"
- Check if migration was partially run before
- Manual cleanup may be needed

### Rollback needed
```bash
# Import and run rollback
node -e "
import('./scripts/alter-users-table.js').then(m => m.down()).then(() => console.log('Rollback complete'))
"
```

## Impact on Application Code

### Frontend Changes Needed:
- Update any forms that reference `address_line_first` to use `address`
- Remove any UI elements for `timezone` and `category` if they exist

### Backend Changes Needed:
- Update any SQL queries that reference removed columns
- Update TypeScript interfaces that include removed fields
- Update validation schemas if they reference removed fields

### Files to Check:
- Frontend forms and components
- API request/response DTOs
- Database query builders
- Validation schemas
- Type definitions

## Related Documentation

- [Users Schema](../database/users.schema.ts) - Current table structure
- [Migration Utils](../scripts/migration-utils.ts) - Migration helper functions
- [Database Index](../database/index.ts) - Database connection setup