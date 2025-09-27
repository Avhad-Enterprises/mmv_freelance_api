import DB from "../database/index.schema";
import {FaqDto } from "../dtos/faq.dto";
import { NextFunction, Request, Response } from "express";
import FaqService from "../services/faq.service";
import HttpException from "../exceptions/HttpException";

class faqController {
 private faqService = new FaqService();
 
     public faq = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const faq_id = Number(req.params.id);
            const faq = await this.faqService.getfaq(faq_id);
            res.status(200).json({ data: faq, message: "Faq fetched" });
        } catch (error) {
            next();
        }
    };
  
     public insertfaqin= async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const faqData: FaqDto = req.body;
                const inserteddata = await this.faqService.insertfaqs(faqData);
                res.status(201).json({ data: inserteddata, message: "Inserted" });
            } catch (error) {
                next(error);
            }
        }
    
     public faqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
    
                const faqData: Partial<FaqDto> = req.body;
                const updatefaq = await this.faqService.updatefaqs(faqData);
                res.status(200).json({ data: updatefaq, message: "Faq updated" });
            } catch (error) {
                next(error);
            }
        };

 public deletefaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const faqdata = req.body; //{'id}
            const deletedFAQ = await this.faqService.deleteFAQ(faqdata);
            res.status(200).json({ data: deletedFAQ, message: "faq deleted" });
        } catch (error) {
            next(error);
        }
    };
     public getallfaqsby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const faq = await this.faqService.getallfaqsbytable();
            res.status(200).json({ data: faq, success: true });
        } catch (err) {
            next(err);
        }
    };

};
export default faqController;