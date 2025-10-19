import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import blogController from './blog.controller';
import { BlogDto } from './blog.dto';
import { requireRole } from '../../middlewares/role.middleware';

class blogRoute implements Route {

  public path = '/blog';
  public router = Router();
  public blogController = new blogController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //users section  , validationMiddleware(usersDto, 'body', false, [])
    this.router.post(`${this.path}/insertblog`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can create blogs
      validationMiddleware(BlogDto, 'body', false, []),
      (req, res, next) => this.blogController.addblog(req, res, next)
    );

    this.router.get(`${this.path}/getblog/:id`,
      requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users can read blogs
      (req, res, next) => this.blogController.getblogby(req, res, next)
    );

    this.router.put(`${this.path}/updateblog`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can update blogs
      validationMiddleware(BlogDto, 'body', false, []),
      (req, res, next) => this.blogController.updateblogby(req, res, next)
    );

    this.router.post(`${this.path}/deleteblog`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can delete blogs
      validationMiddleware(BlogDto, 'body', true, []),
      (req, res, next) => this.blogController.deleteblog(req, res, next)
    );

    this.router.get(`${this.path}/getallblogs`,
      (req, res, next) => this.blogController.getallblogsby(req, res, next)
    );

    this.router.get(`${this.path}/getDeletedblog`,
      requireRole('ADMIN', 'SUPER_ADMIN'), // Only admins can view deleted blogs
      this.blogController.getDeletedblogby
    );

    this.router.get(`${this.path}/getblogby`,
      requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users can read blogs by category
      (req, res, next) => this.blogController.getBlogsByCategory(req, res, next)
    );
    
    this.router.get(`${this.path}/getblogtypes`,
      requireRole('CLIENT', 'VIDEOGRAPHER', 'VIDEO_EDITOR', 'ADMIN', 'SUPER_ADMIN'), // All authenticated users can view blog types
      (req, res, next) => this.blogController.getblogtypesby(req, res, next)
    );

  }
}

export default  blogRoute;
