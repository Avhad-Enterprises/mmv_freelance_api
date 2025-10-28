import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import validationMiddleware from '../../middlewares/validation.middleware';
import BlogController from './blog.controller';
import { BlogDto } from './blog.dto';
import { requireRole } from '../../middlewares/role.middleware';

class BlogRoute implements Route {
  public path = '/blog';
  public router = Router();
  public blogController = new BlogController();
  
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * GET /blog
     * Get all active blogs (Public - no auth required)
     */
    this.router.get(`${this.path}`, this.blogController.getAllBlogs);

    /**
     * GET /blog/:id
     * Get a specific blog by ID (Public - no auth required)
     */
    this.router.get(`${this.path}/:id`, this.blogController.getBlogById);

    /**
     * POST /blog
     * Create a new blog (Admin only)
     */
    this.router.post(
      `${this.path}`,
      requireRole('SUPER_ADMIN', 'ADMIN'),
      validationMiddleware(BlogDto, 'body', true, []),
      this.blogController.createBlog
    );

    /**
     * PUT /blog
     * Update an existing blog (Admin only)
     */
    this.router.put(
      `${this.path}`,
      requireRole('SUPER_ADMIN', 'ADMIN'),
      validationMiddleware(BlogDto, 'body', false, []),
      this.blogController.updateBlog
    );

    /**
     * DELETE /blog
     * Soft delete a blog (Admin only)
     */
    this.router.delete(
      `${this.path}`,
      requireRole('SUPER_ADMIN', 'ADMIN'),
      validationMiddleware(BlogDto, 'body', true, []),
      this.blogController.deleteBlog
    );
  }
}

export default BlogRoute;
