import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import CmsController from "./cms.controller";
import { requireRole } from "../../middlewares/role.middleware";
import { generalRateLimit } from "../../middlewares/rate-limit.middleware";
import {
  heroUpload,
  trustedCompanyUpload,
} from "../../middlewares/cms-upload.middleware";
import {
  CreateHeroDto,
  UpdateHeroDto,
  CreateTrustedCompanyDto,
  UpdateTrustedCompanyDto,
  CreateWhyChooseUsDto,
  UpdateWhyChooseUsDto,
  CreateFeaturedCreatorDto,
  UpdateFeaturedCreatorDto,
  CreateSuccessStoryDto,
  UpdateSuccessStoryDto,
  CreateLandingFaqDto,
  UpdateLandingFaqDto,
  BulkReorderDto,
} from "./cms.dto";

class CmsRoute implements Route {
  public path = "/cms-landing";
  public router = Router();
  public controller = new CmsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // PUBLIC ROUTES
    this.router.get(
      `${this.path}/public`,
      generalRateLimit,
      this.controller.getActiveLandingPageContent
    );
    this.router.get(
      `${this.path}/public/hero`,
      generalRateLimit,
      this.controller.getActiveHero
    );
    this.router.get(
      `${this.path}/public/trusted-companies`,
      generalRateLimit,
      this.controller.getActiveTrustedCompanies
    );
    this.router.get(
      `${this.path}/public/why-choose-us`,
      generalRateLimit,
      this.controller.getActiveWhyChooseUs
    );
    this.router.get(
      `${this.path}/public/featured-creators`,
      generalRateLimit,
      this.controller.getActiveFeaturedCreators
    );
    this.router.get(
      `${this.path}/public/success-stories`,
      generalRateLimit,
      this.controller.getActiveSuccessStories
    );
    this.router.get(
      `${this.path}/public/faqs`,
      generalRateLimit,
      this.controller.getActiveLandingFaqs
    );

    // HERO SECTION (with file upload support for left/right images)
    this.router.get(
      `${this.path}/hero`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllHero
    );
    this.router.get(
      `${this.path}/hero/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getHeroById
    );
    this.router.post(
      `${this.path}/hero`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      heroUpload,
      this.controller.createHero
    );
    this.router.put(
      `${this.path}/hero`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      heroUpload,
      this.controller.updateHero
    );
    this.router.delete(
      `${this.path}/hero/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteHero
    );

    // TRUSTED COMPANIES (with file upload support for logo)
    this.router.get(
      `${this.path}/trusted-companies`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllTrustedCompanies
    );
    this.router.get(
      `${this.path}/trusted-companies/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getTrustedCompanyById
    );
    this.router.post(
      `${this.path}/trusted-companies`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      trustedCompanyUpload,
      this.controller.createTrustedCompany
    );
    this.router.put(
      `${this.path}/trusted-companies`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      trustedCompanyUpload,
      this.controller.updateTrustedCompany
    );
    this.router.delete(
      `${this.path}/trusted-companies/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteTrustedCompany
    );
    this.router.put(
      `${this.path}/trusted-companies/reorder`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(BulkReorderDto, "body", true, []),
      this.controller.reorderTrustedCompanies
    );

    // WHY CHOOSE US
    this.router.get(
      `${this.path}/why-choose-us`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllWhyChooseUs
    );
    this.router.get(
      `${this.path}/why-choose-us/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getWhyChooseUsById
    );
    this.router.post(
      `${this.path}/why-choose-us`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(CreateWhyChooseUsDto, "body", true, []),
      this.controller.createWhyChooseUs
    );
    this.router.put(
      `${this.path}/why-choose-us`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(UpdateWhyChooseUsDto, "body", true, []),
      this.controller.updateWhyChooseUs
    );
    this.router.delete(
      `${this.path}/why-choose-us/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteWhyChooseUs
    );
    this.router.put(
      `${this.path}/why-choose-us/reorder`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(BulkReorderDto, "body", true, []),
      this.controller.reorderWhyChooseUs
    );

    // FEATURED CREATORS
    this.router.get(
      `${this.path}/featured-creators`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllFeaturedCreators
    );
    this.router.get(
      `${this.path}/featured-creators/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getFeaturedCreatorById
    );
    this.router.post(
      `${this.path}/featured-creators`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(CreateFeaturedCreatorDto, "body", true, []),
      this.controller.createFeaturedCreator
    );
    this.router.put(
      `${this.path}/featured-creators`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(UpdateFeaturedCreatorDto, "body", true, []),
      this.controller.updateFeaturedCreator
    );
    this.router.delete(
      `${this.path}/featured-creators/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteFeaturedCreator
    );
    this.router.put(
      `${this.path}/featured-creators/reorder`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(BulkReorderDto, "body", true, []),
      this.controller.reorderFeaturedCreators
    );

    // SUCCESS STORIES
    this.router.get(
      `${this.path}/success-stories`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllSuccessStories
    );
    this.router.get(
      `${this.path}/success-stories/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getSuccessStoryById
    );
    this.router.post(
      `${this.path}/success-stories`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(CreateSuccessStoryDto, "body", true, []),
      this.controller.createSuccessStory
    );
    this.router.put(
      `${this.path}/success-stories`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(UpdateSuccessStoryDto, "body", true, []),
      this.controller.updateSuccessStory
    );
    this.router.delete(
      `${this.path}/success-stories/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteSuccessStory
    );
    this.router.put(
      `${this.path}/success-stories/reorder`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(BulkReorderDto, "body", true, []),
      this.controller.reorderSuccessStories
    );

    // LANDING FAQs
    this.router.get(
      `${this.path}/faqs`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getAllLandingFaqs
    );
    this.router.get(
      `${this.path}/faqs/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.getLandingFaqById
    );
    this.router.post(
      `${this.path}/faqs`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(CreateLandingFaqDto, "body", true, []),
      this.controller.createLandingFaq
    );
    this.router.put(
      `${this.path}/faqs`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(UpdateLandingFaqDto, "body", true, []),
      this.controller.updateLandingFaq
    );
    this.router.delete(
      `${this.path}/faqs/:id`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      this.controller.deleteLandingFaq
    );
    this.router.put(
      `${this.path}/faqs/reorder`,
      requireRole("SUPER_ADMIN", "ADMIN"),
      generalRateLimit,
      validationMiddleware(BulkReorderDto, "body", true, []),
      this.controller.reorderLandingFaqs
    );
  }
}

export default CmsRoute;
