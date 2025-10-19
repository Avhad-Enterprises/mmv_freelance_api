import { Router } from 'express';
import Route from '../../interfaces/route.interface';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import favoritescontroller from './favorites.controller';
import { favoritesDto, CreateFavoriteDto, RemoveFavoriteDto } from './favorites.dto';

class favoritesRoute implements Route {

  public path = '/favorites';
  public router = Router();
  public favoritescontroller = new favoritescontroller();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     *    POST /favorites/add-freelancer
     *    Add a freelancer to user's favorites list
     *    🔐 Authentication required
     */
    this.router.post(
      `${this.path}/add-freelancer`, 
      validationMiddleware(CreateFavoriteDto, 'body', false, []), 
      this.favoritescontroller.addFavorite
    );

    /**
     *    DELETE /favorites/remove-freelancer
     *    Remove a freelancer from user's favorites list
     *    🔐 Authentication required
     */
    this.router.delete(
      `${this.path}/remove-freelancer`, 
      validationMiddleware(RemoveFavoriteDto, 'body', false, []), 
      this.favoritescontroller.removeFavorite
    );

    /**
     *   GET /favorites/all
     *   Get list of all favorites (admin only)
     *   ⚠️ Admin operation
     */
    this.router.get(
      `${this.path}/all`, 
      requireRole('ADMIN', 'SUPER_ADMIN'), 
      this.favoritescontroller.listFavoriteFreelancers
    );

    /**
     *    GET /favorites/my-favorites
     *    Get user's favorite freelancers
     *    🔐 Authentication required
     */
    this.router.get(
      `${this.path}/my-favorites`, 
      this.favoritescontroller.getMyFavorites
    );

    /**
     *    GET /favorites/my-favorites-details
     *    Get comprehensive information about user's favorite freelancers
     *    🔐 Authentication required
     */
    this.router.get(
      `${this.path}/my-favorites-details`, 
      this.favoritescontroller.getMyFavoritesDetails
    );
  }
}

export default favoritesRoute;
