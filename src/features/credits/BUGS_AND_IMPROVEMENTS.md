# Credits Feature - Analysis & Improvements

## Critical Bugs / Race Conditions

1.  **Payment Fulfillment Race Condition** (`CreditsService.addCredits`)
    *   **Severity**: High
    *   **Description**: The `MAX_BALANCE` check is performed during the fulfillment phase (after payment). If a user makes parallel purchases that individually pass the checks but collectively exceed the limit, the `addCredits` transaction will fail with `MAX_BALANCE_EXCEEDED`.
    *   **Impact**: User pays money but receives no credits. Support intervention required.
    *   **Fix**: Update `addCredits` to allow exceeding the limit for *paid* transactions (soft limit), or implement a "Reservation" system before payment.

2.  **Floating Point Currency Calculation** (`CreditsController.initiatePurchase`)
    *   **Severity**: Medium
    *   **Description**: The amount calculation `credits * price * 100` relies on floating-point arithmetic without explicit rounding before sending to Razorpay (which requires integer paise).
    *   **Impact**: Potential off-by-one errors (e.g. `4999.999999` becoming `4999` instead of `5000` via truncation or rejection by gateway).
    *   **Fix**: Use `Math.round()` for the final amount.

## Logic Flaws & Inconsistencies

3.  **Code Triplication of Price Logic**
    *   **Severity**: Low (Maintenance)
    *   **Description**: Price calculation logic exists in 3 places:
        *   `CreditsService.calculatePrice`
        *   `CreditPackageService.calculatePrice`
        *   `CreditsController.initiatePurchase` (Inline)
    *   **Impact**: Maintenance risk. Changing `PRICE_PER_CREDIT` formatting or rules might be missed in one place.
    *   **Fix**: Centralize logic in `CreditPackageService` and use it everywhere.

4.  **Admin List Unbounded Limit** (`AdminCreditsController.getAllTransactions`)
    *   **Severity**: Medium
    *   **Description**: The API accepts the `limit` query parameter without an upper bound cap (unlike client API which caps at 50).
    *   **Impact**: Potential DoS if a user requests `limit=1000000`.
    *   **Fix**: Cap `limit` at 100 in the controller.

5.  **Refund Timecheck Reliability**
    *   **Severity**: Low
    *   **Description**: Refund eligibility compares DB timestamp (`created_at`) with App Server time (`new Date()`).
    *   **Impact**: If servers have clock drift or different timezones (without strict UTC enforcing), refunds might be allowed or denied incorrectly.
    *   **Fix**: Ensure standard UTC handling for all duration calculations.

## Missing Features

6.  **Credit Expiration**
    *   **Description**: The system defines an `expiry` transaction type but lacks any mechanism (cron job/scheduler) to actually expire old credits.
    *   **Action**: Implement a nightly job to check/deduct expired credits if this is a business requirement.

7.  **Atomic Bulk Refunds**
    *   **Description**: `processProjectCancellationRefunds` processes refunds linearly. A crash midway leaves the system in a partial state.
    *   **Action**: While idempotency allows safe retries, wrapping in a batch transaction or documented "retry on failure" policy is recommended.

## Recommendations

-   **Refactor**: Merge `CreditsService` and `CreditPackageService` price logic.
-   **Robustness**: Add try-catch block for `MAX_BALANCE` in `addCredits` to at least log a "CRITICAL PAYMENT FAILURE" if it happens.
-   **Security**: Audit all Admin `limit` parameters to ensure capped defaults.
