/**
 * Credits DTOs - Validation Classes
 */

import { IsNumber, IsPositive, IsOptional, IsString, Min, Max, IsInt, Matches, MinLength } from 'class-validator';
import { CREDIT_CONFIG } from '../constants';

/**
 * DTO for initiating credit purchase
 * Used when user selects credits/package to buy
 */
export class InitiatePurchaseDto {
    @IsInt({ message: 'Credits must be a whole number' })
    @IsPositive({ message: 'Credits must be positive' })
    @Min(CREDIT_CONFIG.MIN_PURCHASE, { message: `Minimum ${CREDIT_CONFIG.MIN_PURCHASE} credit(s) required` })
    @Max(CREDIT_CONFIG.MAX_SINGLE_PURCHASE, { message: `Maximum ${CREDIT_CONFIG.MAX_SINGLE_PURCHASE} credits per purchase` })
    credits_amount: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    package_id?: number;
}

/**
 * DTO for verifying completed payment
 * Used after Razorpay payment completion
 */
export class VerifyPaymentDto {
    @IsString()
    @Matches(/^order_[a-zA-Z0-9]{14,}$/, { message: 'Invalid Razorpay order ID format' })
    razorpay_order_id: string;

    @IsString()
    @Matches(/^pay_[a-zA-Z0-9]{14,}$/, { message: 'Invalid Razorpay payment ID format' })
    razorpay_payment_id: string;

    @IsString()
    razorpay_signature: string;
}

/**
 * DTO for admin credit adjustment
 */
export class AdminCreditAdjustmentDto {
    @IsInt()
    @IsPositive()
    user_id: number;

    @IsInt()
    @Min(-1000)
    @Max(1000)
    amount: number; // Positive to add, negative to deduct

    @IsString()
    @MinLength(10, { message: 'Reason must be at least 10 characters' })
    reason: string;
}

/**
 * Response DTO for credits balance
 */
export class CreditsBalanceDto {
    credits_balance: number;
    total_credits_purchased: number;
    credits_used: number;
}

/**
 * Legacy DTO - kept for backward compatibility
 * @deprecated Use InitiatePurchaseDto instead
 */
export class PurchaseCreditsDto {
    @IsInt()
    @IsPositive()
    @Min(1)
    @Max(CREDIT_CONFIG.MAX_SINGLE_PURCHASE)
    credits_amount: number;

    @IsOptional()
    @IsString()
    payment_reference?: string;
}
