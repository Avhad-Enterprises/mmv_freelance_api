import DB from "../../../database/index";
import { BlogDto } from './blog.dto';
import { NextFunction, Request, Response } from "express";
import BlogService from "./blog.service";
import HttpException from "../../exceptions/HttpException";

class BlogController {

    public BlogService = new BlogService();

    public addblog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogData: BlogDto = req.body;
            const inserteddata = await this.BlogService.addtoblog(blogData);
            res.status(201).json({ data: inserteddata, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    }

    public getblogby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blog_id = Number(req.params.id);
            const blog = await this.BlogService.getblogbyid(blog_id);
            res.status(200).json({ data: blog, message: "Blog fetched" });
        } catch (error) {
            next();
        }
    };

    public updateblogby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const blogData: Partial<BlogDto> = req.body;
            const updateblog = await this.BlogService.updateblogbyid(blogData);
            res.status(200).json({ data: updateblog, message: "Blog updated" });
        } catch (error) {
            next(error);
        }
    };

    public deleteblog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const blogdata = req.body; //{'id}
            const deletedblog = await this.BlogService.SoftDeleteblog(blogdata);
            res.status(200).json({ data: deletedblog, message: "blog deleted" });
        } catch (error) {
            next(error);
        }
    };

    public getallblogsby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blog = await this.BlogService.getallblogsbytable();
            res.status(200).json({ data: blog, success: true });
        } catch (err) {
            next(err);
        }
    };

    public getDeletedblogby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const blog = await this.BlogService.getDeletedblogbytable();
            res.status(200).json({ data: blog, success: true })
        } catch (err) {
            next(err);
        }
    };
    public getBlogsByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            const categoryname = req.query.category as string;

            if (!categoryname) {
                throw new HttpException(400, "Category query param is required");
            }
            const categoryBlogs = await this.BlogService.getBlogsByCategory(categoryname);

            if (categoryBlogs.length === 0) {
                res.status(200).json({
                    data: [],
                    message: `No blogs found in the category "${categoryname}"`,
                });
                return;
            }
            res.status(200).json({
                data: categoryBlogs,
                message: `Found blogs in the category "${categoryname}"`,
            });
        } catch (error) {
            next(error);
        }
    };
    public getblogtypesby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categoryname = req.query.category as string;
             if (!categoryname) {
                throw new HttpException(400, "Category query param is required");
            }
            const blog = await this.BlogService.getblogtypesbytable(categoryname);
            res.status(200).json({ data: blog, success: true });
        } catch (err) {
            next(err);
        }

    };
}
export default BlogController;