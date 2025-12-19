import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import {
    CreateHeroDto, UpdateHeroDto,
    CreateTrustedCompanyDto, UpdateTrustedCompanyDto,
    CreateWhyChooseUsDto, UpdateWhyChooseUsDto,
    CreateFeaturedCreatorDto, UpdateFeaturedCreatorDto,
    CreateSuccessStoryDto, UpdateSuccessStoryDto,
    CreateLandingFaqDto, UpdateLandingFaqDto,
    BulkReorderDto, DeleteItemDto
} from "./cms-landing.dto";

export class CmsLandingService {

    // ==================== HERO SECTION ====================

    /**
     * Get all hero sections
     */
    public async getAllHero(): Promise<any[]> {
        return await DB(T.CMS_HERO)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active hero sections (for frontend)
     */
    public async getActiveHero(): Promise<any[]> {
        return await DB(T.CMS_HERO)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get hero section by ID
     */
    public async getHeroById(id: number): Promise<any> {
        const hero = await DB(T.CMS_HERO)
            .where({ id, is_deleted: false })
            .first();
        if (!hero) throw new HttpException(404, "Hero section not found");
        return hero;
    }

    /**
     * Create hero section
     */
    public async createHero(data: CreateHeroDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Hero data is empty");

        const heroData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_HERO).insert(heroData).returning("*");
        return inserted;
    }

    /**
     * Update hero section
     */
    public async updateHero(data: UpdateHeroDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Hero ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_HERO)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "Hero section not found");
        return updated;
    }

    /**
     * Delete hero section (soft delete)
     */
    public async deleteHero(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Hero ID is required");

        const [deleted] = await DB(T.CMS_HERO)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "Hero section not found");
        return deleted;
    }

    // ==================== TRUSTED COMPANIES ====================

    /**
     * Get all trusted companies
     */
    public async getAllTrustedCompanies(): Promise<any[]> {
        return await DB(T.CMS_TRUSTED_COMPANIES)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active trusted companies (for frontend)
     */
    public async getActiveTrustedCompanies(): Promise<any[]> {
        return await DB(T.CMS_TRUSTED_COMPANIES)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get trusted company by ID
     */
    public async getTrustedCompanyById(id: number): Promise<any> {
        const company = await DB(T.CMS_TRUSTED_COMPANIES)
            .where({ id, is_deleted: false })
            .first();
        if (!company) throw new HttpException(404, "Trusted company not found");
        return company;
    }

    /**
     * Create trusted company
     */
    public async createTrustedCompany(data: CreateTrustedCompanyDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Company data is empty");

        const companyData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_TRUSTED_COMPANIES).insert(companyData).returning("*");
        return inserted;
    }

    /**
     * Update trusted company
     */
    public async updateTrustedCompany(data: UpdateTrustedCompanyDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Company ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_TRUSTED_COMPANIES)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "Trusted company not found");
        return updated;
    }

    /**
     * Delete trusted company (soft delete)
     */
    public async deleteTrustedCompany(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Company ID is required");

        const [deleted] = await DB(T.CMS_TRUSTED_COMPANIES)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "Trusted company not found");
        return deleted;
    }

    /**
     * Reorder trusted companies
     */
    public async reorderTrustedCompanies(data: BulkReorderDto): Promise<any> {
        if (!data.items || !data.items.length) {
            throw new HttpException(400, "Items array is required");
        }

        const updates = data.items.map(item =>
            DB(T.CMS_TRUSTED_COMPANIES)
                .where({ id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );

        await Promise.all(updates);
        return { message: "Reorder successful", count: data.items.length };
    }

    // ==================== WHY CHOOSE US ====================

    /**
     * Get all why choose us items
     */
    public async getAllWhyChooseUs(): Promise<any[]> {
        return await DB(T.CMS_WHY_CHOOSE_US)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active why choose us items (for frontend)
     */
    public async getActiveWhyChooseUs(): Promise<any[]> {
        return await DB(T.CMS_WHY_CHOOSE_US)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get why choose us item by ID
     */
    public async getWhyChooseUsById(id: number): Promise<any> {
        const item = await DB(T.CMS_WHY_CHOOSE_US)
            .where({ id, is_deleted: false })
            .first();
        if (!item) throw new HttpException(404, "Why choose us item not found");
        return item;
    }

    /**
     * Create why choose us item
     */
    public async createWhyChooseUs(data: CreateWhyChooseUsDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Why choose us data is empty");

        const itemData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_WHY_CHOOSE_US).insert(itemData).returning("*");
        return inserted;
    }

    /**
     * Update why choose us item
     */
    public async updateWhyChooseUs(data: UpdateWhyChooseUsDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Item ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_WHY_CHOOSE_US)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "Why choose us item not found");
        return updated;
    }

    /**
     * Delete why choose us item (soft delete)
     */
    public async deleteWhyChooseUs(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Item ID is required");

        const [deleted] = await DB(T.CMS_WHY_CHOOSE_US)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "Why choose us item not found");
        return deleted;
    }

    /**
     * Reorder why choose us items
     */
    public async reorderWhyChooseUs(data: BulkReorderDto): Promise<any> {
        if (!data.items || !data.items.length) {
            throw new HttpException(400, "Items array is required");
        }

        const updates = data.items.map(item =>
            DB(T.CMS_WHY_CHOOSE_US)
                .where({ id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );

        await Promise.all(updates);
        return { message: "Reorder successful", count: data.items.length };
    }

    // ==================== FEATURED CREATORS ====================

    /**
     * Get all featured creators
     */
    public async getAllFeaturedCreators(): Promise<any[]> {
        return await DB(T.CMS_FEATURED_CREATORS)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active featured creators (for frontend)
     */
    public async getActiveFeaturedCreators(): Promise<any[]> {
        return await DB(T.CMS_FEATURED_CREATORS)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get featured creator by ID
     */
    public async getFeaturedCreatorById(id: number): Promise<any> {
        const creator = await DB(T.CMS_FEATURED_CREATORS)
            .where({ id, is_deleted: false })
            .first();
        if (!creator) throw new HttpException(404, "Featured creator not found");
        return creator;
    }

    /**
     * Create featured creator
     */
    public async createFeaturedCreator(data: CreateFeaturedCreatorDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Creator data is empty");

        const creatorData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_FEATURED_CREATORS).insert(creatorData).returning("*");
        return inserted;
    }

    /**
     * Update featured creator
     */
    public async updateFeaturedCreator(data: UpdateFeaturedCreatorDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Creator ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_FEATURED_CREATORS)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "Featured creator not found");
        return updated;
    }

    /**
     * Delete featured creator (soft delete)
     */
    public async deleteFeaturedCreator(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Creator ID is required");

        const [deleted] = await DB(T.CMS_FEATURED_CREATORS)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "Featured creator not found");
        return deleted;
    }

    /**
     * Reorder featured creators (drag & drop)
     */
    public async reorderFeaturedCreators(data: BulkReorderDto): Promise<any> {
        if (!data.items || !data.items.length) {
            throw new HttpException(400, "Items array is required");
        }

        const updates = data.items.map(item =>
            DB(T.CMS_FEATURED_CREATORS)
                .where({ id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );

        await Promise.all(updates);
        return { message: "Reorder successful", count: data.items.length };
    }

    // ==================== SUCCESS STORIES ====================

    /**
     * Get all success stories
     */
    public async getAllSuccessStories(): Promise<any[]> {
        return await DB(T.CMS_SUCCESS_STORIES)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active success stories (for frontend)
     */
    public async getActiveSuccessStories(): Promise<any[]> {
        return await DB(T.CMS_SUCCESS_STORIES)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get success story by ID
     */
    public async getSuccessStoryById(id: number): Promise<any> {
        const story = await DB(T.CMS_SUCCESS_STORIES)
            .where({ id, is_deleted: false })
            .first();
        if (!story) throw new HttpException(404, "Success story not found");
        return story;
    }

    /**
     * Create success story
     */
    public async createSuccessStory(data: CreateSuccessStoryDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Success story data is empty");

        const storyData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_SUCCESS_STORIES).insert(storyData).returning("*");
        return inserted;
    }

    /**
     * Update success story
     */
    public async updateSuccessStory(data: UpdateSuccessStoryDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Story ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_SUCCESS_STORIES)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "Success story not found");
        return updated;
    }

    /**
     * Delete success story (soft delete)
     */
    public async deleteSuccessStory(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "Story ID is required");

        const [deleted] = await DB(T.CMS_SUCCESS_STORIES)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "Success story not found");
        return deleted;
    }

    /**
     * Reorder success stories
     */
    public async reorderSuccessStories(data: BulkReorderDto): Promise<any> {
        if (!data.items || !data.items.length) {
            throw new HttpException(400, "Items array is required");
        }

        const updates = data.items.map(item =>
            DB(T.CMS_SUCCESS_STORIES)
                .where({ id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );

        await Promise.all(updates);
        return { message: "Reorder successful", count: data.items.length };
    }

    // ==================== LANDING FAQs ====================

    /**
     * Get all landing FAQs
     */
    public async getAllLandingFaqs(): Promise<any[]> {
        return await DB(T.CMS_LANDING_FAQS)
            .where({ is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get active landing FAQs (for frontend)
     */
    public async getActiveLandingFaqs(): Promise<any[]> {
        return await DB(T.CMS_LANDING_FAQS)
            .where({ is_active: true, is_deleted: false })
            .orderBy('sort_order', 'asc');
    }

    /**
     * Get landing FAQ by ID
     */
    public async getLandingFaqById(id: number): Promise<any> {
        const faq = await DB(T.CMS_LANDING_FAQS)
            .where({ id, is_deleted: false })
            .first();
        if (!faq) throw new HttpException(404, "FAQ not found");
        return faq;
    }

    /**
     * Create landing FAQ
     */
    public async createLandingFaq(data: CreateLandingFaqDto): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "FAQ data is empty");

        const faqData = {
            ...data,
            category: data.category || 'general',
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false
        };

        const [inserted] = await DB(T.CMS_LANDING_FAQS).insert(faqData).returning("*");
        return inserted;
    }

    /**
     * Update landing FAQ
     */
    public async updateLandingFaq(data: UpdateLandingFaqDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "FAQ ID is required");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };
        delete (updateData as any).id;

        const [updated] = await DB(T.CMS_LANDING_FAQS)
            .where({ id: data.id, is_deleted: false })
            .update(updateData)
            .returning("*");

        if (!updated) throw new HttpException(404, "FAQ not found");
        return updated;
    }

    /**
     * Delete landing FAQ (soft delete)
     */
    public async deleteLandingFaq(data: DeleteItemDto): Promise<any> {
        if (!data.id) throw new HttpException(400, "FAQ ID is required");

        const [deleted] = await DB(T.CMS_LANDING_FAQS)
            .where({ id: data.id })
            .update({
                is_deleted: true,
                deleted_by: data.deleted_by || 1,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        if (!deleted) throw new HttpException(404, "FAQ not found");
        return deleted;
    }

    /**
     * Reorder landing FAQs
     */
    public async reorderLandingFaqs(data: BulkReorderDto): Promise<any> {
        if (!data.items || !data.items.length) {
            throw new HttpException(400, "Items array is required");
        }

        const updates = data.items.map(item =>
            DB(T.CMS_LANDING_FAQS)
                .where({ id: item.id })
                .update({ sort_order: item.sort_order, updated_at: DB.fn.now() })
        );

        await Promise.all(updates);
        return { message: "Reorder successful", count: data.items.length };
    }

    // ==================== COMPLETE LANDING PAGE ====================

    /**
     * Get all active landing page content (for frontend)
     */
    public async getActiveLandingPageContent(): Promise<any> {
        const [hero, trustedCompanies, whyChooseUs, featuredCreators, successStories, faqs] = await Promise.all([
            this.getActiveHero(),
            this.getActiveTrustedCompanies(),
            this.getActiveWhyChooseUs(),
            this.getActiveFeaturedCreators(),
            this.getActiveSuccessStories(),
            this.getActiveLandingFaqs()
        ]);

        return {
            hero: hero[0] || null,
            trustedCompanies,
            whyChooseUs,
            featuredCreators,
            successStories,
            faqs
        };
    }
}

export default CmsLandingService;
