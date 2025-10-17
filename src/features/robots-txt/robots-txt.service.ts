import { VisitorLogDto } from "../visitor-log/visitor-log.dto";
import DB, { T } from "../../../database/index.schema";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";

class robotsservice {
    // Get the latest robots.txt content
    public async getLatestContent(): Promise<string | null> {
        const entry = await DB(T.ROBOTS_TXT).orderBy('updated_at', 'desc').first();
        return entry?.content || null;
    }

    public async getRobotsEntry(): Promise<any> {
        const entry = await DB(T.ROBOTS_TXT).orderBy('updated_at', 'desc').first();
        if (!entry) return null;
        return {
            content: entry.content,
            updated_at: entry.updated_at,
        };
    }

    // Update or create the robots.txt entry
    public async updateOrCreate(content: string, updatedBy: number): Promise<any> {
        const existing = await DB(T.ROBOTS_TXT).first();

        if (existing) {
            await DB(T.ROBOTS_TXT)
                .where({ id: existing.id })
                .update({
                    content,
                    updated_by: updatedBy,
                    updated_at: DB.fn.now(),
                });
            return { id: existing.id, updated: true };
        } else {
            const [id] = await DB(T.ROBOTS_TXT).insert({
                content,
                updated_by: updatedBy,
                created_at: DB.fn.now(),
                updated_at: DB.fn.now(),
            });
            return { id, created: true };
        }
    }

}

export default robotsservice;
