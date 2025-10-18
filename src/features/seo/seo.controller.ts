import { NextFunction, Request, Response } from "express";
import { SeoDto, UpdateSeoDto } from "./seo.dto";
import SeoService from "./seo.service";

class SeoController {
    public seoService = new SeoService();

    // POST /api/v1/seos
    // Create a new SEO entry
    public createSeo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const seoData: SeoDto = req.body;
            const insertedSeo = await this.seoService.Insert(seoData);
            res.status(201).json({ data: insertedSeo, message: "SEO entry created successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v1/seos
    // Get all SEO entries
    public getAllSeos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const seos = await this.seoService.GetAllSeos();
            res.status(200).json({ data: seos, message: "SEO entries fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v1/seos/:id
    // Get SEO entry by ID
    public getSeoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const seoId = parseInt(req.params.id);
            const seo = await this.seoService.GetSeoById(seoId);
            res.status(200).json({ data: seo, message: "SEO entry fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/v1/seos/:id
    // Update SEO entry
    public updateSeo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const seoId = parseInt(req.params.id);
            const updateData: UpdateSeoDto = req.body;
            const updatedSeo = await this.seoService.UpdateSeo(seoId, updateData);
            res.status(200).json({ data: updatedSeo, message: "SEO entry updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/v1/seos/:id
    // Soft delete SEO entry
    public deleteSeo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const seoId = parseInt(req.params.id);
            const deletedSeo = await this.seoService.DeleteSeo(seoId);
            res.status(200).json({ data: deletedSeo, message: "SEO entry deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    // Legacy methods for backward compatibility (deprecated)
    public insert = this.createSeo;
    public getAllbyseodetail = this.getAllSeos;
    public updatebyseodetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const raw = (req.body as any).id;
            const idNum: number = typeof raw === 'string' ? parseInt(raw, 10) : raw;

            if (isNaN(idNum)) {
                res.status(400).json({ error: 'id must be a number' });
                return;
            }

            // Clone body and exclude collection_id
            const fieldsToUpdate = req.body;

            if (Object.keys(fieldsToUpdate).length === 0) {
                res.status(400).json({ error: 'No update data provided' });
                return;
            }

            const updated = await this.seoService.UpdateSeo(idNum, fieldsToUpdate);
            res.status(200).json({ data: updated, message: 'SEO updated' });
        } catch (error) {
            next(error);
        }
    };
}

export default SeoController;