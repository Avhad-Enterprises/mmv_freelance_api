import { Request, Response, NextFunction } from 'express';
import CreditsService from './credits.service';
import { RequestWithUser } from '../../interfaces/auth.interface';
import HttpException from '../../exceptions/HttpException';

/**
 * Credits Controller
 * Handles freelancer credits management endpoints
 */
export class CreditsController {
    private creditsService = new CreditsService();

    /**
     * Get freelancer credits balance
     * GET /api/v1/credits/balance
     */
    public getCreditsBalance = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const credits = await this.creditsService.getCreditsBalance(user_id);

            res.status(200).json({
                success: true,
                data: credits,
                message: "Credits balance retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Purchase credits (add credits to balance)
     * POST /api/v1/credits/purchase
     */
    public purchaseCredits = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { credits_amount, payment_reference } = req.body;

            if (!credits_amount || credits_amount <= 0) {
                throw new HttpException(400, "Valid credits_amount is required");
            }

            const result = await this.creditsService.addCredits(
                user_id,
                credits_amount,
                payment_reference
            );

            res.status(200).json({
                success: true,
                data: result,
                message: `${credits_amount} credits added successfully`
            });
        } catch (error) {
            next(error);
        }
    };
}