import { NextFunction, Request, Response } from "express";
import { TagsDto } from "./tag.dto";
import TagsService from "./tag.service";

class TagsController {
    public TagsService = new TagsService();

    // POST /api/tags
    // Create a new tag entry
    public createTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagData: TagsDto = req.body;
            const insertedTag = await this.TagsService.InsertTag(tagData);
            res.status(201).json({ success: true, data: insertedTag, message: "Tag created successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/tags
    // Get all tags
    public getAllTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.TagsService.GetAllTags();
            res.status(200).json({ success: true, data: tags, message: "Tags fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/tags/:id
    // Get tag by ID
    public getTagById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagId = parseInt(req.params.id as string);
            const tag = await this.TagsService.GetTagById(tagId);
            res.status(200).json({ success: true, data: tag, message: "Tag fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/tags/type/:type
    // Get tags by type
    public getTagsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const type = req.params.type as string;
            const tags = await this.TagsService.GetTagsByType(type);
            res.status(200).json({ success: true, data: tags, message: `Tags of type '${type}' fetched successfully` });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/tags/:id
    // Update tag
    public updateTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagId = parseInt(req.params.id as string);
            const updateData: Partial<TagsDto> = req.body;
            const updatedTag = await this.TagsService.UpdateTag(tagId, updateData);
            res.status(200).json({ success: true, data: updatedTag, message: "Tag updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/tags/:id
    // Delete tag (soft delete)
    public deleteTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagId = parseInt(req.params.id as string);
            const deletedBy = req.body.deleted_by || 1; // Use deleted_by from body or default to 1
            const deletedTag = await this.TagsService.DeleteTag(tagId, deletedBy);
            res.status(200).json({ success: true, data: deletedTag, message: "Tag deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

}

export default TagsController;
