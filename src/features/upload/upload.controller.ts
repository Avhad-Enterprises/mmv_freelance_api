import { NextFunction, Request, Response } from 'express';
import UploadtoAWSService from "./upload.service";
import HttpException from '../../exceptions/HttpException';

class UploadToAWSController {
    public UploadtoAWSService = new UploadtoAWSService();

    // POST /files/uploadtoaws - Upload a file to AWS S3
    public insertfiletoaws = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { filename, base64String } = req.body;

            if (!filename || !base64String) {
                throw new HttpException(400, 'Filename and base64 string are required');
            }
            const fileUrl = await this.UploadtoAWSService.uploadFileToS3(filename, base64String);
            res.status(200).json({
                message: 'File uploaded successfully',
                fileUrl: fileUrl,
            });
        } catch (error) {
            next(error instanceof HttpException ? error : new HttpException(500, 'Failed to upload file'));
        }
    };
}

export default UploadToAWSController;
