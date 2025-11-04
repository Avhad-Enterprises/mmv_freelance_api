// Credits Service - Handles freelancer credits management
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";

/**
 * Credits Service
 * Manages freelancer credits for project applications
 */
export class CreditsService {

  /**
   * Get freelancer credits balance
   */
  public async getCreditsBalance(user_id: number): Promise<{
    credits_balance: number;
    total_credits_purchased: number;
    credits_used: number;
  }> {
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .select('credits_balance', 'total_credits_purchased', 'credits_used')
      .first();

    if (!freelancerProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    return freelancerProfile;
  }

  /**
   * Add credits to freelancer account (purchase credits)
   */
  public async addCredits(
    user_id: number,
    creditsToAdd: number,
    paymentReference?: string
  ): Promise<{
    credits_balance: number;
    total_credits_purchased: number;
  }> {
    if (creditsToAdd <= 0) {
      throw new HttpException(400, "Credits to add must be positive");
    }

    // Get current values
    const currentProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .select('credits_balance', 'total_credits_purchased')
      .first();

    if (!currentProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    const newBalance = currentProfile.credits_balance + creditsToAdd;
    const newTotalPurchased = currentProfile.total_credits_purchased + creditsToAdd;

    // Update the profile
    const result = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .update({
        credits_balance: newBalance,
        total_credits_purchased: newTotalPurchased,
        updated_at: DB.fn.now()
      })
      .returning(['credits_balance', 'total_credits_purchased']);

    if (!result || result.length === 0) {
      throw new HttpException(500, "Failed to add credits");
    }

    return result[0];
  }

  /**
   * Deduct credits from freelancer account (when applying to project)
   */
  public async deductCredits(
    user_id: number,
    creditsToDeduct: number,
    projectId: number
  ): Promise<{
    credits_balance: number;
    credits_used: number;
  }> {
    if (creditsToDeduct <= 0) {
      throw new HttpException(400, "Credits to deduct must be positive");
    }

    // Get current values
    const currentProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .select('credits_balance', 'credits_used')
      .first();

    if (!currentProfile) {
      throw new HttpException(404, "Freelancer profile not found");
    }

    if (currentProfile.credits_balance < creditsToDeduct) {
      throw new HttpException(400, "Insufficient credits balance");
    }

    const newBalance = currentProfile.credits_balance - creditsToDeduct;
    const newCreditsUsed = currentProfile.credits_used + creditsToDeduct;

    // Deduct credits
    const result = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .update({
        credits_balance: newBalance,
        credits_used: newCreditsUsed,
        updated_at: DB.fn.now()
      })
      .returning(['credits_balance', 'credits_used']);

    if (!result || result.length === 0) {
      throw new HttpException(500, "Failed to deduct credits");
    }

    return result[0];
  }

  /**
   * Check if freelancer has enough credits for application
   */
  public async hasEnoughCredits(user_id: number, requiredCredits: number): Promise<boolean> {
    const freelancerProfile = await DB(T.FREELANCER_PROFILES)
      .where({ user_id })
      .select('credits_balance')
      .first();

    if (!freelancerProfile) {
      return false;
    }

    return freelancerProfile.credits_balance >= requiredCredits;
  }

  /**
   * Get credit transaction history (future implementation)
   */
  // public async getCreditHistory(user_id: number): Promise<any[]> {
  //   // TODO: Implement credit transaction history
  //   return [];
  // }

  /**
   * Log credit transaction (future implementation)
   */
  // private async logCreditTransaction(
  //   user_id: number,
  //   type: 'purchase' | 'application' | 'refund',
  //   amount: number,
  //   reference?: string
  // ): Promise<void> {
  //   // TODO: Implement credit transaction logging
  // }
}

export default CreditsService;