import { NextFunction, Request, Response } from 'express';
import { favoritesDto } from './favorites.dto';
import favoritesservices from './favorites.service';
import DB, { T } from '../../../database/index';
import HttpException from '../../exceptions/HttpException';
import { RequestWithUser } from '../../interfaces/auth.interface';


class favoritescontroller {
    public favoritesservices = new favoritesservices();

    /**
     * Adds a freelancer to client's favorites list
     */
    public addFavorite = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: favoritesDto = {
                ...req.body,
                user_id: req.user.user_id,
                created_by: req.user.user_id
            };
            const insertedData = await this.favoritesservices.Insert(userData);
            res.status(201).json({ data: insertedData, message: "Added to favorites" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Removes a freelancer from client's favorites list
     */
    public removeFavorite = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body: favoritesDto = {
                ...req.body,
                user_id: req.user.user_id
            };
            const result = await this.favoritesservices.removeFavorite(body);
            res.status(200).json({ success: true, message: result });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Retrieves all favorite freelancers (Admin only)
     */
    public listFavoriteFreelancers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const favorites = await this.favoritesservices.getFavoriteFreelancers();
            res.status(200).json({ total: favorites.length, data: favorites, message: 'All favorites fetched successfully' });
        } catch (err) {
            next(err);
        }
    };

    /**
     * Gets favorite freelancers for a user
     */
    public getMyFavorites = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const favorites = await this.favoritesservices.getFavoritesByUser(user_id);
            res.status(200).json({ data: favorites, message: "User's favorite freelancers fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Gets detailed information about user's favorite freelancers
     */
    public getMyFavoritesDetails = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const favorites = await this.favoritesservices.getfreelanceinfo(user_id);

            if (!favorites || favorites.length === 0) {
                res.status(200).json({
                    data: [],
                    message: "No favorite freelancers found",
                });
                return;
            }

            res.status(200).json({
                data: favorites,
                message: "Favorite freelancers details fetched successfully",
            });
        } catch (error) {
            next(error);
        }
    };


}

export default favoritescontroller; 
