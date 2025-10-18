import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from "../../middlewares/validation.middleware";
import SkillsController from "./skill.controller";
import { SkillsDto } from "./skill.dto";

/**
 * Skills Routes
 * Handles all skill-related API endpoints with role-based access control
 * Restricted to ADMIN and SUPER_ADMIN roles only
 */
class SkillsRoute implements Route {
    public path = "/skills";
    public router = Router();
    public skillsController = new SkillsController();

    constructor() {
        this.initializeRoutes();
    }

    /**
     * Initialize all skill routes with proper middleware
     */
    private initializeRoutes() {
        /**
         * Create a new skill
         * POST /api/v1/skills
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.post(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(SkillsDto, 'body', false, []),
            this.skillsController.createSkill
        );

        /**
         * Get all skills
         * GET /api/v1/skills
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.skillsController.getAllSkills
        );

        /**
         * Get skill by ID
         * GET /api/v1/skills/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.get(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.skillsController.getSkillById
        );

        /**
         * Update skill
         * PUT /api/v1/skills/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.put(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            validationMiddleware(SkillsDto, 'body', true, []),
            this.skillsController.updateSkill
        );

        /**
         * Delete skill (soft delete)
         * DELETE /api/v1/skills/:id
         * Requires: ADMIN or SUPER_ADMIN role
         */
        this.router.delete(
            `${this.path}/:id`,
            requireRole('ADMIN', 'SUPER_ADMIN'),
            this.skillsController.deleteSkill
        );
    }
}

export default SkillsRoute;