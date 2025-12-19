/**
 * Credit System Constants
 * Fixed Pricing: 1 Credit = ₹50 INR
 */

export const CREDIT_CONFIG = {
    // Pricing (Fixed: 1 credit = ₹50)
    PRICE_PER_CREDIT: 50,
    CURRENCY: 'INR',

    // Limits
    MIN_PURCHASE: 1,
    MAX_SINGLE_PURCHASE: 200,
    MAX_BALANCE: 1000,
    CREDITS_PER_APPLICATION: 1,

    // Rate limits
    MAX_OPERATIONS_PER_MINUTE: 100,
    MAX_PURCHASES_PER_HOUR: 100,

    // Refund policy
    FULL_REFUND_MINUTES: 30,      // 100% refund within 30 min
    PARTIAL_REFUND_HOURS: 24,     // 50% refund within 24 hr
    PARTIAL_REFUND_PERCENT: 50,
};

export const CREDIT_PACKAGES = [
    {
        id: 1,
        name: 'Starter',
        credits: 5,
        price: 250,  // 5 × ₹50
        description: 'Perfect for trying out the platform'
    },
    {
        id: 2,
        name: 'Basic',
        credits: 10,
        price: 500,  // 10 × ₹50
        description: 'Great for regular freelancers',
        popular: true
    },
    {
        id: 3,
        name: 'Pro',
        credits: 25,
        price: 1250, // 25 × ₹50
        description: 'For active professionals'
    },
    {
        id: 4,
        name: 'Business',
        credits: 50,
        price: 2500, // 50 × ₹50
        description: 'Best value for power users'
    },
];

export type CreditPackage = typeof CREDIT_PACKAGES[number];
