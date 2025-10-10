# 🚀 MMV Freelance API - Migration System

Complete database migration and seeding system for the MMV Freelance platform.

## 📚 **Table of Contents**
- [Quick Start](#-quick-start)
- [Migration Commands](#-migration-commands)
- [Understanding Migration Output](#-understanding-migration-output)
- [RBAC Seeding](#-rbac-seeding)
- [Troubleshooting](#-troubleshooting)

## 🏃 **Quick Start**

### Fresh Database Setup
```bash
# Complete fresh setup (recommended for new installations)
npm run migrate:all --drop

# Check migration status
npm run migrate:status
```

### Update Existing Database
```bash
# Migrate only new/pending schemas
npm run migrate:all

# Check what's pending
npm run migrate:status
```

## 📋 **Migration Commands**

### Main Commands
```bash
# Migrate all schemas + auto-seed RBAC data
npm run migrate:all

# Fresh install (drop all tables first)
npm run migrate:all --drop

# Migrate specific schema
npm run migrate:schema -- <schema_name>

# Check migration status
npm run migrate:status

# Reset migration tracking (dangerous!)
npx ts-node scripts/reset-migrations.ts
```

### Examples
```bash
# Migrate just the user profiles
npm run migrate:schema -- client_profiles

# Force recreate a specific table
npm run migrate:schema -- freelancer_profiles --drop

# Verbose output (show all database messages)
npm run migrate:all --verbose
```

## 🎯 **Understanding Migration Output**

### ✅ **Expected Messages (NOT Errors)**

The migration system shows various messages that look like errors but are actually normal:

#### 1. **"Table does not exist" (Code: 42P01)**
```
error: drop table "skills" - table "skills" does not exist
✅ Successfully migrated skill
```
- **Why**: Migration tries to drop table before creating (safety measure)
- **Outcome**: Creates the table successfully
- **Action**: None needed - this is expected behavior

#### 2. **"Cannot drop table" (Code: 2BP01)**
```
error: cannot drop table role because other objects depend on it
✅ Successfully migrated role
```
- **Why**: Foreign key relationships prevent dropping
- **Outcome**: Preserves existing table and data
- **Action**: None needed - protects data integrity

#### 3. **"Already exists" (Code: 42P07)**
```
error: relation "email_logs" already exists
✅ Successfully migrated emailog
```
- **Why**: Table was created by dependency or previous run
- **Outcome**: Marks as successfully migrated
- **Action**: None needed - table is ready

### ❌ **Actual Problems**

Real errors will:
- Stop the migration process
- Show a clear error message without "✅ Successfully migrated"
- Exit with code 1

## 🔐 **RBAC Seeding**

The migration system automatically seeds Role-Based Access Control data:

### What Gets Seeded
- **5 Roles**: CLIENT, VIDEOGRAPHER, VIDEO_EDITOR, ADMIN, SUPER_ADMIN
- **40+ Permissions**: Covering all system features
- **102 Role-Permission Mappings**: Proper access control

### Automatic Seeding
RBAC data is automatically seeded after successful migrations:
```bash
🌱 Starting RBAC data seeding...
🌱 Seeding roles...
   ✅ Inserted 5 roles
🌱 Seeding permissions...
   ✅ Inserted 40 permissions
🌱 Seeding role-permission mappings...
   ✅ Inserted 102 role-permission mappings
✅ RBAC seeding completed
```

### Manual RBAC Seeding
```bash
# Seed roles only
npx ts-node scripts/seed-roles.ts

# Seed permissions only
npx ts-node scripts/seed-permissions.ts

# Seed role-permission mappings
npx ts-node scripts/seed-role-permissions.ts

# Complete RBAC setup
npm run seed:rbac
```

## 🛠 **Migration Order**

Schemas are migrated in dependency order:

1. **Lookup Tables**: country, states, city, skill, niches, category, tags
2. **Core Tables**: users, role, permission
3. **Profile Tables**: freelancer_profiles, client_profiles, admin_profiles, etc.
4. **Relationship Tables**: user_role, role_permission
5. **Feature Tables**: projects, applications, reviews, etc.
6. **Log Tables**: visitor_logs, emailog

## 🔧 **Troubleshooting**

### Common Issues

#### 1. **Foreign Key Constraint Errors**
```bash
# Use CASCADE drop for dependent tables
npm run migrate:all --drop
```

#### 2. **Migration Tracking Issues**
```bash
# Reset tracking and re-migrate
npx ts-node scripts/reset-migrations.ts
npm run migrate:all
```

#### 3. **Partial Migration Failures**
```bash
# Check status first
npm run migrate:status

# Migrate specific failed schema
npm run migrate:schema -- <failed_schema>
```

#### 4. **Database Connection Issues**
Check your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=mmv_freelance
DB_USER=your_user
DB_PASSWORD=your_password
```

### Migration Flags

| Flag | Description | Example |
|------|-------------|---------|
| `--drop` | Drop tables before creating | `npm run migrate:all --drop` |
| `--verbose` | Show detailed database output | `npm run migrate:all --verbose` |

### Database Schema Status

Check which schemas need migration:
```bash
npm run migrate:status
```

Example output:
```
📊 Schema Migration Status

┌─────────────────────────┬────────────┬─────────────────────┬──────────────────────┐
│ Schema                  │ Status     │ Version             │ Migrated At          │
├─────────────────────────┼────────────┼─────────────────────┼──────────────────────┤
│ users                   │ ✅ Migrated │ 2.0.0 - Architecture│ 10/2/2025, 12:20:10 AM │
│ client_profiles         │ ✅ Migrated │ 1.0.0 - Initial cli│ 10/2/2025, 12:20:31 AM │
│ freelancer_profiles     │ ❌ Pending  │ -                   │ -                    │
└─────────────────────────┴────────────┴─────────────────────┴──────────────────────┘

📈 Summary: 45/46 migrated, 1 pending
```

## 📁 **File Structure**

```
scripts/
├── migrate-all.ts          # Main migration runner
├── migrate-schema.ts       # Single schema migration
├── migrate-status.ts       # Check migration status
├── reset-migrations.ts     # Reset tracking (danger!)
└── seed-*.ts              # RBAC seeding scripts

database/
├── *.schema.ts            # Individual table schemas
└── seeds/
    └── rbac.seed.ts       # Role-based access control data
```

## 🎯 **Best Practices**

1. **Always check status first**: `npm run migrate:status`
2. **Use --drop for fresh installs**: `npm run migrate:all --drop`
3. **Test migrations on development first**
4. **Backup production before migrating**
5. **The "error" messages are normal** - look for ✅ success indicators

## 📞 **Need Help?**

- Check the migration status: `npm run migrate:status`
- Look for ✅ success indicators in output
- Real errors will stop the process and show clear messages
- The verbose flag shows more details: `--verbose`

---

🎉 **Your database is ready when you see**: 
```
🎉 Migration completed!
📊 Summary: 45 migrated, 0 skipped
✅ RBAC seeding completed
```