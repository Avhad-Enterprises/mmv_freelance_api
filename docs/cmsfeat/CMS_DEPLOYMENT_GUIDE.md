2025-12-24# CMS Feature - Production Deployment Guide

## 🎯 CURRENT STATUS

### ✅ COMPLETED (Production-Ready Components)

1. **Type Safety & Interfaces** - `cms.types.ts`
   - Fully typed interfaces for all entities
   - Enum for section types
   - Validation constants
   - No `any` types in new code

2. **Input Validation** - `cms.validators.ts`  
   - XSS sanitization
   - URL format validation  
   - Rating bounds (1-5)
   - Skills/tags array validation
   - String length constraints
   - Metadata size limits

3. **DTOs with Validation** - `cms.dto.ts`
   - 100% coverage with class-validator decorators
   - Custom error messages
   - Type constraints (IsInt, IsUrl, MaxLength, etc.)
   - Required vs Optional fields

4. **Rate Limiting** - `cms.ratelimit.ts`
   - Per-IP limiting for public endpoints
   - Per-user limiting for admin endpoints  
   - Configurable limits and windows
   - Retry-After headers

5. **Caching Layer** - `cms.cache.ts`
   - In-memory cache with TTL
   - Pattern-based invalidation
   - Auto-cleanup mechanism
   - Production-ready (scalable to Redis)

6. **Audit Logging** - `cms.logger.ts`
   - Structured JSON logs
   - Audit trail for all operations
   - Development vs production modes
   - Ready for log aggregators (ELK, Datadog)

### ⚠️ REQUIRES UPDATES (In Progress)

1. **Service Layer** - `cms.service.ts.backup`
   - ✅ Has basic CRUD
   - ❌ Needs transaction wrapping
   - ❌ Needs cache integration
   - ❌ Needs validation calls
   - ❌ Needs audit logging
   - ❌ Needs row locking for reorder

2. **Controller Layer** - `cms.controller.ts`
   - ✅ Has all endpoints
   - ❌ Uses `(req as any).user`
   - ❌ Has `|| 1` fallbacks
   - ❌ Needs AuthenticatedRequest type
   - ❌ Needs proper error logging

3. **Routes Layer** - `cms.routes.ts`
   - ✅ Has all routes defined
   - ❌ **CRITICAL**: Hero endpoints have NO AUTH
   - ❌ Missing rate limiters
   - ❌ Needs proper middleware chains

## 🔧 IMPLEMENTATION STEPS

### Step 1: Install Dependencies

```bash
cd "d:\Avhad Intern Project\MMV Freelancing\mmv_freelance_api"
npm install validator
npm install --save-dev @types/validator
```

### Step 2: Fix Routes (CRITICAL - Security)

Open `src/features/cms/cms.routes.ts` and apply these changes:

```typescript
// REMOVE this comment block (lines 33-37):
// HERO SECTION (TEMPORARILY NO AUTH FOR TESTING - RESTORE LATER!)

// REPLACE all hero routes with:
this.router.get(
    `${this.path}/hero`, 
    rateLimiters.adminRead,                    // ADD THIS
    requireRole('SUPER_ADMIN', 'ADMIN'),       // ADD THIS  
    this.controller.getAllHero
);

this.router.post(
    `${this.path}/hero`, 
    rateLimiters.adminWrite,                   // ADD THIS
    requireRole('SUPER_ADMIN', 'ADMIN'),       // ADD THIS
    validationMiddleware(CreateHeroDto, 'body', true, []), 
    this.controller.createHero
);

// Apply same pattern to PUT and DELETE hero routes
```

Add import at top:
```typescript
import rateLimiters from './cms.ratelimit';
```

Add rate limiters to public routes:
```typescript
this.router.get(
    `${this.path}/public`, 
    rateLimiters.public,  // ADD THIS
    this.controller.getActiveLandingPageContent
);
```

### Step 3: Fix Controller

Open `src/features/cms/cms.controller.ts`:

```typescript
// CHANGE imports:
import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./cms.types";  // ADD THIS
import { cmsLogger } from "./cms.logger";            // ADD THIS

// CHANGE all method signatures from:
public createHero = async (req: Request, res: Response, next: NextFunction)

// TO:
public createHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction)

// CHANGE all data assignments from:
const heroData: CreateHeroDto = { 
    ...req.body, 
    created_by: (req as any).user?.user_id || 1  // REMOVE THIS
};

// TO:
if (!req.user?.user_id) {
    return next(new HttpException(401, 'Unauthorized'));
}
const heroData: CreateHeroDto = { 
    ...req.body, 
    created_by: req.user.user_id  // CLEAN
};

// ADD logging in catch blocks:
catch (error) {
    cmsLogger.error('CREATE_HERO_FAILED', error as Error, {
        userId: req.user?.user_id,
        sectionType: 'hero'
    });
    next(error);
}
```

### Step 4: Update Service

Open `src/features/cms/cms.service.ts.backup` and rename to `cms.service.ts`:

For EACH create/update method, add validation:

```typescript
import { 
    validateUrl, validateRating, validateSortOrder, 
    validateSkills, validateTags, validateMetadata, 
    sanitizeObject 
} from './cms.validators';
import { cmsCache, CACHE_KEYS } from './cms.cache';
import { cmsLogger } from './cms.logger';

public async createHero(data: CreateHeroDto): Promise<CmsItem> {
    // 1. Validate
    if (data.primary_button_link) validateUrl(data.primary_button_link, 'Primary button link');
    if (data.secondary_button_link) validateUrl(data.secondary_button_link, 'Secondary button link');
    if (data.background_image) validateUrl(data.background_image, 'Background image');
    if (data.hero_image) validateUrl(data.hero_image, 'Hero image');
    if (data.sort_order !== undefined) validateSortOrder(data.sort_order);
    if (data.custom_data) validateMetadata(data.custom_data);
    
    // 2. Sanitize
    const sanitized = sanitizeObject(data);
    
    // 3. Insert
    const [inserted] = await DB(T.CMS).insert({
        section_type: SectionType.HERO,
        ...sanitized,
        is_active: data.is_active ?? true,
        is_deleted: false
    }).returning("*");
    
    // 4. Clear cache
    cmsCache.deletePattern('hero');
    cmsCache.delete(CACHE_KEYS.LANDING_PAGE_CONTENT);
    
    // 5. Audit log
    cmsLogger.auditCreate('hero', inserted.cms_id, data.created_by);
    
    return inserted;
}
```

For GET methods, add caching:

```typescript
public async getActiveHero(): Promise<CmsItem[]> {
    // Check cache
    const cached = cmsCache.get<CmsItem[]>(CACHE_KEYS.ACTIVE_HERO);
    if (cached) {
        cmsLogger.debug('CACHE_HIT', { key: CACHE_KEYS.ACTIVE_HERO });
        return cached;
    }
    
    // Query DB
    const data = await DB(T.CMS)
        .where({ section_type: SectionType.HERO, is_active: true, is_deleted: false })
        .orderBy('sort_order', 'asc');
    
    // Store in cache
    cmsCache.set(CACHE_KEYS.ACTIVE_HERO, data);
    
    return data;
}
```

For reorder methods, add transactions and locking:

```typescript
public async reorderTrustedCompanies(data: BulkReorderDto): Promise<ReorderResult> {
    // Transaction with row locking
    return await DB.transaction(async (trx) => {
        // Lock rows to prevent concurrent modifications
        const items = await trx(T.CMS)
            .whereIn('cms_id', data.items.map(i => i.id))
            .where({ section_type: SectionType.TRUSTED_COMPANY, is_deleted: false })
            .forUpdate();  // ROW LOCK
        
        if (items.length !== data.items.length) {
            throw new HttpException(400, 'Some items not found or already deleted');
        }
        
        // Validate all sort orders
        data.items.forEach(item => validateSortOrder(item.sort_order));
        
        // Update in transaction
        const promises = data.items.map(item =>
            trx(T.CMS)
                .where({ cms_id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );
        
        await Promise.all(promises);
        
        // Clear cache
        cmsCache.deletePattern('trusted_company');
        cmsCache.delete(CACHE_KEYS.LANDING_PAGE_CONTENT);
        
        return { 
            message: "Reorder successful", 
            count: data.items.length,
            updated: data.items.map(i => i.id)
        };
    });
}
```

### Step 5: Testing

Create `cms.test.ts`:

```typescript
import { validateUrl, validateRating, sanitizeHtml } from './cms.validators';

describe('CMS Validators', () => {
    test('validateUrl rejects javascript: protocol', () => {
        expect(() => validateUrl('javascript:alert(1)', 'test'))
            .toThrow('test contains invalid protocol');
    });
    
    test('sanitizeHtml removes script tags', () => {
        const dirty = '<script>alert(1)</script>Hello';
        expect(sanitizeHtml(dirty)).toBe('Hello');
    });
    
    test('validateRating enforces 1-5 range', () => {
        expect(() => validateRating(0)).toThrow('Rating must be between 1 and 5');
        expect(() => validateRating(6)).toThrow('Rating must be between 1 and 5');
        expect(() => validateRating(3)).not.toThrow();
    });
});
```

### Step 6: Environment Variables

Add to `.env`:

```env
# CMS Configuration
CMS_CACHE_TTL=300000          # 5 minutes in milliseconds
CMS_RATE_LIMIT_PUBLIC=100     # Requests per window
CMS_RATE_LIMIT_ADMIN=300
CMS_RATE_LIMIT_BULK=20
CMS_LOG_LEVEL=info            # debug | info | warn | error
```

### Step 7: API Documentation

Add Swagger decorators or create OpenAPI spec in `docs/openapi/cms.yaml`:

```yaml
/api/v1/cms-landing/hero:
  post:
    summary: Create hero section
    security:
      - BearerAuth: []
    tags:
      - CMS - Hero
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CreateHeroDto'
    responses:
      201:
        description: Hero created successfully
      400:
        description: Validation error
      401:
        description: Unauthorized
      429:
        description: Rate limit exceeded
```

## 📊 PRODUCTION READINESS CHECKLIST

### Security
- [x] Input validation on all fields
- [x] XSS sanitization
- [x] URL protocol validation
- [ ] Add authentication to ALL admin routes
- [ ] Remove `|| 1` fallback patterns
- [x] Rate limiting implemented
- [ ] CSRF protection (if using sessions)
- [ ] SQL injection protection (using parameterized queries)

### Performance
- [x] Caching layer implemented
- [ ] Cache integrated in service
- [ ] Database indexes (check schema)
- [ ] Connection pooling configured
- [ ] Query optimization
- [ ] Load testing completed

### Reliability
- [ ] Transaction wrapping for bulk ops
- [ ] Row locking for concurrent updates
- [ ] Proper error handling
- [x] Audit logging
- [ ] Monitoring and alerts
- [ ] Backup strategy

### Code Quality
- [x] TypeScript strict mode
- [x] No `any` types (in new code)
- [x] Comprehensive validation
- [ ] Unit test coverage >80%
- [ ] Integration tests
- [ ] Code review completed
- [ ] Documentation updated

### DevOps
- [ ] CI/CD pipeline
- [ ] Staging environment testing
- [ ] Database migration tested
- [ ] Rollback plan documented
- [ ] Health check endpoint
- [ ] Metrics collection

## 🚀 DEPLOYMENT COMMANDS

```bash
# 1. Install dependencies
npm install

# 2. Run database migration
npm run migrate:schema -- cms

# 3. Run tests
npm test -- cms

# 4. Build
npm run build

# 5. Start production
NODE_ENV=production npm start
```

## 📈 MONITORING

Key metrics to track:

1. **Request Rate**: Requests/second by endpoint
2. **Response Time**: p50, p95, p99 latencies
3. **Error Rate**: 4xx and 5xx responses
4. **Cache Hit Rate**: % of cache hits vs misses
5. **Database Queries**: Query count and duration
6. **Rate Limit Hits**: How often users hit limits

## 🔍 TROUBLESHOOTING

### Issue: "Unauthorized" on hero endpoints
**Solution**: Check that `requireRole` middleware is applied and JWT token is valid

### Issue: "Too many requests"
**Solution**: Increase rate limits in `cms.ratelimit.ts` or wait for window to reset

### Issue: Stale cache data
**Solution**: Cache invalidation is automatic on CREATE/UPDATE/DELETE. Manual clear: `cmsCache.clear()`

### Issue: Validation errors
**Solution**: Check DTO validation rules match your data. See error message for specific field

## 📞 SUPPORT

For issues or questions:
- Check logs in `logs/` directory  
- Review audit trail for data changes
- Check rate limit headers in responses
- Enable debug logging: Set `CMS_LOG_LEVEL=debug`

---

**REMEMBER**: Do NOT deploy until authentication is fixed on hero endpoints!
