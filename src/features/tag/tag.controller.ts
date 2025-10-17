import { NextFunction, Request, Response } from "express";
import { TagsDto } from "./tag.dto";
import { SkillsDto } from "./skill.dto";
import TagsService from "./tag.service";
import { generateToken } from "../../utils/auth/jwt";
import HttpException from "../../exceptions/HttpException";

class TagsController {
    public TagsService = new TagsService();

    // POST /api/tags/insertetag
    // Create a new tag entry
    public insertTag = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tagData: TagsDto = req.body;
            const insertedTag = await this.TagsService.InsertTag(tagData);
            res.status(201).json({ data: insertedTag, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/tags/geteventtags
    // Get all event tags
    public getTagsByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tags = await this.TagsService.GetTagsByType("events");
            res.status(200).json({ data: tags, message: "Fetched tags of type 'events'" });
        } catch (error) {
            next(error);
        }
    };
    // POST /api/tags/insertskill
    // Create a new skill entry
    public insertskills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skillData: SkillsDto = req.body;
            const insertedskill = await this.TagsService.insertskillsby(skillData);
            res.status(201).json({ data: insertedskill, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/tags/getallskill
    // Retrieve all skill entries
    public getallskills = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const skill = await this.TagsService.getallskillsby();
            res.status(200).json({ data: skill, success: true });
        } catch (err) {
            next(err);
        }
    };

}

export default TagsController;
