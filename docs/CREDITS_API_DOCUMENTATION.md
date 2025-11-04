# Credits API Documentation

## Overview
The Credits API manages freelancer credits for project applications. Freelancers (Videographers and Video Editors) can purchase credits and use them to apply for projects. Each project application costs 1 credit.

## Endpoints

### GET /api/v1/credits/balance
Get the current credits balance for authenticated freelancer.

**Authentication:** Required (VIDEOGRAPHER or VIDEO_EDITOR role)
**Method:** GET
**URL:** `/api/v1/credits/balance`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "credits_balance": 25,
    "total_credits_purchased": 40,
    "credits_used": 15
  },
  "message": "Credits balance retrieved successfully"
}
```

**Error Responses:**
- `401`: Authentication token missing
- `403`: Insufficient permissions (not VIDEOGRAPHER/VIDEO_EDITOR)
- `404`: Freelancer profile not found

---

### POST /api/v1/credits/purchase
Purchase credits and add them to freelancer's balance.

**Authentication:** Required (VIDEOGRAPHER or VIDEO_EDITOR role)
**Method:** POST
**URL:** `/api/v1/credits/purchase`

**Request Body:**
```json
{
  "credits_amount": 25,
  "payment_reference": "PAY-12345" // optional
}
```

**Validation Rules:**
- `credits_amount`: Required, must be a positive number (minimum: 1)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "credits_balance": 50,
    "total_credits_purchased": 65
  },
  "message": "25 credits added successfully"
}
```

**Error Responses:**
- `400`: Invalid credits_amount (negative, zero, or missing)
- `401`: Authentication token missing
- `403`: Insufficient permissions
- `404`: Freelancer profile not found
- `500`: Failed to add credits

## Implementation Details

### Database Schema
Credits are stored in the `freelancer_profiles` table with these columns:
- `credits_balance`: Current available credits (integer, default: 0)
- `total_credits_purchased`: Total credits ever purchased (integer, default: 0)
- `credits_used`: Total credits used for applications (integer, default: 0)

### Business Logic
- **Credits Balance**: `credits_balance = total_credits_purchased - credits_used`
- **Application Cost**: Each project application deducts 1 credit
- **Credit Validation**: System checks sufficient credits before allowing application
- **Atomic Operations**: Credit deductions are atomic with application creation

### Integration Points

#### Applied Projects Service
When a freelancer applies for a project:
1. System checks if freelancer has sufficient credits (≥ 1)
2. If sufficient, deducts 1 credit from balance
3. Increments `credits_used` counter
4. Creates application record

**Code Reference:**
```typescript
// Check credits before application
const hasEnoughCredits = await this.creditsService.hasEnoughCredits(
    data.user_id,
    CREDITS_PER_APPLICATION // = 1
);

// Deduct credits on successful application
await this.creditsService.deductCredits(
    data.user_id,
    CREDITS_PER_APPLICATION,
    data.projects_task_id
);
```

### Service Methods

#### CreditsService
- `getCreditsBalance(user_id)`: Returns current balance, total purchased, and used credits
- `addCredits(user_id, amount, reference?)`: Adds credits to balance and updates total purchased
- `deductCredits(user_id, amount, projectId)`: Deducts credits from balance and updates used counter
- `hasEnoughCredits(user_id, requiredAmount)`: Checks if user has sufficient credits

### Security & Access Control
- Endpoints require authentication
- Restricted to VIDEOGRAPHER and VIDEO_EDITOR roles only
- All operations are user-scoped (users can only access their own credits)

### Error Handling
- Comprehensive validation on all inputs
- Atomic database transactions for credit operations
- Proper error messages for frontend consumption
- Rollback on failure scenarios

### Testing
Complete test coverage includes:
- Authentication validation
- Input validation (negative, zero, missing values)
- Business logic verification
- Response structure validation
- Integration testing with application workflow

## Frontend Integration Notes

1. **Check Balance**: Call `/credits/balance` to display current credits
2. **Purchase Flow**: Use `/credits/purchase` after payment processing
3. **Application Flow**: Credits are automatically deducted when applying for projects
4. **Error Handling**: Handle 401 (auth), 403 (permissions), 400 (validation) appropriately
5. **UI Updates**: Refresh balance after purchases and applications

## Future Enhancements
- Credit transaction history
- Credit refund functionality
- Bulk credit purchases
- Credit expiration policies