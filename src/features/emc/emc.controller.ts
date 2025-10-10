import { Request, Response, NextFunction } from "express";
import { UsersDto } from "../user/user.dto";
import { Users } from "../user/user.interface";
import emcService from "./emc.service";
import HttpException from "../../exceptions/HttpException";

class EmcController {
  public EMCService = emcService;s

  public saveArtworkSelection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { account_type, user_id, projects_task_id, artworks } = req.body;
      
      if (!account_type || !user_id) {
        throw new HttpException(400, 'account_type and user_id are required');
      }

      if (account_type === 'user') {
        if (!projects_task_id || !artworks) {
          throw new HttpException(400, 'projects_task_id and artworks are required for user');
        }
        // For user, artworks should be an array with exactly one element
        if (!Array.isArray(artworks) || artworks.length !== 1) {
          throw new HttpException(400, 'artworks should be an array with exactly one element for user');
        }
        const result = await this.EMCService.saveUserArtworkSelection(user_id, projects_task_id, artworks[0]);
        res.status(200).json({
          data: result,
          message: "Artwork added for user successfully"
        });
      } else if (account_type === 'creator') {
        if (!Array.isArray(artworks) || artworks.length === 0 || artworks.length > 3) {
          throw new HttpException(400, 'artworks should be an array with 1-3 items for creator');
        }
        const result = await this.EMCService.saveCreatorArtworkSelection(user_id, artworks);
        res.status(200).json({
          data: result,
          message: "Artwork added for creator successfully"
        });
      } else {
        throw new HttpException(400, 'Invalid account_type. Must be "user" or "creator"');
      }
    } catch (err: any) {
      next(err);
    }
  };

  public saveCategorySelection = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { account_type, user_id, projects_task_id, category } = req.body;
      
      if (!account_type || !user_id) {
        throw new HttpException(400, 'account_type and user_id are required');
      }

      if (account_type === 'user') {
        if (!projects_task_id || !category) {
          throw new HttpException(400, 'projects_task_id and category are required for user');
        }
        
        const result = await this.EMCService.saveUserCategorySelection(user_id, projects_task_id, category);
        res.status(200).json({
          data: result,
          message: "Category added for user successfully"
        });
      } else if (account_type === 'creator') {

        if (!category) {
          throw new HttpException(400, 'Category is required for creator');
        }

        const result = await this.EMCService.saveCreatorCategorySelection(user_id, category);
        res.status(200).json({
          data: result,
          message: "Category added for creator successfully"
        });
      } else {
        throw new HttpException(400, 'Invalid account_type. Must be "user" or "creator"');
      }
    } catch (err: any) {
      // Handle database constraint violations specifically
      if (err.code === '23514' && err.constraint === 'users_category_check') {
        next(new HttpException(400, 'Enter valid category. Please check the list of available categories.'));
      } else {
        next(err);
      }
    }
  };


  public getRecommendedEditors = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const projectid = parseInt(req.params.projectid);
      if (!projectid) {
        throw new HttpException(400, 'Valid project ID is required');
      }
      
      const result = await this.EMCService.getRecommendedEditors(projectid);
      res.status(200).json({
        data: result,
        message: "Recommended editors retrieved successfully"
      });
    } catch (err: any) {
      next(err);
    }
  };
}

export default EmcController;
