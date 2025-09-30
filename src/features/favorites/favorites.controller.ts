import { NextFunction, Request, Response } from 'express';
import { favoritesDto } from './favorites.dto';
import favoritesservices from './favorites.service';
import DB, { T } from '../../../database/index.schema';
import HttpException from '../../exceptions/HttpException';


class favoritescontroller {

    public favoritesservices = new favoritesservices();

    public addFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {

            const userData: favoritesDto = req.body;
            const insertedData = await this.favoritesservices.Insert(userData);
            res.status(201).json({ data: insertedData, message: "Added to favorites" });
        } catch (error) {
            next(error);
        }
    };

    public removeFavorite = async (req: Request, res: Response, next: NextFunction) => {

        try {
            console.log("inside a function");
            console.log(req.body);
            const result = await this.favoritesservices.removeFavorite(req.body);
            res.status(200).json({ message: result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    public listFavoriteFreelancers = async (_req: Request, res: Response): Promise<void> => {
        try {
            const favorites = await this.favoritesservices.getFavoriteFreelancers();

            res.status(200).json({ total: favorites.length, data: favorites, message: 'All Freelancers fetched successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };

    public getfreelance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { user_id } = req.body;
            if (!user_id) throw new HttpException(400, "User ID is required");

            const favorites = await this.favoritesservices.getFavoritesByUser(user_id);
            res.status(200).json({ data: favorites, message: "User fetched successfully" });
        } catch (error) {
            next(error);
        }
    };

    public getfreelanceinfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

        try {

            const { user_id } = req.body;

            if (isNaN(user_id)) {
                throw new HttpException(400, "Invalid user_id");
            }


            const favorites = await this.favoritesservices.getfreelanceinfo(user_id);

            if (!favorites || favorites.length === 0) {
                throw new HttpException(404, "No favorite freelancers found");
            }

            res.status(200).json({
                data: favorites,
                message: "Favorite freelancers fetched successfully",
            });
        } catch (error) {
            next(error);
        }
    };


}

export default favoritescontroller; 
