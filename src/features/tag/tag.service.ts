import { TagsDto } from "./tag.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";

class TagsService {

  // Create a new tag
  public async InsertTag(data: TagsDto): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Tag data is empty");
    }

    const insertedTag = await DB(T.TAGS_TABLE).insert(data).returning("*");
    return insertedTag[0];
  }

  // Get all tags
  public async GetAllTags(): Promise<any[]> {
    const tags = await DB(T.TAGS_TABLE).where({ is_deleted: false });
    return tags;
  }

  // Get tag by ID
  public async GetTagById(tagId: number): Promise<any> {
    const tag = await DB(T.TAGS_TABLE)
      .where({ tag_id: tagId, is_deleted: false })
      .first();

    if (!tag) {
      throw new HttpException(404, "Tag not found");
    }

    return tag;
  }

  // Get tags by type
  public async GetTagsByType(type: string): Promise<any[]> {
    const tags = await DB(T.TAGS_TABLE)
      .where({ is_deleted: false, tag_type: type });
    return tags;
  }

  // Update tag
  public async UpdateTag(tagId: number, data: Partial<TagsDto>): Promise<any> {
    if (isEmpty(data)) {
      throw new HttpException(400, "Update data is empty");
    }

    // Check if tag exists
    const existingTag = await DB(T.TAGS_TABLE)
      .where({ tag_id: tagId, is_deleted: false })
      .first();

    if (!existingTag) {
      throw new HttpException(404, "Tag not found");
    }

    const updatedTag = await DB(T.TAGS_TABLE)
      .where({ tag_id: tagId })
      .update({ ...data, updated_at: DB.fn.now() })
      .returning("*");

    return updatedTag[0];
  }

  // Delete tag (soft delete)
  public async DeleteTag(tagId: number, deletedBy: number): Promise<any> {
    const existingTag = await DB(T.TAGS_TABLE)
      .where({ tag_id: tagId, is_deleted: false })
      .first();

    if (!existingTag) {
      throw new HttpException(404, "Tag not found");
    }

    const deletedTag = await DB(T.TAGS_TABLE)
      .where({ tag_id: tagId })
      .update({
        is_deleted: true,
        deleted_by: deletedBy,
        deleted_at: DB.fn.now()
      })
      .returning("*");

    return deletedTag[0];
  }

}
export default TagsService;
