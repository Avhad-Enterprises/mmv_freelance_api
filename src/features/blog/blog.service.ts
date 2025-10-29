import { BlogDto } from './blog.dto';
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";

class BlogService {
    /**
     * Get all active and non-deleted blogs
     */
    public async getAllActiveBlogs(): Promise<any> {
        try {
            const result = await DB(T.BLOG)
                .where({ is_active: true, is_deleted: false })
                .select("*")
                .orderBy('created_at', 'desc');
            return result;
        } catch (error) {
            throw new HttpException(500, 'Error fetching blogs');
        }
    }

    /**
     * Get a single blog by ID
     */
    public async getBlogById(blog_id: number): Promise<any> {
        if (!blog_id) throw new HttpException(400, "Blog ID is required");

        const blog = await DB(T.BLOG)
            .where({ blog_id, is_deleted: false })
            .first();
            
        if (!blog) throw new HttpException(404, "Blog not found");

        return blog;
    }

    /**
     * Create a new blog
     */
    public async createBlog(data: BlogDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Blog data is empty");
        }

        // Validate required fields
        if (!data.title || !data.slug || !data.author_name) {
            throw new HttpException(400, "Title, slug, and author_name are required fields");
        }

        // Set default values and audit fields
        const blogData = {
            ...data,
            created_by: data.created_by || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_deleted: false,
            status: data.status || 'draft',
            views: 0,
            comment_count: 0,
            reading_time: data.reading_time || 0
        };

        const insertedBlog = await DB(T.BLOG).insert(blogData).returning("*");
        return insertedBlog[0];
    }

    /**
     * Update an existing blog
     */
    public async updateBlog(data: Partial<BlogDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        if (!data.blog_id) throw new HttpException(400, "Blog ID is required for update");

        const updateData = {
            ...data,
            updated_by: data.updated_by || 1,
            updated_at: DB.fn.now()
        };

        const updated = await DB(T.BLOG)
            .where({ blog_id: data.blog_id })
            .update(updateData)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Blog not found or not updated");

        return updated[0];
    }

    /**
     * Soft delete a blog
     */
    public async deleteBlog(data: Partial<BlogDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        if (!data.blog_id) throw new HttpException(400, "Blog ID is required for deletion");

        const deleteData = {
            is_deleted: true,
            deleted_by: data.deleted_by || 1,
            deleted_at: DB.fn.now()
        };

        const deleted = await DB(T.BLOG)
            .where({ blog_id: data.blog_id })
            .update(deleteData)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Blog not found or not deleted");

        return deleted[0];
    }
}

export default BlogService;
