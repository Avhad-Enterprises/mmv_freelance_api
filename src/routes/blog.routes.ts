import { Router } from 'express';
import Route from '../interfaces/route.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import blogController from '../controllers/blog.controller';
import { BlogDto } from '../dtos/blog.dto';

class blogRoute implements Route {

  public path = '/blog';
  public router = Router();
  public blogController = new blogController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //users section  , validationMiddleware(usersDto, 'body', false, [])
    this.router.post(`${this.path}/insertblog`, validationMiddleware(BlogDto, 'body', false, []), (req, res, next) => this.blogController.addblog(req, res, next));

    this.router.get(`${this.path}/getblog/:id`, (req, res, next) => this.blogController.getblogby(req, res, next));

    this.router.put(`${this.path}/updateblog`, validationMiddleware(BlogDto, 'body', false, []), (req, res, next) => this.blogController.updateblogby(req, res, next));

    this.router.post(`${this.path}/deleteblog`, validationMiddleware(BlogDto, 'body', true, []), (req, res, next) => this.blogController.deleteblog(req, res, next));

    this.router.get(`${this.path}/getallblogs`, (req, res, next) => this.blogController.getallblogsby(req, res, next));

    this.router.get(`${this.path}/getDeletedblog`, this.blogController.getDeletedblogby);

    this.router.get(`${this.path}/getblogby`, (req, res, next) => this.blogController.getBlogsByCategory(req, res, next));
    
    this.router.get(`${this.path}/getblogtypes`, (req, res, next) => this.blogController.getblogtypesby(req, res, next));

  }
}

export default  blogRoute;
