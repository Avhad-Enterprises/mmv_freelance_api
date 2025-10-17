import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import faqController from './faq.controller';
import { FaqDto } from './faq.dto';

class faqRoute implements Route {

    public path = '/faq';
    public router = Router();
    public faqController = new faqController();

    constructor() {
        this.initializeRoutes();
    }
    private initializeRoutes() {

        /**
         *    GET /faq/getfaq/:id
         *    Get a specific FAQ by ID
         */
        this.router.get(`${this.path}/getfaq/:id`, (req, res, next) => this.faqController.faq(req, res, next));

        /**
         *     POST /faq/insertfaqs
         *     Create a new FAQ entry
         
         */
        this.router.post(`${this.path}/insertfaqs`, (req, res, next) => this.faqController.insertfaqin(req, res, next));

        /**
         *   PUT /faq/updatefaq
         *   Update an existing FAQ
         */
        this.router.put(`${this.path}/updatefaq`, validationMiddleware(FaqDto, 'body', false, []), (req, res, next) => this.faqController.faqs(req, res, next));

        /**
         *    POST /faq/deletefaq
         *    Soft delete an FAQ (marks as deleted)
         */
        this.router.post(`${this.path}/deletefaq`, validationMiddleware(FaqDto, 'body', true, []), (req, res, next) => this.faqController.deletefaqs(req, res, next));

        /**
         *    GET /faq/getallfaq
         *    Get all active FAQs
    
         */
        this.router.get(`${this.path}/getallfaq`, (req, res, next) => this.faqController.getallfaqsby(req, res, next));

    }
}

export default faqRoute;