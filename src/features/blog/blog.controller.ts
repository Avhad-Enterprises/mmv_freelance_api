import DB from "../../../database/index";
import { BlogDto } from './blog.dto';
import { NextFunction, Request, Response } from "express";
import BlogService from "./blog.service";
import HttpException from "../../exceptions/HttpException";

class BlogController {
    private blogService = new BlogService();

    /**
     * Get all active blogs
     */
    public getAllBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogs = await this.blogService.getAllActiveBlogs();
            res.status(200).json({
                success: true,
                data: blogs,
                message: "Blogs retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a specific blog by ID
     */
    public getBlogById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blog_id = Number(req.params.id);
            const blog = await this.blogService.getBlogById(blog_id);
            res.status(200).json({
                success: true,
                data: blog,
                message: "Blog retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new blog
     */
    public createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogData: BlogDto = req.body;
            const createdBlog = await this.blogService.createBlog(blogData);
            res.status(201).json({
                success: true,
                data: createdBlog,
                message: "Blog created successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update an existing blog
     */
    public updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogData: Partial<BlogDto> = req.body;
            const updatedBlog = await this.blogService.updateBlog(blogData);
            res.status(200).json({
                success: true,
                data: updatedBlog,
                message: "Blog updated successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Soft delete a blog
     */
    public deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogData = req.body;
            const deletedBlog = await this.blogService.deleteBlog(blogData);
            res.status(200).json({
                success: true,
                data: deletedBlog,
                message: "Blog deleted successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}

export default BlogController;