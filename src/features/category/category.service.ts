import { CategoryDto } from "./category.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import { CATEGORY } from "../../../database/category.schema";

class CategoryService {

    /**
     * Creates a new category or reactivates a deleted one
     */
    public async addtocategory(data: CategoryDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Category data is empty");
        }
        try {
            if (!data.value) {
                throw new HttpException(400, "Category value is required");
            }
            data.value = data.value.trim();
            const existingCategory = await DB(T.CATEGORY)
                .whereRaw('LOWER(TRIM(value)) = ?', [data.value.toLowerCase()])
                .first();

            if (existingCategory) {
                if (!existingCategory.is_deleted) {
                    throw new HttpException(400, "This category already exists in the database");
                } else {
                    const updatedCategory = await DB(T.CATEGORY)
                        .where({ category_id: existingCategory.category_id })
                        .update({
                            is_deleted: false,
                            is_active: true,
                            ...data
                        })
                        .returning("*");
                    return updatedCategory[0];
                }
            }

            // If we reach here, it's a new unique category
            const insertedCategory = await DB(T.CATEGORY)
                .insert({
                    ...data,
                    is_active: true,
                    is_deleted: false
                })
                .returning("*");

            return insertedCategory[0];
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(500, "Error creating category");
        }
    }

    /**
     * Retrieves a single category by ID
     */
    public async geteditcategorybyid(category_id: number): Promise<any> {
        if (!category_id) throw new HttpException(400, "Category ID is required");

        const category = await DB(T.CATEGORY).where({ category_id }).first();
        if (!category) throw new HttpException(404, "category not found");

        return category;
    }

    /**
     * Retrieves all non-deleted categories
     */
    public async getallcategorysbytable(): Promise<any> {
        try {
            const query = DB(T.CATEGORY)
                .where({ is_deleted: false })
                .select(
                    'category_id',
                    'category_name',
                    'category_type',
                    'is_active'
                )
                .orderBy('category_id');

            console.log('Executing query:', query.toString());

            const result = await query;
            console.log('Query result:', result);

            if (!result || result.length === 0) {
                console.log('No categories found in database');
                return []; // Return empty array instead of error for no results
            }

            return result;
        } catch (error) {
            console.error('Database error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack,
                sqlMessage: error.sqlMessage,
                sql: error.sql
            });

            if (error instanceof HttpException) {
                throw error;
            }

            const errorMessage = error.sqlMessage || error.message || 'Error fetching categories';
            throw new HttpException(500, `Database error: ${errorMessage}`);
        }
    }

    /**
     * Gets categories filtered by type
     */
    public async getcategorytypesbytable(type: string): Promise<any> {
        try {
            if (!type) {
                throw new HttpException(400, "Category name is required");
            }
            const result = await DB(T.CATEGORY)
                .where({ is_active: true, is_deleted: false, type: type })
                .select("*");
            return result;
        } catch (error) {
            throw new HttpException(500, 'Error fetching category');
        }
    }

    /**
     * Updates category details
     */
    public async updatecategoryid(data: Partial<CategoryDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        const updated = await DB(T.CATEGORY)
            .where({ category_id: data.category_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Category not found or not updated");

        return updated[0];
    }

    /**
     * Soft deletes a category (marks as deleted)
     */
    public async SoftDeletecategory(data: Partial<CategoryDto>): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Data is required");

        const deleted = await DB(T.CATEGORY)
            .where({ category_id: data.category_id })
            .update(data)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Category not found or not delete");

        return deleted[0];
    }
    public async getvideoeditingid(category_id: number): Promise<any> {
        if (!category_id) throw new HttpException(400, "Category ID is required");

        const category = await DB(T.CATEGORY).where({ category_id }).first();
        if (!category) throw new HttpException(404, "category not found");

        return category;
    }


}
export default CategoryService;