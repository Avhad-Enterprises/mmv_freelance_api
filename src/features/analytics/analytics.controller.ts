import { NextFunction, Request, Response } from 'express';
import AnalyticsService  from './analytics.service';

class AnalyticsController  {

  public AnalyticsService  = new AnalyticsService ();

  public UpdateTrackingId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fieldsToUpdate = req.body;
  
      if (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) {
        res.status(400).json({ error: 'No update data provided' });
        return;
      }
  
      // Assuming you are always updating the single row with id = 1
      const updated = await this.AnalyticsService.update(1, fieldsToUpdate);
  
      res.status(200).json({ data: updated, message: 'analytics settings updated' });
    } catch (error) {
      next(error);
    }
  };
  
  public getTrackingId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tracking = await this.AnalyticsService.getTrackingId();

      if (!tracking) {
         res.status(404).json({ tracking_id: null, message: 'No tracking ID found' });
      }

      res.status(200).json({ tracking_id: tracking.tracking_id });
    } catch (error) {
      next(error);
    }
  };


  }


export default AnalyticsController;