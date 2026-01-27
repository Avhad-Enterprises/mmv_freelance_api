import { NextFunction, Request, Response } from 'express';
import { CreateCareerDto, UpdateCareerDto } from './careers.dto';
import CareersService from './careers.service';
import { RequestWithUser } from '../../interfaces/auth.interface';

class CareersController {
    public careersService = new CareersService();

    public getCareers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // If user is admin (you might want to check roles here, but for now let's serve all non-deleted)
            // Or we can differentiate endpoints. Let's assume GET /careers serves all for list view.
            // If public only needed, we could add a query param or separate route.
            // For now, let's return all active jobs if no auth, or specific logic.
            // Actually, standard pattern: GET /careers -> Public (Active only), GET /admin/careers -> All
            // But adhering to the requested single route structure usually:

            // Let's return ALL for now as admin needs to see inactive ones too. 
            // ideally we filter by 'active=true' query param for public site.

            const findAllCareersData = await this.careersService.GetAllCareers();
            res.status(200).json({ data: findAllCareersData, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    public getCareerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const careerId = Number(req.params.id);
            const findOneCareerData = await this.careersService.GetCareerById(careerId);

            res.status(200).json({ data: findOneCareerData, message: 'findOne' });
        } catch (error) {
            next(error);
        }
    };

    public createCareer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const careerData: CreateCareerDto = req.body;
            const userId = req.user?.user_id || 1; // Default to 1 if not authed (should be protected)

            const createCareerData = await this.careersService.CreateCareer(careerData, userId);

            res.status(201).json({ data: createCareerData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };

    public updateCareer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const careerId = Number(req.params.id);
            const careerData: UpdateCareerDto = req.body;
            const userId = req.user?.user_id || 1;

            const updateCareerData = await this.careersService.UpdateCareer(careerId, careerData, userId);

            res.status(200).json({ data: updateCareerData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };

    public deleteCareer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const careerId = Number(req.params.id);
            const userId = req.user?.user_id || 1;

            const deleteCareerData = await this.careersService.DeleteCareer(careerId, userId);

            res.status(200).json({ data: deleteCareerData, message: 'deleted' });
        } catch (error) {
            next(error);
        }
    };
}

export default CareersController;
