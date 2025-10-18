import { ProjectsTaskDto } from "../projectstask/projectstask.dto";
import DB, { T } from "../../../database/index";
import { IProjectTask } from "../projectstask/projectstask.interface";
import HttpException from "../../exceptions/HttpException";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToAws } from '../../utils/legacy-upload';

class ProjectTaskService {

    // Upload a file to AWS S3
    public async uploadFileToS3(filename: string, base64String: string): Promise<string> {
        try {
            const fileUrl = await uploadToAws(filename, base64String);
            return fileUrl; // uploadToAws returns a string URL
        } catch (error) {
            console.error('Error in service:', error.message);
            throw new HttpException(500, 'Error uploading file to S3');
        }
    }
}

export default ProjectTaskService;