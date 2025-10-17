import { Router } from "express";
import Route from "../../interfaces/route.interface";
import { requireRole } from '../../middlewares/role.middleware';

import validationMiddleware from "../../middlewares/validation.middleware";
import TagsController from "./tag.controller";
import { TagsDto } from "./tag.dto";
import { SkillsDto } from "./skill.dto";

class TagsRoute implements Route {
    public path = "/tags";
    public router = Router();
    public tagsController = new TagsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        //Create a new tag entry
        this.router.post(`${this.path}/insertetag`, validationMiddleware(TagsDto, 'body', false, []), this.tagsController.insertTag);
        //Get all event tags
        this.router.get(`${this.path}/geteventtags`, (req, res, next) => this.tagsController.getTagsByType(req, res, next));
        //Create a new skill entry
        this.router.post(`${this.path}/insertskill`, validationMiddleware(SkillsDto, 'body', false, []), this.tagsController.insertskills);
        //Get all skills
        this.router.get(`${this.path}/getallskill`, (req, res, next) => this.tagsController.getallskills(req, res, next));

    }
}

export default TagsRoute;
