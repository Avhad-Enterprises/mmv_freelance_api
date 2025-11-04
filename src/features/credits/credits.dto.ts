import { IsNumber, IsPositive, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO for purchasing credits
 */
export class PurchaseCreditsDto {
    @IsNumber()
    @IsPositive()
    @Min(1)
    credits_amount: number;

    @IsOptional()
    @IsString()
    payment_reference?: string;
}

/**
 * Response DTO for credits balance
 */
export class CreditsBalanceDto {
    credits_balance: number;
    total_credits_purchased: number;
    credits_used: number;
}