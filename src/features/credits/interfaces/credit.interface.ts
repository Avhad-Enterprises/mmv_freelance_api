/**
 * Credit System Interfaces
 */

// Credit balance interface
export interface CreditBalance {
    credits_balance: number;
    total_credits_purchased: number;
    credits_used: number;
}

// Credit operation result
export interface CreditOperationResult {
    credits_balance: number;
    credits_used?: number;
    total_credits_purchased?: number;
}

// Insufficient credits error details
export interface InsufficientCreditsError {
    code: string;
    message: string;
    required: number;
    available: number;
    shortfall: number;
    purchaseUrl: string;
}

// Credit transaction log entry
export interface CreditLogEntry {
    user_id: number;
    transaction_type: CreditTransactionType;
    amount: number;
    balance_before: number;
    balance_after: number;
    reference_type?: CreditReferenceType;
    reference_id?: number;
    payment_gateway?: string;
    payment_order_id?: string;
    payment_transaction_id?: string;
    payment_amount?: number;
    payment_currency?: string;
    package_id?: number;
    package_name?: string;
    admin_user_id?: number;
    admin_reason?: string;
    ip_address?: string;
    user_agent?: string;
    description?: string;
}

// Credit history entry (returned to user)
export interface CreditHistoryEntry {
    transaction_id: number;
    transaction_type: CreditTransactionType;
    amount: number;
    balance_after: number;
    description: string;
    created_at: Date;
    reference_type?: string;
    reference_id?: number;
}

// Options for getting credit history
export interface CreditHistoryOptions {
    limit?: number;
    offset?: number;
    type?: CreditTransactionType;
    from?: Date;
    to?: Date;
}

// Refund eligibility result
export interface RefundEligibility {
    eligible: boolean;
    refundAmount: number;
    refundPercent: number;
    reason?: string;
    originalCredits: number;
}

// Refund result
export interface RefundResult {
    success: boolean;
    refundAmount: number;
    newBalance: number;
    message: string;
}

// Transaction types
export type CreditTransactionType =
    | 'purchase'
    | 'deduction'
    | 'refund'
    | 'admin_add'
    | 'admin_deduct'
    | 'expiry'
    | 'signup_bonus';

// Reference types
export type CreditReferenceType =
    | 'payment'
    | 'application'
    | 'admin'
    | 'system'
    | 'signup';

// Refund reasons
export enum RefundReason {
    WITHDRAWAL = 'withdrawal',
    PROJECT_CANCELLED = 'project_cancelled',
    PROJECT_EXPIRED = 'project_expired',
    TECHNICAL_ERROR = 'technical_error',
    ADMIN_REFUND = 'admin_refund',
    DUPLICATE_APPLICATION = 'duplicate'
}
