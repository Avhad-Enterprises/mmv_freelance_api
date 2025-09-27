import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import documentController from '../controllers/document.controller';
import { DocumentDto } from '../dtos/document.dto';

class documentRoute implements Route {

  public path = '/document';
  public router = Router();
  public documentController = new documentController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

   


  }
}

export default  documentRoute;