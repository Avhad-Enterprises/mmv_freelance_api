import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import favoritescontroller from './favorites.controller';
import { favoritesDto } from './favorites.dto';

class favoritesRoute implements Route {

  public path = '/favorites';
  public router = Router();
  public favoritescontroller = new favoritescontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     *    POST /favorites/add
     *    Add a freelancer to user's favorites list
     */
    this.router.post(`${this.path}/add`, validationMiddleware(favoritesDto, 'body', false, []), this.favoritescontroller.addFavorite);

    /**
     *    POST /favorites/remove
     *    Remove a freelancer from user's favorites list
     */
    this.router.post(`${this.path}/remove`, this.favoritescontroller.removeFavorite);

    /**
     *   GET /favorites/listfreelancers
     *   Get list of all favorite freelancers for a client
     */
    this.router.get(`${this.path}/listfreelancers`, this.favoritescontroller.listFavoriteFreelancers);

    /**
     *    POST /favorites/getfreelancebyid
     *    Get specific favorite freelancer details by ID
     */
    this.router.post(`${this.path}/getfreelancebyid`, this.favoritescontroller.getfreelance);

    /**
     *    POST /favorites/freelance-info
     *    Get comprehensive freelancer information including portfolio and reviews
     */
    this.router.post(`${this.path}/freelance-info`, this.favoritescontroller.getfreelanceinfo);
  }
}

export default favoritesRoute;
