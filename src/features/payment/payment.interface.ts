export interface ITransaction {
    id: number;
    transaction_type: "escrow" | "payout" | "refund";
    transaction_status: "pending" | "completed" | "failed";
    project_id?: number;
    application_id?: number;
    payer_id?: number;
    payee_id?: number;
    amount: number;
    currency?: string; // e.g., "INR", "USD"
    payment_gateway?: string; // e.g., "Razorpay", "Stripe"
    gateway_transaction_id?: string; // External reference ID
    description?: string;
    created_at?: string;
}
