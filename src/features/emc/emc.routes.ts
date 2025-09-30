import { Router } from "express";
import EmcController from "./emc.controller";
import validationMiddleware from "../../middlewares/validation.middleware";
import { NicheSelectionDto } from "./niche.dto";
import Route from "../../interfaces/routes.interface";

class EMCRoute implements Route{

    public path = '/emc';
    public router = Router();
    public emcController = new EmcController();

    constructor(){
        this.initializeRoutes();
    }

    private initializeRoutes(){

        this.router.post(`${this.path}/artwork-selection`, validationMiddleware(NicheSelectionDto, 'body', false, []), this.emcController.saveArtworkSelection);
        this.router.post(`${this.path}/niche-selection`, validationMiddleware(NicheSelectionDto, 'body', false, []), this.emcController.saveNicheSelection);
        this.router.get(`${this.path}/recommended-editors/:projectid`, this.emcController.getRecommendedEditors);
    }

   
}
export default EMCRoute;