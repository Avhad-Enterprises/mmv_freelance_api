import { Request, Response } from 'express';
import robotsservice from './robots-txt.service';
import { RequestHandler } from 'express-serve-static-core';
import HttpException from '../../exceptions/HttpException';
import { ROBOTS_TXT } from '../../../database/robotstxt.schema';


class robotscontroller {

    public robotsservice = new robotsservice();
    public getPublicRobots = async (req: Request, res: Response): Promise<void> => {
        try {
            const content = await this.robotsservice.getLatestContent();

            res.setHeader('Content-Type', 'text/plain');
            res.status(200).send(content || 'User-agent: *\nDisallow:');
        } catch (error) {
            console.error('Error fetching robots.txt:', error);
            res.status(500).send('Internal Server Error');
        }
    };

    public viewRobots = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.robotsservice.getRobotsEntry();
            res.status(200).json(data || { content: '' });
        } catch (err) {
            res.status(500).json({ error: 'Error fetching robots data' });
        }
    };

    public updateRobots = async (req: Request, res: Response): Promise<void> => {
        try {
            const { content, updated_by  } = req.body;

            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return
            }

            const updated = await this.robotsservice.updateOrCreate(content, updated_by );
            res.status(200).json({ message: 'robots.txt updated', updated });
        } catch (err) {
            res.status(500).json({ error: 'Error updating robots.txt' });
        
        }
    };


}

export default robotscontroller; 
