# Credits Feature - RBAC Integration

## Overview

The Credits feature has been updated to use the **Dynamic RBAC** system with permission-based access control instead of hardcoded role checks.

## Permission Structure

### Freelancer Permissions (VIDEOGRAPHER, VIDEO_EDITOR)

| Permission | Endpoint | Description |
|------------|----------|-------------|
| `credits.view_own` | GET /credits/balance | View own credit balance |
| `credits.view_packages` | GET /credits/packages | View available credit packages |
| `credits.purchase` | POST /credits/initiate-purchase | Purchase credits |
| `credits.purchase` | POST /credits/verify-payment | Verify payment |
| `credits.view_history` | GET /credits/history | View transaction history |
| `credits.request_refund` | GET /credits/refund-eligibility/:id | Check refund eligibility |
| `credits.request_refund` | GET /credits/refunds | View own refunds |

### Admin Permissions (ADMIN, SUPER_ADMIN)

| Permission | Endpoint | Description | Critical |
|------------|----------|-------------|----------|
| `credits.admin.view_all` | GET /admin/credits/transactions | View all transactions | No |
| `credits.admin.view_all` | GET /admin/credits/user/:id | View user's credits | No |
| `credits.admin.adjust` | POST /admin/credits/adjust | Add/deduct credits | **Yes** |
| `credits.admin.analytics` | GET /admin/credits/analytics | View analytics | No |
| `credits.admin.refund` | POST /admin/credits/refund-project/:id | Refund project | **Yes** |
| `credits.admin.export` | GET /admin/credits/export | Export CSV | No |

## Implementation

### Routes

```typescript
// Before (hardcoded role check)
import { requireRole } from '../../../middlewares/role.middleware';
const freelancerAuth = requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR');

// After (dynamic permission check)
import { requirePermission } from '../../../middlewares/permission.middleware';
requirePermission('credits.view_own')
```

### Route Examples

```typescript
// GET /credits/balance
this.router.get(
    `${this.path}/balance`,
    requirePermission('credits.view_own'),
    creditOperationsLimiter,
    this.creditsController.getCreditsBalance
);

// POST /admin/credits/adjust
this.router.post(
    `${this.path}/adjust`,
    requirePermission('credits.admin.adjust'),
    validationMiddleware(AdminCreditAdjustmentDto),
    this.controller.adjustCredits
);
```

## Database Changes

### New Permissions Added

```sql
-- 8 new permissions in the 'permission' table:
credits.view_packages
credits.view_history
credits.request_refund
credits.admin.view_all
credits.admin.adjust
credits.admin.analytics
credits.admin.refund
credits.admin.export
```

### Role Mappings Updated

| Role | Permissions |
|------|-------------|
| VIDEOGRAPHER | credits.view_own, credits.purchase, credits.view_packages, credits.view_history, credits.request_refund |
| VIDEO_EDITOR | credits.view_own, credits.purchase, credits.view_packages, credits.view_history, credits.request_refund |
| ADMIN | credits.admin.* (all 5 admin permissions) |
| SUPER_ADMIN | All permissions (wildcard bypass) |

## Migration Commands

```bash
# Add new permissions
npm run migrate:schema -- permission

# Sync role-permission mappings
npm run migrate:schema -- role_permission
```

## API Response on Access Denied

```json
{
  "success": false,
  "message": "Access denied. Required permission: credits.view_own"
}
```

## Benefits

1. **Granular Control**: Each action has its own permission
2. **Zero Latency**: Permissions checked from JWT, no DB queries
3. **Dynamic Assignment**: Admins can modify permissions without code changes
4. **Audit Trail**: Permission changes are logged
5. **Super Admin Bypass**: SUPER_ADMIN always has access

## Files Changed

- `src/features/credits/routes/credits.routes.ts` - User routes
- `src/features/credits/routes/admin-credits.routes.ts` - Admin routes
- `database/permission.schema.ts` - New permissions
- `database/role_permission.schema.ts` - Role mappings
- `docs/rbac/4-permission-catalog.md` - Documentation

## Testing

To run the credits tests, ensure:
1. **Admin User exists**: The tests strictly require an admin user with credentials `admin@mmvfreelance.com` / `Admin@123456`.
   - Run setup: `npx ts-node scripts/create-super-admin.ts --email admin@mmvfreelance.com --password Admin@123456 --first-name Admin --last-name User`
2. **Rate Limits**: For extensive testing, rate limits in `src/features/credits/constants/credit.constants.ts` (specifically `MAX_PURCHASES_PER_HOUR`) should be increased (e.g., to 100) to avoid 429 Too Many Requests errors.

### Command
```bash
node tests/credits/run-credits-tests.js
```

### Coverage
- **API Tests**: Balance, Packages, Purchase, History, Refund Eligibility, Refunds
- **Admin Tests**: Transactions, Adjustments, Analytics, User Credits, Project Refunds, Export
- **Security Tests**: Auth Protection, Role Validation, Ownership, Rate Limiting
- **Integration Tests**: Full deduct/apply flow

**Status**: ✅ 100% Pass (117/117 tests)
