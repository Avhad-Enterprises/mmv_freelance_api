import { BlogDto } from './blog.dto';
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { BLOG } from "../../../database/blog.schema";
import { Blog } from './blog.interface';

class BlogService {

    public async addtoblog(data: BlogDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Blog data is empty");
        }
        const insertedBlog = await DB(T.BLOG).insert(data).returning("*");

        return insertedBlog[0];
    }

    public async getblogbyid(blog_id: number): Promise<any> {
        if (!blog_id) throw new HttpException(400, "Blog ID is required");

        const blog = await DB(T.BLOG).where({ blog_id }).first();
        if (!blog) throw new HttpException(404, "blog not found");

        return blog;
    }

    public async updateblogbyid(data: Partial<BlogDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        if (!data.blog_id) throw new HttpException(400, "blog id is required for update");

        const updated = await DB(T.BLOG)
            .where({ blog_id: data.blog_id })
            .update({ ...data, updated_at: DB.fn.now() })
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Blog not found or not updated");

        return updated[0];

    }

    public async SoftDeleteblog(data: Partial<BlogDto>): Promise<any> {

        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.BLOG)
            .where({ blog_id: data.blog_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Blog not found or not delete");

        return deleted[0];
    }

    public async getallblogsbytable(): Promise<any> {
        try {
            const result = await DB(T.BLOG)
                .where({ is_active: true, is_deleted: false })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching blog');
        }
    }

    public async getDeletedblogbytable(): Promise<any> {
        try {
            const result = await DB(T.BLOG)
                .where({ is_deleted: true })
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching blog');
        }
    }

    public async getBlogsByCategory(categoryname: string): Promise<any[]> {

        if (!categoryname) {
            throw new HttpException(400, "Category name is required");
        }

        const categoryBlogs = await DB(T.BLOG)
            .where('category', categoryname)
            .andWhere('is_deleted', false)
            .andWhere('is_active', true)       
            .orderBy('created_at', 'desc')     
            .select('*');                      
       
        return categoryBlogs;
    }
    public async getblogtypesbytable(categoryname: string): Promise<any> {
         if (!categoryname) {
            throw new HttpException(400, "Category name is required");
        }

            const result = await DB(T.CATEGORY)
                .where({ is_active: true, is_deleted: false, types: 'blog'})
                .select("*");
            return result;
        } catch (error) {
            throw new Error('Error fetching blog');
        
    }
}
export default BlogService;
