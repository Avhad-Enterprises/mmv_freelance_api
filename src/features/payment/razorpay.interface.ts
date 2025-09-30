export interface IRazorpayOrder {
  id: string; // Razorpay order ID (e.g., "order_Qmbw69KnajNWm0")
  entity: "order";
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, any>; // Razorpay allows custom notes object
  created_at: number; // Unix timestamp
}
