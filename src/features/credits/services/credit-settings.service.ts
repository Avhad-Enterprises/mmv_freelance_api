/**
 * Credit Settings Service
 * Manages global configurations like price per credit
 */

import DB, { T } from "../../../../database/index";
import { CREDIT_CONFIG } from "../constants";

export class CreditSettingsService {

    /**
     * Get current price per credit
     * Falls back to constant if DB fetch fails
     */
    async getPricePerCredit(): Promise<number> {
        try {
            const setting = await DB(T.CREDIT_SETTINGS_TABLE)
                .where({ setting_key: 'price_per_credit' })
                .first();

            if (setting && setting.setting_value) {
                return Number(setting.setting_value);
            }
            return CREDIT_CONFIG.PRICE_PER_CREDIT;
        } catch (error) {
            console.error('Failed to fetch credit price settings:', error);
            return CREDIT_CONFIG.PRICE_PER_CREDIT;
        }
    }

    /**
     * Update price per credit
     */
    async updatePricePerCredit(price: number, adminUserId: number): Promise<void> {
        if (!price || price <= 0) {
            throw new Error('Price must be a positive number');
        }

        await DB(T.CREDIT_SETTINGS_TABLE)
            .insert({
                setting_key: 'price_per_credit',
                setting_value: price.toString(),
                description: 'Price per single credit in INR',
                updated_by: adminUserId,
                updated_at: new Date()
            }) // On conflict update
            .onConflict('setting_key')
            .merge(['setting_value', 'updated_by', 'updated_at']);
    }
}

export default CreditSettingsService;
