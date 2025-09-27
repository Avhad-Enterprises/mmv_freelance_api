import { SavedProjectsDto } from "../dtos/saved_project.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import { SAVED_PROJECTS } from "../database/saved_project.schema";


class Savedprojectservices {

  public async addsaved(data: SavedProjectsDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Data Invalid");
    }
    const res = await DB(T.SAVED_PROJECTS)
      .insert(data)
      .returning("*");
    return res[0];
  }

  public getAllsaveds = async (): Promise<SavedProjectsDto[]> => {
    try {
      const result = await DB(T.SAVED_PROJECTS)
        .select("*");
      return result;
    } catch (error) {
      throw new Error('Error fetching saved');
    }
  }
  public async removeSavedProjects(dto: SavedProjectsDto): Promise<string> {
    const { user_id, projects_task_id, deleted_by } = dto;

    const existing = await DB(T.SAVED_PROJECTS)
      .where({ user_id, projects_task_id, is_deleted: false })
      .first();

    if (!existing) {
      throw new HttpException(404, 'Saved project not found');
    }

    await DB(T.SAVED_PROJECTS)
      .where({ user_id, projects_task_id })
      .update({
        is_deleted: true,
        deleted_by: deleted_by ?? user_id,
        deleted_at: new Date(),
        updated_by: deleted_by ?? user_id,
        updated_at: new Date(),
      });

    return 'Saved project removed successfully';
  }
  public async getsavedbyuser_id(user_id: number): Promise<any> {
    const saved = await DB(T.SAVED_PROJECTS)
      .where({ user_id, is_active: true })
      .first();

    if (!saved) throw new HttpException(404, "User not found");
    return saved;
  }


}

export default Savedprojectservices;