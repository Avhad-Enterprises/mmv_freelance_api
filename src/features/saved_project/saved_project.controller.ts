import { NextFunction, Request, Response } from 'express';
import { SavedProjectsDto } from './saved_project.dto';
import { RequestWithUser } from '../../interfaces/auth.interface';
import Savedprojectservices from './saved_project.service';
import DB, { T } from '../../../database/index.schema';
import HttpException from '../../exceptions/HttpException';


class SavedprojectController {

  public Savedprojectservices = new Savedprojectservices();

  public addsave = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const saveData: SavedProjectsDto = req.body;
      // ✅ Security fix: Set user_id from JWT token instead of trusting client
      saveData.user_id = req.user.user_id;
      
      const inserteddata = await this.Savedprojectservices.addsaved(saveData);
      res.status(201).json({ data: inserteddata, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  }

  public getAllsaved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saved = await this.Savedprojectservices.getAllsaveds();
      res.status(200).json({ data: saved, success: true });
    } catch (err) {
      next(err);
    }
  };
  public removeSavedProject = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body: SavedProjectsDto = req.body;
      // ✅ Security fix: Set user_id from JWT token to ensure users can only remove their own saved projects
      body.user_id = req.user.user_id;
      
      const message = await this.Savedprojectservices.removeSavedProjects(body);
      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      next(error);
    }
  };
  public getUserId = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // ✅ Security fix: Use authenticated user's ID from JWT token instead of req.body
      const user_id = req.user.user_id;

      const saved = await this.Savedprojectservices.getsavedbyuser_id(user_id);
      res.status(200).json({ data: saved, message: "User's saved projects fetched successfully" });
    } catch (error) {
      next(error);
    }
  };


}

export default SavedprojectController; 