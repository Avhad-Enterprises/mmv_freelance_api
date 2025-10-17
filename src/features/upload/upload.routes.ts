import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requireRole } from '../../middlewares/role.middleware';
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
        // Upload file to AWS S3
        this.router.post(`${this.path}/uploadtoaws`,
            requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users can upload files
            validationMiddleware(uploadtoawsDto, 'body', false, []),
            this.uploadawscontroller.insertfiletoaws
        );
    }
}

export default uploadtoaws;
