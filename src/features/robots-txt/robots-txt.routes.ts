import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { RequestHandler } from 'express';
import validationMiddleware from '../../middlewares/validation.middleware';
import robotstxtcontroller from './robots-txt.controller';
import { RobotsDto } from './robots-txt.dto';


class robotstxtRoutes implements Route {

  public path = '/robots';
  public router = Router();
  public robotstxtcontroller = new robotstxtcontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    //robots_txt section  , validationMiddleware(robotsDto, 'body', false, [])
    this.router.get(`${this.path}.txt`, this.robotstxtcontroller.getPublicRobots);
    this.router.get(`${this.path}/view`, this.robotstxtcontroller.viewRobots );
    this.router.post(`${this.path}/update`, validationMiddleware(RobotsDto, 'body', false, []),this.robotstxtcontroller.updateRobots);

  }
}

export default robotstxtRoutes;
