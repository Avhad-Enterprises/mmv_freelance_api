import { CreateCareerDto, UpdateCareerDto } from "./careers.dto";
import DB, { T } from "../../../database/index";
import HttpException from "../../exceptions/HttpException";
import { isEmpty } from "../../utils/common";

class CareersService {

    // Create a new career job posting
    public async CreateCareer(data: CreateCareerDto, userId: number): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Career data is empty");
        }

        const insertData = {
            ...data,
            created_by: userId
        };

        const insertedCareer = await DB(T.CAREERS_TABLE).insert(insertData).returning("*");
        return insertedCareer[0];
    }

    // Get all careers (Active and Inactive, for Admin)
    public async GetAllCareers(): Promise<any[]> {
        const careers = await DB(T.CAREERS_TABLE)
            .where({ is_deleted: false })
            .orderBy('created_at', 'desc');
        return careers;
    }

    // Get public careers (Only Active, for Frontend)
    public async GetPublicCareers(): Promise<any[]> {
        const careers = await DB(T.CAREERS_TABLE)
            .where({ is_deleted: false, is_active: true })
            .orderBy('created_at', 'desc');
        return careers;
    }

    // Get career by ID
    public async GetCareerById(id: number): Promise<any> {
        const career = await DB(T.CAREERS_TABLE)
            .where({ job_id: id, is_deleted: false })
            .first();

        if (!career) {
            throw new HttpException(404, "Job not found");
        }

        return career;
    }

    // Update career
    public async UpdateCareer(id: number, data: UpdateCareerDto, userId: number): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Update data is empty");
        }

        // Check if job exists
        const existingCareer = await DB(T.CAREERS_TABLE)
            .where({ job_id: id, is_deleted: false })
            .first();

        if (!existingCareer) {
            throw new HttpException(404, "Job not found");
        }

        const updateData = {
            ...data,
            updated_by: userId,
            updated_at: DB.fn.now()
        };

        const updatedCareer = await DB(T.CAREERS_TABLE)
            .where({ job_id: id })
            .update(updateData)
            .returning("*");

        return updatedCareer[0];
    }

    // Delete career (soft delete)
    public async DeleteCareer(id: number, deletedBy: number): Promise<any> {
        console.log(`Attempting to delete career with ID: ${id}, deleted by user: ${deletedBy}`);

        const existingCareer = await DB(T.CAREERS_TABLE)
            .where({ job_id: id, is_deleted: false })
            .first();

        if (!existingCareer) {
            console.log(`Career with ID ${id} not found or already deleted`);
            throw new HttpException(404, "Job not found");
        }

        console.log(`Found career: ${existingCareer.title}, proceeding with soft delete`);

        const deletedCareer = await DB(T.CAREERS_TABLE)
            .where({ job_id: id })
            .update({
                is_deleted: true,
                deleted_by: deletedBy,
                deleted_at: DB.fn.now()
            })
            .returning("*");

        console.log(`Successfully deleted career with ID: ${id}`);
        return deletedCareer[0];
    }
}

export default CareersService;
