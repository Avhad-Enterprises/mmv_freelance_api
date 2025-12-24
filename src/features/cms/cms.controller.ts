import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./cms.types";
import CmsService from "./cms.service";
import {
    CreateHeroDto, UpdateHeroDto,
    CreateTrustedCompanyDto, UpdateTrustedCompanyDto,
    CreateWhyChooseUsDto, UpdateWhyChooseUsDto,
    CreateFeaturedCreatorDto, UpdateFeaturedCreatorDto,
    CreateSuccessStoryDto, UpdateSuccessStoryDto,
    CreateLandingFaqDto, UpdateLandingFaqDto,
    BulkReorderDto, DeleteItemDto
} from "./cms.dto";
import HttpException from "../../exceptions/HttpException";

class CmsController {
    private service = new CmsService();

    // ==================== HERO SECTION ====================

    public getAllHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllHero();
            res.status(200).json({ success: true, data, message: "Hero sections retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveHero();
            res.status(200).json({ success: true, data, message: "Active hero sections retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getHeroById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getHeroById(id);
            res.status(200).json({ success: true, data, message: "Hero section retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const heroData: CreateHeroDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createHero(heroData);
            res.status(201).json({ success: true, data, message: "Hero section created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const heroData: UpdateHeroDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateHero(heroData);
            res.status(200).json({ success: true, data, message: "Hero section updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteHero = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteHero(deleteData);
            res.status(200).json({ success: true, data, message: "Hero section deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== TRUSTED COMPANIES ====================

    public getAllTrustedCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllTrustedCompanies();
            res.status(200).json({ success: true, data, message: "Trusted companies retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveTrustedCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveTrustedCompanies();
            res.status(200).json({ success: true, data, message: "Active trusted companies retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getTrustedCompanyById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getTrustedCompanyById(id);
            res.status(200).json({ success: true, data, message: "Trusted company retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createTrustedCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const companyData: CreateTrustedCompanyDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createTrustedCompany(companyData);
            res.status(201).json({ success: true, data, message: "Trusted company created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateTrustedCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const companyData: UpdateTrustedCompanyDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateTrustedCompany(companyData);
            res.status(200).json({ success: true, data, message: "Trusted company updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteTrustedCompany = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteTrustedCompany(deleteData);
            res.status(200).json({ success: true, data, message: "Trusted company deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    public reorderTrustedCompanies = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reorderData: BulkReorderDto = req.body;
            const data = await this.service.reorderTrustedCompanies(reorderData);
            res.status(200).json({ success: true, data, message: "Trusted companies reordered successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== WHY CHOOSE US ====================

    public getAllWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllWhyChooseUs();
            res.status(200).json({ success: true, data, message: "Why choose us items retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveWhyChooseUs();
            res.status(200).json({ success: true, data, message: "Active why choose us items retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getWhyChooseUsById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getWhyChooseUsById(id);
            res.status(200).json({ success: true, data, message: "Why choose us item retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const itemData: CreateWhyChooseUsDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createWhyChooseUs(itemData);
            res.status(201).json({ success: true, data, message: "Why choose us item created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const itemData: UpdateWhyChooseUsDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateWhyChooseUs(itemData);
            res.status(200).json({ success: true, data, message: "Why choose us item updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteWhyChooseUs(deleteData);
            res.status(200).json({ success: true, data, message: "Why choose us item deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    public reorderWhyChooseUs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reorderData: BulkReorderDto = req.body;
            const data = await this.service.reorderWhyChooseUs(reorderData);
            res.status(200).json({ success: true, data, message: "Why choose us items reordered successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== FEATURED CREATORS ====================

    public getAllFeaturedCreators = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllFeaturedCreators();
            res.status(200).json({ success: true, data, message: "Featured creators retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveFeaturedCreators = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveFeaturedCreators();
            res.status(200).json({ success: true, data, message: "Active featured creators retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getFeaturedCreatorById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getFeaturedCreatorById(id);
            res.status(200).json({ success: true, data, message: "Featured creator retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createFeaturedCreator = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const creatorData: CreateFeaturedCreatorDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createFeaturedCreator(creatorData);
            res.status(201).json({ success: true, data, message: "Featured creator created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateFeaturedCreator = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const creatorData: UpdateFeaturedCreatorDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateFeaturedCreator(creatorData);
            res.status(200).json({ success: true, data, message: "Featured creator updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteFeaturedCreator = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteFeaturedCreator(deleteData);
            res.status(200).json({ success: true, data, message: "Featured creator deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    public reorderFeaturedCreators = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reorderData: BulkReorderDto = req.body;
            const data = await this.service.reorderFeaturedCreators(reorderData);
            res.status(200).json({ success: true, data, message: "Featured creators reordered successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== SUCCESS STORIES ====================

    public getAllSuccessStories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllSuccessStories();
            res.status(200).json({ success: true, data, message: "Success stories retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveSuccessStories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveSuccessStories();
            res.status(200).json({ success: true, data, message: "Active success stories retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getSuccessStoryById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getSuccessStoryById(id);
            res.status(200).json({ success: true, data, message: "Success story retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createSuccessStory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const storyData: CreateSuccessStoryDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createSuccessStory(storyData);
            res.status(201).json({ success: true, data, message: "Success story created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateSuccessStory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const storyData: UpdateSuccessStoryDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateSuccessStory(storyData);
            res.status(200).json({ success: true, data, message: "Success story updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteSuccessStory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteSuccessStory(deleteData);
            res.status(200).json({ success: true, data, message: "Success story deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    public reorderSuccessStories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reorderData: BulkReorderDto = req.body;
            const data = await this.service.reorderSuccessStories(reorderData);
            res.status(200).json({ success: true, data, message: "Success stories reordered successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== LANDING FAQs ====================

    public getAllLandingFaqs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getAllLandingFaqs();
            res.status(200).json({ success: true, data, message: "Landing FAQs retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getActiveLandingFaqs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveLandingFaqs();
            res.status(200).json({ success: true, data, message: "Active landing FAQs retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getLandingFaqById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const data = await this.service.getLandingFaqById(id);
            res.status(200).json({ success: true, data, message: "Landing FAQ retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };

    public createLandingFaq = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const faqData: CreateLandingFaqDto = { ...req.body, created_by: req.user.user_id };
            const data = await this.service.createLandingFaq(faqData);
            res.status(201).json({ success: true, data, message: "Landing FAQ created successfully" });
        } catch (error) {
            next(error);
        }
    };

    public updateLandingFaq = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const faqData: UpdateLandingFaqDto = { ...req.body, updated_by: req.user.user_id };
            const data = await this.service.updateLandingFaq(faqData);
            res.status(200).json({ success: true, data, message: "Landing FAQ updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    public deleteLandingFaq = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.user_id) {
                throw new HttpException(401, 'Authentication required');
            }
            const deleteData: DeleteItemDto = { id: Number(req.params.id), deleted_by: req.user.user_id };
            const data = await this.service.deleteLandingFaq(deleteData);
            res.status(200).json({ success: true, data, message: "Landing FAQ deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    public reorderLandingFaqs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const reorderData: BulkReorderDto = req.body;
            const data = await this.service.reorderLandingFaqs(reorderData);
            res.status(200).json({ success: true, data, message: "Landing FAQs reordered successfully" });
        } catch (error) {
            next(error);
        }
    };

    // ==================== COMPLETE LANDING PAGE ====================

    public getActiveLandingPageContent = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const data = await this.service.getActiveLandingPageContent();
            res.status(200).json({ success: true, data, message: "Landing page content retrieved successfully" });
        } catch (error) {
            next(error);
        }
    };
}

export default CmsController;
