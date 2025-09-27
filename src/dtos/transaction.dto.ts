import {
    IsEnum,
    IsOptional,
    IsInt,
    IsNumber,
    IsString,
    IsNotEmpty
} from "class-validator";

export enum TransactionType {
    ESCROW = "escrow",
    PAYOUT = "payout",
    REFUND = "refund"
}

export enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}

class TransactionDto {
    @IsOptional({ groups: ["create", "update"] })
    @IsInt()
    id?: number;

    @IsEnum(TransactionType, { groups: ["create"] })
    transaction_type: TransactionType;

    @IsEnum(TransactionStatus, { groups: ["create"] })
    transaction_status: TransactionStatus;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create"] })
    project_id?: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create"] })
    application_id?: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create"] })
    payer_id?: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsInt({ groups: ["create"] })
    payee_id?: number;

    @IsNumber({}, { groups: ["create"] })
    amount: number;

    @IsOptional({ groups: ["create", "update"] })
    @IsString({ groups: ["create", "update"] })
    currency?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString({ groups: ["create", "update"] })
    payment_gateway?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString({ groups: ["create", "update"] })
    gateway_transaction_id?: string;

    @IsOptional({ groups: ["create", "update"] })
    @IsString()
    description?: string;
}

export { TransactionDto };
