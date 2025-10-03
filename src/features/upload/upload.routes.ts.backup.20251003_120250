import { Router } from "express";
import Route from "../../interfaces/route.interface";
import validationMiddleware from "../../middlewares/validation.middleware";
import UploadToAWSController from "./upload.controller";
import { uploadtoawsDto } from "./upload.dto";

class uploadtoaws implements Route {
    public path = "/files";
    public router = Router();
    public uploadawscontroller = new UploadToAWSController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/uploadtoaws`, validationMiddleware(uploadtoawsDto, 'body', false, []), this.uploadawscontroller.insertfiletoaws);
    }
}

export default uploadtoaws;
