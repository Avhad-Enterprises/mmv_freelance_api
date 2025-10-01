import { TagsDto } from "./tag.dto";
import { SkillsDto } from "./skill.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class TagsService {

  public async InsertTag(data: TagsDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Tag data is empty");
    }

    const insertedTag = await DB(T.TAGS_TABLE).insert(data).returning("*");
    return insertedTag[0];
  }

  public async GetTagsByType(type: string): Promise<any[]> {
    const tags = await DB(T.TAGS_TABLE)
      .where({ is_deleted: false, tag_type: type });
    return tags;
  }

  public async GetAllTags(): Promise<any[]> {
    const tags = await DB(T.TAGS_TABLE).where({ is_deleted: false });
    return tags;
  }
  
  public async insertskillsby(data: SkillsDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "skill data is empty");
    }

    // Check if skill already exists (case insensitive)
    const existingSkill = await DB(T.SKILLS)
      .whereRaw('LOWER(skill_name) = ?', [data.skill_name.toLowerCase()])
      .first();

    if (existingSkill) {
      throw new HttpException(400, "This skill already exists in the database");
    }

    const insertedskill = await DB(T.SKILLS).insert(data).returning("*");
    return insertedskill[0];
  }
  
  public getallskillsby = async (): Promise<SkillsDto[]> => {
    try {
      const result = await DB(T.SKILLS)
        .select("*")
        .distinct(); // This ensures we get unique records
      
      // Further ensure uniqueness by skill name if needed
      const uniqueSkills = result.filter((skill, index, self) =>
        index === self.findIndex((s) => s.skill_name === skill.skill_name)
      );
      
      return uniqueSkills;
    } catch (error) {
      throw new Error('Error fetching SKILL');
    }
  }

}
export default TagsService;
