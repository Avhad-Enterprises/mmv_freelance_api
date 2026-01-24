import { Router } from "express";
import EmcController from "./emc.controller";
import validationMiddleware from "../../middlewares/validation.middleware";
import { CategorySelectionDto } from "./category.dto";
import Route from "../../interfaces/routes.interface";
import authMiddleware from "../../middlewares/auth.middleware";

class EMCRoute implements Route{

    public path = '/emc';
    public router = Router();
    public emcController = new EmcController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){

        this.router.post(`${this.path}/artwork-selection`, validationMiddleware(CategorySelectionDto, 'body', false, []), this.emcController.saveArtworkSelection);
        this.router.post(`${this.path}/category-selection`, validationMiddleware(CategorySelectionDto, 'body', false, []), this.emcController.saveCategorySelection);
        this.router.get(`${this.path}/recommended-editors/:projectid`, this.emcController.getRecommendedEditors);
        
        // NEW: Get recommended projects for freelancer (Video Editor/Videographer) based on superpowers
        this.router.get(
            `${this.path}/recommended-projects`,
            authMiddleware,
            this.emcController.getRecommendedProjectsForFreelancer
        );
    }

   
}
export default EMCRoute;