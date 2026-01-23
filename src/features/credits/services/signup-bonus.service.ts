/**
 * Signup Bonus Service
 * Handles giving free credits (keys) to new freelancers on registration
 * 
 * This service is responsible for:
 * - Giving 5 free keys to new video editors and videographers
 * - Ensuring bonus is only given once per user
 * - Logging the transaction for audit trail
 */

import DB, { T } from "../../../../database/index";
import { CreditLoggerService } from "./credit-logger.service";

// Constants
const SIGNUP_BONUS_CREDITS = 5;
const FREELANCER_ROLES = ['VIDEOGRAPHER', 'VIDEO_EDITOR'];

export class SignupBonusService {
    private logger: CreditLoggerService;

    constructor() {
        this.logger = new CreditLoggerService();
    }

    /**
     * Give signup bonus to a new freelancer
     * This should be called after a freelancer profile is created
     * 
     * @param userId - The user ID of the new freelancer
     * @param roleName - The role name (VIDEOGRAPHER or VIDEO_EDITOR)
     * @param trx - Optional transaction object for atomic operations
     * @returns Object with success status and bonus details
     */
    async giveSignupBonus(
        userId: number,
        roleName: string,
        trx?: any
    ): Promise<{ success: boolean; creditsAdded: number; message: string }> {
        // Only give bonus to freelancer roles
        if (!FREELANCER_ROLES.includes(roleName.toUpperCase())) {
            return {
                success: false,
                creditsAdded: 0,
                message: 'Signup bonus is only available for freelancers (Videographer/Video Editor)'
            };
        }

        const db = trx || DB;

        try {
            // Get freelancer profile
            const freelancerProfile = await db(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .first();

            if (!freelancerProfile) {
                console.warn(`[SignupBonus] Freelancer profile not found for user ${userId}`);
                return {
                    success: false,
                    creditsAdded: 0,
                    message: 'Freelancer profile not found'
                };
            }

            // Check if bonus was already claimed
            if (freelancerProfile.signup_bonus_claimed) {
                console.log(`[SignupBonus] Bonus already claimed for user ${userId}`);
                return {
                    success: false,
                    creditsAdded: 0,
                    message: 'Signup bonus already claimed'
                };
            }

            // Calculate new balance
            const currentBalance = freelancerProfile.credits_balance || 0;
            const newBalance = currentBalance + SIGNUP_BONUS_CREDITS;

            // Update freelancer profile with bonus
            await db(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .update({
                    credits_balance: newBalance,
                    signup_bonus_claimed: true,
                    updated_at: db.fn.now()
                });

            // Log the transaction
            await this.logger.log({
                user_id: userId,
                transaction_type: 'signup_bonus',
                amount: SIGNUP_BONUS_CREDITS,
                balance_before: currentBalance,
                balance_after: newBalance,
                reference_type: 'signup',
                description: `Welcome bonus: ${SIGNUP_BONUS_CREDITS} free keys for new ${roleName.toLowerCase().replace('_', ' ')} registration`
            }, db);

            console.log(`[SignupBonus] Successfully gave ${SIGNUP_BONUS_CREDITS} keys to user ${userId} (${roleName})`);

            return {
                success: true,
                creditsAdded: SIGNUP_BONUS_CREDITS,
                message: `Welcome! You've received ${SIGNUP_BONUS_CREDITS} free keys to get started.`
            };

        } catch (error: any) {
            console.error(`[SignupBonus] Error giving signup bonus to user ${userId}:`, error.message);
            // Don't throw - signup bonus failure shouldn't break registration
            return {
                success: false,
                creditsAdded: 0,
                message: 'Failed to apply signup bonus'
            };
        }
    }

    /**
     * Check if a user has claimed their signup bonus
     * 
     * @param userId - The user ID to check
     * @returns Boolean indicating if bonus was claimed
     */
    async hasClaimedBonus(userId: number): Promise<boolean> {
        const freelancerProfile = await DB(T.FREELANCER_PROFILES)
            .where({ user_id: userId })
            .select('signup_bonus_claimed')
            .first();

        return freelancerProfile?.signup_bonus_claimed || false;
    }

    /**
     * Get signup bonus amount (for display purposes)
     */
    getBonusAmount(): number {
        return SIGNUP_BONUS_CREDITS;
    }
}

// Export singleton instance
export const signupBonusService = new SignupBonusService();
