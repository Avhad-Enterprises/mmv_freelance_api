import DB from "../../../database/index";
import { FaqDto } from "./faq.dto";
import { NextFunction, Request, Response } from "express";
import FaqService from "./faq.service";
import HttpException from "../../exceptions/HttpException";

class FaqController {
  private faqService = new FaqService();

  /**
   * Gets a specific FAQ entry by ID
   */
  public getFaqById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqId = Number(req.params.id);
      const faq = await this.faqService.getFaqById(faqId);
      res.status(200).json({
        success: true,
        data: faq,
        message: "FAQ retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates a new FAQ entry
   */
  public createFaq = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqData: FaqDto = req.body;
      const createdFaq = await this.faqService.createFaq(faqData);
      res.status(201).json({
        success: true,
        data: createdFaq,
        message: "FAQ created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Updates an existing FAQ
   */
  public updateFaq = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqData: Partial<FaqDto> = req.body;
      const updatedFaq = await this.faqService.updateFaq(faqData);
      res.status(200).json({
        success: true,
        data: updatedFaq,
        message: "FAQ updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Soft deletes an FAQ
   */
  public deleteFaq = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqData = req.body;
      const deletedFaq = await this.faqService.deleteFaq(faqData);
      res.status(200).json({
        success: true,
        data: deletedFaq,
        message: "FAQ deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets all active FAQs
   */
  public getAllFaqs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqs = await this.faqService.getAllActiveFaqs();
      res.status(200).json({
        success: true,
        data: faqs,
        message: "FAQs retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Gets all FAQs including inactive (Admin only)
   */
  public getAllFaqsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const faqs = await this.faqService.getAllFaqs();
      res.status(200).json({
        success: true,
        data: faqs,
        message: "All FAQs retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}

export default FaqController;
