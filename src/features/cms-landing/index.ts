/**
 * CMS Landing Page Feature
 * Central export file for all CMS landing page components
 */

// DTOs (Used for validation)
export {
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
    ReorderItemDto,
    DeleteItemDto,
} from './cms-landing.dto';

// Service
export { CmsLandingService } from './cms-landing.service';

// Controller
export { default as CmsLandingController } from './cms-landing.controller';

// Routes
export { default as CmsLandingRoute } from './cms-landing.routes';

// Interfaces (for TypeScript typing - optional use)
export * from './cms-hero.interface';
export * from './cms-trusted-companies.interface';
export * from './cms-why-choose-us.interface';
export * from './cms-featured-creators.interface';
export * from './cms-success-stories.interface';
export * from './cms-landing-faqs.interface';
