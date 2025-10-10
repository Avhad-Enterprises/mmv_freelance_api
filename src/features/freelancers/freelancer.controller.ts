import { Request, Response, NextFunction } from 'express';
import FreelancerService from './freelancer.service';
import { FreelancerUpdateDto } from '../freelancers/freelancer.update.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import VideoEditorService from '../videoeditors/videoeditor.service';


//Freelancer Controller

export class FreelancerController {
    private freelancerService = new FreelancerService();

    public getAllFreelancers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const freelancers = await this.freelancerService.getAllFreelancers();

            res.status(200).json({
                success: true,
                count: freelancers.length,
                data: freelancers
            });
        } catch (error) {
            next(error);
        };
    }
    public getAvailableFreelancers = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const freelancers = await this.freelancerService.getAvailableFreelancers();

            res.status(200).json({
                success: true,
                count: freelancers.length,
                data: freelancers
            });
        } catch (error) {
            next(error);
        }
    }
}
