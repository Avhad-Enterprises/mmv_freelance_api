/**
 * Credit Package Service
 * Handles credit package management
 */

import { CREDIT_CONFIG, CREDIT_PACKAGES, CreditPackage } from "../constants";

export class CreditPackageService {

    /**
     * Get all available packages
     */
    public getPackages(): {
        packages: typeof CREDIT_PACKAGES;
        pricePerCredit: number;
        currency: string;
        limits: {
            minPurchase: number;
            maxPurchase: number;
            maxBalance: number;
        };
    } {
        return {
            packages: CREDIT_PACKAGES,
            pricePerCredit: CREDIT_CONFIG.PRICE_PER_CREDIT,
            currency: CREDIT_CONFIG.CURRENCY,
            limits: {
                minPurchase: CREDIT_CONFIG.MIN_PURCHASE,
                maxPurchase: CREDIT_CONFIG.MAX_SINGLE_PURCHASE,
                maxBalance: CREDIT_CONFIG.MAX_BALANCE
            }
        };
    }

    /**
     * Get package by ID
     */
    public getPackageById(packageId: number): CreditPackage | undefined {
        return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    }

    /**
     * Calculate price for custom credits
     */
    public calculatePrice(credits: number): {
        credits: number;
        price: number;
        currency: string;
        priceFormatted: string;
    } {
        const price = credits * CREDIT_CONFIG.PRICE_PER_CREDIT;
        return {
            credits,
            price,
            currency: CREDIT_CONFIG.CURRENCY,
            priceFormatted: `₹${price.toLocaleString('en-IN')}`
        };
    }

    /**
     * Validate package selection
     */
    public validatePackage(packageId: number): {
        valid: boolean;
        package?: CreditPackage;
        error?: string;
    } {
        const pkg = this.getPackageById(packageId);

        if (!pkg) {
            return { valid: false, error: 'Package not found' };
        }

        return { valid: true, package: pkg };
    }

    /**
     * Get recommended package based on usage
     */
    public getRecommendedPackage(averageMonthlyApplications: number): CreditPackage {
        if (averageMonthlyApplications <= 5) {
            return CREDIT_PACKAGES[0]; // Starter
        } else if (averageMonthlyApplications <= 10) {
            return CREDIT_PACKAGES[1]; // Basic
        } else if (averageMonthlyApplications <= 25) {
            return CREDIT_PACKAGES[2]; // Pro
        } else {
            return CREDIT_PACKAGES[3]; // Business
        }
    }
}

export default CreditPackageService;
