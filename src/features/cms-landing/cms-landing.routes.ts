import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import CmsLandingController from './cms-landing.controller';
import { requireRole } from '../../middlewares/role.middleware';
import {
    CreateHeroDto, UpdateHeroDto,
    CreateTrustedCompanyDto, UpdateTrustedCompanyDto,
    CreateWhyChooseUsDto, UpdateWhyChooseUsDto,
    CreateFeaturedCreatorDto, UpdateFeaturedCreatorDto,
    CreateSuccessStoryDto, UpdateSuccessStoryDto,
    CreateLandingFaqDto, UpdateLandingFaqDto,
    BulkReorderDto
} from './cms-landing.dto';

class CmsLandingRoute implements Route {
    public path = '/cms-landing';
    public router = Router();
    public controller = new CmsLandingController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // ==================== PUBLIC ROUTES (Frontend) ====================

        /**
         * GET /cms-landing/public
         * Get all active landing page content for frontend display
         */
        this.router.get(`${this.path}/public`, this.controller.getActiveLandingPageContent);

        /**
         * GET /cms-landing/public/hero
         * Get active hero sections for frontend
         */
        this.router.get(`${this.path}/public/hero`, this.controller.getActiveHero);

        /**
         * GET /cms-landing/public/trusted-companies
         * Get active trusted companies for frontend
         */
        this.router.get(`${this.path}/public/trusted-companies`, this.controller.getActiveTrustedCompanies);

        /**
         * GET /cms-landing/public/why-choose-us
         * Get active why choose us items for frontend
         */
        this.router.get(`${this.path}/public/why-choose-us`, this.controller.getActiveWhyChooseUs);

        /**
         * GET /cms-landing/public/featured-creators
         * Get active featured creators for frontend
         */
        this.router.get(`${this.path}/public/featured-creators`, this.controller.getActiveFeaturedCreators);

        /**
         * GET /cms-landing/public/success-stories
         * Get active success stories for frontend
         */
        this.router.get(`${this.path}/public/success-stories`, this.controller.getActiveSuccessStories);

        /**
         * GET /cms-landing/public/faqs
         * Get active landing FAQs for frontend
         */
        this.router.get(`${this.path}/public/faqs`, this.controller.getActiveLandingFaqs);

        // ==================== HERO SECTION (Admin) ====================

        /**
         * GET /cms-landing/hero
         * Get all hero sections (Admin)
         */
        this.router.get(
            `${this.path}/hero`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllHero
        );

        /**
         * GET /cms-landing/hero/:id
         * Get hero section by ID (Admin)
         */
        this.router.get(
            `${this.path}/hero/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getHeroById
        );

        /**
         * POST /cms-landing/hero
         * Create hero section (Admin)
         */
        this.router.post(
            `${this.path}/hero`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateHeroDto, 'body', true, []),
            this.controller.createHero
        );

        /**
         * PUT /cms-landing/hero
         * Update hero section (Admin)
         */
        this.router.put(
            `${this.path}/hero`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateHeroDto, 'body', true, []),
            this.controller.updateHero
        );

        /**
         * DELETE /cms-landing/hero/:id
         * Delete hero section (Admin)
         */
        this.router.delete(
            `${this.path}/hero/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteHero
        );

        // ==================== TRUSTED COMPANIES (Admin) ====================

        /**
         * GET /cms-landing/trusted-companies
         * Get all trusted companies (Admin)
         */
        this.router.get(
            `${this.path}/trusted-companies`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllTrustedCompanies
        );

        /**
         * GET /cms-landing/trusted-companies/:id
         * Get trusted company by ID (Admin)
         */
        this.router.get(
            `${this.path}/trusted-companies/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getTrustedCompanyById
        );

        /**
         * POST /cms-landing/trusted-companies
         * Create trusted company (Admin)
         */
        this.router.post(
            `${this.path}/trusted-companies`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateTrustedCompanyDto, 'body', true, []),
            this.controller.createTrustedCompany
        );

        /**
         * PUT /cms-landing/trusted-companies
         * Update trusted company (Admin)
         */
        this.router.put(
            `${this.path}/trusted-companies`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateTrustedCompanyDto, 'body', true, []),
            this.controller.updateTrustedCompany
        );

        /**
         * DELETE /cms-landing/trusted-companies/:id
         * Delete trusted company (Admin)
         */
        this.router.delete(
            `${this.path}/trusted-companies/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteTrustedCompany
        );

        /**
         * PUT /cms-landing/trusted-companies/reorder
         * Reorder trusted companies (Admin)
         */
        this.router.put(
            `${this.path}/trusted-companies/reorder`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(BulkReorderDto, 'body', true, []),
            this.controller.reorderTrustedCompanies
        );

        // ==================== WHY CHOOSE US (Admin) ====================

        /**
         * GET /cms-landing/why-choose-us
         * Get all why choose us items (Admin)
         */
        this.router.get(
            `${this.path}/why-choose-us`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllWhyChooseUs
        );

        /**
         * GET /cms-landing/why-choose-us/:id
         * Get why choose us item by ID (Admin)
         */
        this.router.get(
            `${this.path}/why-choose-us/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getWhyChooseUsById
        );

        /**
         * POST /cms-landing/why-choose-us
         * Create why choose us item (Admin)
         */
        this.router.post(
            `${this.path}/why-choose-us`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateWhyChooseUsDto, 'body', true, []),
            this.controller.createWhyChooseUs
        );

        /**
         * PUT /cms-landing/why-choose-us
         * Update why choose us item (Admin)
         */
        this.router.put(
            `${this.path}/why-choose-us`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateWhyChooseUsDto, 'body', true, []),
            this.controller.updateWhyChooseUs
        );

        /**
         * DELETE /cms-landing/why-choose-us/:id
         * Delete why choose us item (Admin)
         */
        this.router.delete(
            `${this.path}/why-choose-us/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteWhyChooseUs
        );

        /**
         * PUT /cms-landing/why-choose-us/reorder
         * Reorder why choose us items (Admin)
         */
        this.router.put(
            `${this.path}/why-choose-us/reorder`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(BulkReorderDto, 'body', true, []),
            this.controller.reorderWhyChooseUs
        );

        // ==================== FEATURED CREATORS (Admin) ====================

        /**
         * GET /cms-landing/featured-creators
         * Get all featured creators (Admin)
         */
        this.router.get(
            `${this.path}/featured-creators`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllFeaturedCreators
        );

        /**
         * GET /cms-landing/featured-creators/:id
         * Get featured creator by ID (Admin)
         */
        this.router.get(
            `${this.path}/featured-creators/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getFeaturedCreatorById
        );

        /**
         * POST /cms-landing/featured-creators
         * Create featured creator (Admin)
         */
        this.router.post(
            `${this.path}/featured-creators`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateFeaturedCreatorDto, 'body', true, []),
            this.controller.createFeaturedCreator
        );

        /**
         * PUT /cms-landing/featured-creators
         * Update featured creator (Admin)
         */
        this.router.put(
            `${this.path}/featured-creators`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateFeaturedCreatorDto, 'body', true, []),
            this.controller.updateFeaturedCreator
        );

        /**
         * DELETE /cms-landing/featured-creators/:id
         * Delete featured creator (Admin)
         */
        this.router.delete(
            `${this.path}/featured-creators/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteFeaturedCreator
        );

        /**
         * PUT /cms-landing/featured-creators/reorder
         * Reorder featured creators - drag & drop (Admin)
         */
        this.router.put(
            `${this.path}/featured-creators/reorder`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(BulkReorderDto, 'body', true, []),
            this.controller.reorderFeaturedCreators
        );

        // ==================== SUCCESS STORIES (Admin) ====================

        /**
         * GET /cms-landing/success-stories
         * Get all success stories (Admin)
         */
        this.router.get(
            `${this.path}/success-stories`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllSuccessStories
        );

        /**
         * GET /cms-landing/success-stories/:id
         * Get success story by ID (Admin)
         */
        this.router.get(
            `${this.path}/success-stories/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getSuccessStoryById
        );

        /**
         * POST /cms-landing/success-stories
         * Create success story (Admin)
         */
        this.router.post(
            `${this.path}/success-stories`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateSuccessStoryDto, 'body', true, []),
            this.controller.createSuccessStory
        );

        /**
         * PUT /cms-landing/success-stories
         * Update success story (Admin)
         */
        this.router.put(
            `${this.path}/success-stories`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateSuccessStoryDto, 'body', true, []),
            this.controller.updateSuccessStory
        );

        /**
         * DELETE /cms-landing/success-stories/:id
         * Delete success story (Admin)
         */
        this.router.delete(
            `${this.path}/success-stories/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteSuccessStory
        );

        /**
         * PUT /cms-landing/success-stories/reorder
         * Reorder success stories (Admin)
         */
        this.router.put(
            `${this.path}/success-stories/reorder`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(BulkReorderDto, 'body', true, []),
            this.controller.reorderSuccessStories
        );

        // ==================== LANDING FAQs (Admin) ====================

        /**
         * GET /cms-landing/faqs
         * Get all landing FAQs (Admin)
         */
        this.router.get(
            `${this.path}/faqs`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getAllLandingFaqs
        );

        /**
         * GET /cms-landing/faqs/:id
         * Get landing FAQ by ID (Admin)
         */
        this.router.get(
            `${this.path}/faqs/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.getLandingFaqById
        );

        /**
         * POST /cms-landing/faqs
         * Create landing FAQ (Admin)
         */
        this.router.post(
            `${this.path}/faqs`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(CreateLandingFaqDto, 'body', true, []),
            this.controller.createLandingFaq
        );

        /**
         * PUT /cms-landing/faqs
         * Update landing FAQ (Admin)
         */
        this.router.put(
            `${this.path}/faqs`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(UpdateLandingFaqDto, 'body', true, []),
            this.controller.updateLandingFaq
        );

        /**
         * DELETE /cms-landing/faqs/:id
         * Delete landing FAQ (Admin)
         */
        this.router.delete(
            `${this.path}/faqs/:id`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            this.controller.deleteLandingFaq
        );

        /**
         * PUT /cms-landing/faqs/reorder
         * Reorder landing FAQs (Admin)
         */
        this.router.put(
            `${this.path}/faqs/reorder`,
            requireRole('SUPER_ADMIN', 'ADMIN'),
            validationMiddleware(BulkReorderDto, 'body', true, []),
            this.controller.reorderLandingFaqs
        );
    }
}

export default CmsLandingRoute;
