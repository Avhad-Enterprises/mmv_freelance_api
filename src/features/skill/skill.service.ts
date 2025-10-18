import { SkillsDto } from "./skill.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";

class SkillsService {

  // Create a new skill
  public async InsertSkill(data: SkillsDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Skill data is empty");
    }

    const insertedSkill = await DB(T.SKILLS).insert(data).returning("*");
    return insertedSkill[0];
  }

  // Get all skills
  public async GetAllSkills(): Promise<any[]> {
    const skills = await DB(T.SKILLS).where({ is_deleted: false });
    return skills;
  }

  // Get skill by ID
  public async GetSkillById(skillId: number): Promise<any> {
    const skill = await DB(T.SKILLS)
      .where({ skill_id: skillId, is_deleted: false })
      .first();

    if (!skill) {
      throw new HttpException(404, "Skill not found");
    }

    return skill;
  }

  // Update skill
  public async UpdateSkill(skillId: number, data: Partial<SkillsDto>): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Update data is empty");
    }

    // Check if skill exists
    const existingSkill = await DB(T.SKILLS)
      .where({ skill_id: skillId, is_deleted: false })
      .first();

    if (!existingSkill) {
      throw new HttpException(404, "Skill not found");
    }

    const updatedSkill = await DB(T.SKILLS)
      .where({ skill_id: skillId })
      .update({ ...data, updated_at: DB.fn.now() })
      .returning("*");

    return updatedSkill[0];
  }

  // Delete skill (soft delete)
  public async DeleteSkill(skillId: number, deletedBy: number): Promise<any> {
    const existingSkill = await DB(T.SKILLS)
      .where({ skill_id: skillId, is_deleted: false })
      .first();

    if (!existingSkill) {
      throw new HttpException(404, "Skill not found");
    }

    const deletedSkill = await DB(T.SKILLS)
      .where({ skill_id: skillId })
      .update({
        is_deleted: true,
        deleted_by: deletedBy,
        deleted_at: DB.fn.now()
      })
      .returning("*");

    return deletedSkill[0];
  }

}
export default SkillsService;