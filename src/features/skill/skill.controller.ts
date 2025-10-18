import { NextFunction, Request, Response } from "express";
import { SkillsDto } from "./skill.dto";
import SkillsService from "./skill.service";

class SkillsController {
    public SkillsService = new SkillsService();

    // POST /api/skills
    // Create a new skill entry
    public createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skillData: SkillsDto = req.body;
            const insertedSkill = await this.SkillsService.InsertSkill(skillData);
            res.status(201).json({ data: insertedSkill, message: "Skill created successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/skills
    // Get all skills
    public getAllSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skills = await this.SkillsService.GetAllSkills();
            res.status(200).json({ data: skills, message: "Skills fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/skills/:id
    // Get skill by ID
    public getSkillById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skillId = parseInt(req.params.id);
            const skill = await this.SkillsService.GetSkillById(skillId);
            res.status(200).json({ data: skill, message: "Skill fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    // PUT /api/skills/:id
    // Update skill
    public updateSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skillId = parseInt(req.params.id);
            const updateData: Partial<SkillsDto> = req.body;
            const updatedSkill = await this.SkillsService.UpdateSkill(skillId, updateData);
            res.status(200).json({ data: updatedSkill, message: "Skill updated successfully" });
        } catch (error) {
            next(error);
        }
    };

    // DELETE /api/skills/:id
    // Delete skill (soft delete)
    public deleteSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const skillId = parseInt(req.params.id);
            const deletedBy = req.body.deleted_by || 1; // Use deleted_by from body or default to 1
            const deletedSkill = await this.SkillsService.DeleteSkill(skillId, deletedBy);
            res.status(200).json({ data: deletedSkill, message: "Skill deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

}

export default SkillsController;