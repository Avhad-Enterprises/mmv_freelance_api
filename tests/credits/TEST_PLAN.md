# Credits Feature - Test Plan

## Overview
Comprehensive test coverage for the Credit Management System.

### Testing Framework
- **JavaScript-based tests** using existing `test-utils.js` infrastructure
- Tests run via `node tests/credits/run-credits-tests.js`
- Integration with existing test runner

---

## Folder Structure

```
tests/credits/
├── run-credits-tests.js           # Main test runner
├── README.md                      # This file
│
├── services/                       # Service unit tests
│   ├── test-credits-service.js     
│   ├── test-credit-logger-service.js
│   ├── test-credit-refund-service.js
│   └── test-credit-package-service.js
│
├── api/                            # API integration tests
│   ├── test-balance-api.js         # GET /credits/balance
│   ├── test-packages-api.js        # GET /credits/packages
│   ├── test-initiate-purchase-api.js # POST /credits/initiate-purchase
│   ├── test-verify-payment-api.js  # POST /credits/verify-payment
│   ├── test-history-api.js         # GET /credits/history
│   ├── test-refund-eligibility-api.js # GET /credits/refund-eligibility/:id
│   └── test-refunds-api.js         # GET /credits/refunds
│
├── admin/                          # Admin API tests
│   ├── test-admin-transactions-api.js  # GET /admin/credits/transactions
│   ├── test-admin-adjust-api.js        # POST /admin/credits/adjust
│   ├── test-admin-analytics-api.js     # GET /admin/credits/analytics
│   ├── test-admin-user-credits-api.js  # GET /admin/credits/user/:id
│   ├── test-admin-refund-project-api.js # POST /admin/credits/refund-project/:id
│   └── test-admin-export-api.js        # GET /admin/credits/export
│
├── integration/                    # End-to-end flows
│   ├── test-purchase-flow.js       # Complete purchase flow
│   ├── test-apply-deduct-flow.js   # Apply to project → deduct credits
│   ├── test-withdrawal-refund-flow.js # Withdraw → refund flow
│   └── test-project-cancellation-refund.js # Bulk refund flow
│
└── security/                       # Security tests
    ├── test-rate-limiting.js       # Rate limiter verification
    ├── test-auth-protection.js     # Auth requirement tests
    ├── test-ownership-validation.js # User can't access others' data
    └── test-idempotency.js         # Payment idempotency tests
```

---

## Test Categories

### 1. Service Unit Tests (services/)

#### test-credits-service.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `getCreditsBalance_validUser` | Get balance for existing user | Returns balance object |
| `getCreditsBalance_invalidUser` | Get balance for non-existent user | 404 error |
| `addCredits_validAmount` | Add credits to user | Balance increases correctly |
| `addCredits_exceedsMax` | Add credits exceeding max balance | MAX_BALANCE_EXCEEDED error |
| `addCredits_negativeAmount` | Try adding negative credits | 400 error |
| `addCredits_zeroAmount` | Try adding zero credits | 400 error |
| `deductCredits_sufficientBalance` | Deduct when balance available | Balance decreases |
| `deductCredits_insufficientBalance` | Deduct more than balance | INSUFFICIENT_CREDITS error |
| `hasEnoughCredits_true` | Check with sufficient balance | Returns true |
| `hasEnoughCredits_false` | Check with insufficient balance | Returns false |
| `calculatePrice_validCredits` | Calculate price for credits | Correct price (credits × ₹50) |

#### test-credit-logger-service.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `log_purchaseTransaction` | Log purchase transaction | Entry created in DB |
| `log_deductionTransaction` | Log credit deduction | Entry created with negative amount |
| `log_refundTransaction` | Log refund | Entry created with 'refund' type |
| `getHistory_pagination` | Get history with pagination | Correct page/limit |
| `getHistory_filterByType` | Filter by transaction type | Only matching types returned |
| `isPaymentProcessed_notProcessed` | Check unprocessed payment | Returns false |
| `isPaymentProcessed_alreadyProcessed` | Check processed payment | Returns true |

#### test-credit-refund-service.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `checkEligibility_within30min` | Check within 30 min | 100% refund eligible |
| `checkEligibility_within24hr` | Check between 30min-24hr | 50% refund eligible |
| `checkEligibility_after24hr` | Check after 24 hours | 0% refund (not eligible) |
| `checkEligibility_projectCancelled` | Project cancelled reason | 100% refund always |
| `checkEligibility_alreadyRefunded` | Already refunded app | Not eligible |
| `processRefund_eligible` | Process eligible refund | Credits restored, status updated |
| `processRefund_notEligible` | Process ineligible refund | REFUND_NOT_ELIGIBLE error |
| `processProjectRefunds_bulkRefund` | Bulk refund for project | All applications refunded |

#### test-credit-package-service.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `getPackages_returnsAll` | Get all packages | 4 packages returned |
| `getPackageById_valid` | Get existing package | Package returned |
| `getPackageById_invalid` | Get non-existent package | undefined |
| `calculatePrice_formula` | Verify price calculation | credits × 50 |

---

### 2. API Integration Tests (api/)

#### test-balance-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_without_auth` | Request without token | 401 Unauthorized |
| `GET_with_client_role` | Request with client token | 403 Forbidden |
| `GET_with_freelancer_role` | Request with videographer token | 200 with balance |
| `GET_response_structure` | Verify response fields | All required fields present |
| `GET_balance_logic` | Verify balance calculation | balance = purchased - used |

#### test-packages-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_packages` | Get all packages | 200 with packages array |
| `GET_packages_structure` | Verify package structure | id, name, credits, price |
| `GET_packages_pricing` | Verify pricing formula | price = credits × 50 |
| `GET_packages_limits` | Verify limits in response | min/max purchase, max balance |

#### test-initiate-purchase-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `POST_with_credits_amount` | Purchase custom credits | Razorpay order created |
| `POST_with_package_id` | Purchase package | Uses package credits/price |
| `POST_exceed_max_purchase` | >200 credits | 400 error |
| `POST_below_min_purchase` | 0 credits | 400 error |
| `POST_would_exceed_max_balance` | Would exceed 1000 | 400 error |
| `POST_invalid_package_id` | Non-existent package | 400 error |
| `POST_response_structure` | Verify response | order_id, amount, key_id |

#### test-history-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_history_default` | Get history without params | Returns transactions |
| `GET_history_pagination` | Get with page/limit | Correct pagination |
| `GET_history_filter_type` | Filter by type | Only matching transactions |
| `GET_history_empty` | User with no transactions | Empty array |

#### test-refund-eligibility-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_own_application` | Check eligibility for own app | Returns eligibility info |
| `GET_others_application` | Check eligibility for others' app | 404 or eligibility false |
| `GET_nonexistent_application` | Invalid application ID | Application not found |

---

### 3. Admin API Tests (admin/)

#### test-admin-transactions-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_without_admin_role` | Request with freelancer token | 403 Forbidden |
| `GET_with_admin_role` | Request with admin token | 200 with transactions |
| `GET_filter_by_user` | Filter by user_id | Only that user's transactions |
| `GET_filter_by_type` | Filter by type | Only matching types |
| `GET_filter_by_date` | Filter by date range | Only transactions in range |
| `GET_pagination` | Paginated results | Correct page/limit |
| `GET_sorting` | Sort by different fields | Correctly sorted |

#### test-admin-adjust-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `POST_add_credits` | Add credits to user | Balance increased |
| `POST_deduct_credits` | Deduct credits from user | Balance decreased |
| `POST_would_go_negative` | Deduct more than balance | Error - negative balance |
| `POST_would_exceed_max` | Add exceeding max | Error - exceeds max |
| `POST_missing_reason` | Without reason | 400 validation error |
| `POST_short_reason` | Reason < 10 chars | 400 validation error |
| `POST_zero_amount` | Amount = 0 | 400 error |
| `POST_audit_logged` | Verify audit trail | Transaction logged |

#### test-admin-analytics-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `GET_overview` | Get analytics | Credits in circulation, revenue |
| `GET_transactions_by_type` | Breakdown by type | Counts per type |
| `GET_daily_stats` | Daily statistics | Last 7 days stats |
| `GET_top_users` | Top users by purchase | Top 10 sorted correctly |
| `GET_date_range` | Filter by date range | Only data in range |

#### test-admin-refund-project-api.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `POST_valid_project` | Refund cancelled project | All apps refunded |
| `POST_invalid_project` | Non-existent project | 404 error |
| `POST_no_applications` | Project with no apps | 0 refunded |
| `POST_some_already_refunded` | Some apps already refunded | Only new ones refunded |

---

### 4. Integration Tests (integration/)

#### test-purchase-flow.js
Complete end-to-end flow:
1. Get initial balance → 0
2. Get packages → verify available
3. Initiate purchase → get order_id
4. (Mock) Webhook called → credits added
5. Verify payment → confirm balance increased
6. Get history → purchase transaction visible

#### test-apply-deduct-flow.js
1. Add credits to user (admin)
2. Get balance → verify credits
3. Apply to project → 1 credit deducted
4. Get balance → verify 1 less
5. Get history → deduction transaction visible

#### test-withdrawal-refund-flow.js
1. Add credits and apply to project
2. Withdraw immediately (< 30 min)
3. Verify 100% refund
4. Apply again, wait, withdraw
5. Verify 0% refund (simulated time)

---

### 5. Security Tests (security/)

#### test-rate-limiting.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `creditOperations_limit10perMin` | 11 requests in 1 min | 429 on 11th |
| `purchase_limit5perHour` | 6 purchases in 1 hour | 429 on 6th |

#### test-auth-protection.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `all_endpoints_require_auth` | All endpoints without token | 401 |
| `freelancer_endpoints_require_role` | Client accessing freelancer routes | 403 |
| `admin_endpoints_require_admin` | Freelancer accessing admin | 403 |

#### test-ownership-validation.js
| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| `cant_view_others_balance` | Access another user's balance | Only own balance |
| `cant_refund_others_application` | Refund another's application | 403 or not found |
| `cant_verify_others_payment` | Verify another's payment | 403 |

---

## Test Data Requirements

### Test Users
1. **Videographer** - For freelancer credit operations
2. **Video Editor** - For cross-role testing
3. **Client** - For negative role tests
4. **Admin** - For admin operations
5. **Super Admin** - For super admin tests

### Test Constants
```javascript
const TEST_CONFIG = {
  CREDIT_PRICE: 50,          // ₹50 per credit
  MIN_PURCHASE: 1,
  MAX_PURCHASE: 200,
  MAX_BALANCE: 1000,
  FULL_REFUND_MINUTES: 30,
  PARTIAL_REFUND_HOURS: 24,
  PARTIAL_REFUND_PERCENT: 50
};
```

---

## Execution Order

1. **Setup** - Create test users & initial data
2. **Services** - Unit test services
3. **API** - Test individual endpoints
4. **Admin** - Test admin endpoints
5. **Integration** - Test complete flows
6. **Security** - Test protection mechanisms
7. **Cleanup** - Remove test data

---

## Commands

```bash
# Run all credits tests
node tests/credits/run-credits-tests.js

# Run specific test file
node tests/credits/api/test-balance-api.js

# Run with verbose output
VERBOSE=true node tests/credits/run-credits-tests.js

# Run with full response on errors
SHOW_FULL_RESPONSE=true node tests/credits/run-credits-tests.js
```

---

## Coverage Metrics Target

| Category | Target Coverage |
|----------|-----------------|
| Services | 90%+ |
| API Endpoints | 100% |
| Business Logic | 95%+ |
| Error Handling | 80%+ |
| Security | 100% |

---

## Next Steps

1. Review and approve this test plan
2. Implement test files one by one
3. Run and verify all tests pass
4. Add to CI/CD pipeline
