/**
 * Credits Service - Core Business Logic
 * Handles freelancer credits management with transaction safety
 */

import DB, { T } from "../../../../database/index";
import HttpException from "../../../exceptions/HttpException";
import { CREDIT_CONFIG, CREDIT_PACKAGES } from "../constants";
import {
    CreditBalance,
    CreditOperationResult,
    InsufficientCreditsError
} from "../interfaces";
import CreditLoggerService from "./credit-logger.service";
import { CreditSettingsService } from "./credit-settings.service";

export class CreditsService {
    private logger = new CreditLoggerService();
    private settingsService = new CreditSettingsService();

    /**
     * Get freelancer credits balance
     */
    public async getCreditsBalance(user_id: number): Promise<CreditBalance & { signup_bonus_claimed?: boolean }> {
        const freelancerProfile = await DB(T.FREELANCER_PROFILES)
            .where({ user_id })
            .select('credits_balance', 'total_credits_purchased', 'credits_used', 'signup_bonus_claimed')
            .first();

        if (!freelancerProfile) {
            throw new HttpException(404, "Freelancer profile not found");
        }

        return freelancerProfile;
    }

    /**
     * Add credits to freelancer account (after payment verified)
     * Uses transaction with row locking to prevent race conditions
     */
    public async addCredits(
        user_id: number,
        creditsToAdd: number,
        paymentReference?: string
    ): Promise<CreditOperationResult> {
        if (!Number.isInteger(creditsToAdd) || creditsToAdd <= 0) {
            throw new HttpException(400, "Credits must be a positive integer");
        }

        if (creditsToAdd > CREDIT_CONFIG.MAX_SINGLE_PURCHASE) {
            throw new HttpException(400, `Maximum ${CREDIT_CONFIG.MAX_SINGLE_PURCHASE} credits per purchase`);
        }

        return await DB.transaction(async (trx) => {
            const currentProfile = await trx(T.FREELANCER_PROFILES)
                .where({ user_id })
                .select('credits_balance', 'total_credits_purchased')
                .forUpdate()
                .first();

            if (!currentProfile) {
                throw new HttpException(404, "Freelancer profile not found");
            }

            const newBalance = currentProfile.credits_balance + creditsToAdd;
            const newTotalPurchased = currentProfile.total_credits_purchased + creditsToAdd;

            // Soft limit: Allow exceeding max balance if it's a paid transaction (prevent money loss)
            // Only enforce hard limit for manual/system additions without payment reference
            if (newBalance > CREDIT_CONFIG.MAX_BALANCE && !paymentReference) {
                throw new HttpException(400, {
                    code: 'MAX_BALANCE_EXCEEDED',
                    message: `Cannot exceed maximum balance of ${CREDIT_CONFIG.MAX_BALANCE} credits`,
                    currentBalance: currentProfile.credits_balance,
                    attemptedAdd: creditsToAdd,
                    maxAllowed: CREDIT_CONFIG.MAX_BALANCE - currentProfile.credits_balance
                });
            } else if (newBalance > CREDIT_CONFIG.MAX_BALANCE && paymentReference) {
                // Log warning for overflow
                console.warn(`[CREDIT_OVERFLOW] User ${user_id} exceeded max balance via paid transaction ${paymentReference}. New Balance: ${newBalance}`);
            }

            await trx(T.FREELANCER_PROFILES)
                .where({ user_id })
                .update({
                    credits_balance: newBalance,
                    total_credits_purchased: newTotalPurchased,
                    updated_at: trx.fn.now()
                });

            await this.logger.log({
                user_id,
                transaction_type: 'purchase',
                amount: creditsToAdd,
                balance_before: currentProfile.credits_balance,
                balance_after: newBalance,
                reference_type: 'payment',
                payment_transaction_id: paymentReference,
                description: `Purchased ${creditsToAdd} credits`
            }, trx);

            return {
                credits_balance: newBalance,
                total_credits_purchased: newTotalPurchased
            };
        });
    }

    /**
     * Deduct credits from freelancer account
     * Uses transaction with row locking to prevent double-spending
     */
    public async deductCredits(
        user_id: number,
        creditsToDeduct: number,
        projectId: number
    ): Promise<CreditOperationResult> {
        if (!Number.isInteger(creditsToDeduct) || creditsToDeduct <= 0) {
            throw new HttpException(400, "Credits to deduct must be a positive integer");
        }

        return await DB.transaction(async (trx) => {
            const currentProfile = await trx(T.FREELANCER_PROFILES)
                .where({ user_id })
                .select('credits_balance', 'credits_used')
                .forUpdate()
                .first();

            if (!currentProfile) {
                throw new HttpException(404, "Freelancer profile not found");
            }

            if (currentProfile.credits_balance < creditsToDeduct) {
                const errorDetails: any = { // Relaxed type for now
                    code: 'INSUFFICIENT_CREDITS',
                    message: 'Insufficient credits balance',
                    required: creditsToDeduct,
                    available: currentProfile.credits_balance,
                    shortfall: creditsToDeduct - currentProfile.credits_balance,
                    purchaseUrl: '/api/v1/credits/packages'
                };
                throw new HttpException(400, errorDetails);
            }

            const newBalance = currentProfile.credits_balance - creditsToDeduct;
            const newCreditsUsed = currentProfile.credits_used + creditsToDeduct;

            await trx(T.FREELANCER_PROFILES)
                .where({ user_id })
                .update({
                    credits_balance: newBalance,
                    credits_used: newCreditsUsed,
                    updated_at: trx.fn.now()
                });

            await this.logger.log({
                user_id,
                transaction_type: 'deduction',
                amount: -creditsToDeduct,
                balance_before: currentProfile.credits_balance,
                balance_after: newBalance,
                reference_type: 'application',
                reference_id: projectId,
                description: `Applied to project #${projectId}`
            }, trx);

            return {
                credits_balance: newBalance,
                credits_used: newCreditsUsed
            };
        });
    }

    /**
     * Check if user has enough credits
     */
    public async hasEnoughCredits(user_id: number, required: number): Promise<boolean> {
        try {
            const profile = await DB(T.FREELANCER_PROFILES)
                .where({ user_id })
                .select('credits_balance')
                .first();
            return profile && profile.credits_balance >= required;
        } catch {
            return false;
        }
    }

    /**
     * Get available packages with dynamic pricing
     */
    public async getPackages() {
        const pricePerCredit = await this.settingsService.getPricePerCredit();

        // Dynamic package pricing
        const packages = CREDIT_PACKAGES.map(pkg => ({
            ...pkg,
            price: pkg.price || (pkg.credits * pricePerCredit)
        }));

        return {
            packages,
            pricePerCredit,
            currency: CREDIT_CONFIG.CURRENCY,
            limits: {
                minPurchase: CREDIT_CONFIG.MIN_PURCHASE,
                maxPurchase: CREDIT_CONFIG.MAX_SINGLE_PURCHASE,
                maxBalance: CREDIT_CONFIG.MAX_BALANCE
            }
        };
    }

    /**
     * Calculate price for given credits
     */
    public async calculatePrice(credits: number): Promise<{ credits: number; price: number; currency: string }> {
        const pricePerCredit = await this.settingsService.getPricePerCredit();
        return {
            credits,
            price: credits * pricePerCredit,
            currency: CREDIT_CONFIG.CURRENCY
        };
    }

    /**
     * Validate if user can purchase given credits
     */
    public async canPurchase(user_id: number, credits: number): Promise<{ canPurchase: boolean; reason?: string }> {
        if (credits < CREDIT_CONFIG.MIN_PURCHASE) {
            return { canPurchase: false, reason: `Minimum ${CREDIT_CONFIG.MIN_PURCHASE} credit(s) required` };
        }

        if (credits > CREDIT_CONFIG.MAX_SINGLE_PURCHASE) {
            return { canPurchase: false, reason: `Maximum ${CREDIT_CONFIG.MAX_SINGLE_PURCHASE} credits per purchase` };
        }

        const currentBalance = await this.getCreditsBalance(user_id);
        if (currentBalance.credits_balance + credits > CREDIT_CONFIG.MAX_BALANCE) {
            return {
                canPurchase: false,
                reason: `Cannot exceed maximum balance of ${CREDIT_CONFIG.MAX_BALANCE} credits`
            };
        }

        return { canPurchase: true };
    }

    /**
     * Get credit transaction history
     */
    public async getHistory(
        user_id: number,
        options: { limit?: number; offset?: number; type?: string } = {}
    ) {
        return await this.logger.getHistory(user_id, options as any);
    }

    /**
     * Get history count for pagination
     */
    public async getHistoryCount(
        user_id: number,
        options: { type?: string } = {}
    ) {
        return await this.logger.getHistoryCount(user_id, options as any);
    }
}

export default CreditsService;
