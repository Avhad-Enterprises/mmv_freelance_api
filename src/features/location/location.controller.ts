import DB from "../../../database/index.schema";
import { NextFunction, Request, Response } from "express";
import locationService from "./location.service";
import HttpException from "../../exceptions/HttpException";

class locationController {

    public locationService = new locationService();

    public getAllCountry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const countries = await this.locationService.getAllCountries();
            res.status(200).json({ data: countries, message: 'Countries fetched successfully' });
        } catch (error) {
            next(error);
        }
    };

    public getstatesby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const country_id = Number(req.params.country_id);
            const states = await this.locationService.getStatesByCountry(country_id);
            res.status(200).json({ data: states, message: 'States fetched successfully' });
        } catch (error) {
            next(error);
        }
    };

    public getcitiesby = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const state_id = Number(req.params.state_id);
            const cities = await this.locationService.getCitiesByState(state_id);
            res.status(200).json({ data: cities, message: 'Cities fetched successfully' });
        } catch (error) {
            next(error);
        }
    };

    public getStatesBy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { country_id } = req.body;

            if (!country_id) {
                res.status(400).json({ message: 'Country ID is required' });
                return;
            }

            const states = await this.locationService.getStatesByCountry(Number(country_id));
            res.status(200).json({ data: states, message: 'States fetched successfully' });
        } catch (error) {
            next(error);
        }
    };
    
    public getCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { state_id } = req.body;

            const parsed = Number(state_id);
            if (!state_id || Number.isNaN(parsed)) {
                res.status(400).json({ message: 'Valid state_id is required' });
                return;
            }

            const cities = await this.locationService.getCitiesBy(parsed);
            res.status(200).json({ data: cities, message: 'Cities fetched successfully' });
        } catch (error) {
            next(error);
        }
    };

}
export default locationController;