import DB from "../database/index.schema";
import { CmsDto } from "../dtos/cms.dto";
import { NextFunction, Request, Response } from "express";
import CmsService from "../services/cms.services";
import HttpException from "../exceptions/HttpException";

class CmsController {
    public CmsService = new CmsService();
    public addcms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const cmsData: CmsDto = req.body;
            const inserteddata = await this.CmsService.addtocms(cmsData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    }
    public updatecmsby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const cmsData: Partial<CmsDto> = req.body;
            const updatecms = await this.CmsService.updatecmsbyid(cmsData);
            res.status(200).json({ data: updatecms, message: "Cms updated" });
        } catch (error) {
            next(error);
        }
    };
    public deletecms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const cmsdata = req.body;
            const deletedcms = await this.CmsService.SoftDeletecms(cmsdata);
            res.status(200).json({ data: deletedcms, message: "cms deleted" });
        } catch (error) {
            next(error);
        }
    };
    public geteditcms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            const cms = await this.CmsService.geteditcmsby(id);
            res.status(200).json({ data: cms, message: "Cms fetched" });
        } catch (error) {
            next();
        }
    };
    public getallcmsby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cms = await this.CmsService.getallcmsbytable();
            res.status(200).json({ data: cms, success: true });
        } catch (err) {
            next(err);
        }
    };
};
export default CmsController;
