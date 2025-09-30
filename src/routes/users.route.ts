import { Router } from "express";
import Route from "../interfaces/route.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import UsersController from "../controllers/users.controllers";
import { UsersDto } from "../dtos/users.dto";
import { InviteDTO } from '../dtos/admin_invites.dto';
import authMiddleware from '../middlewares/auth.middleware';


class UsersRoute implements Route {
  public path = "/users";
  public router = Router();
  public usersController = new UsersController();


  constructor() {
    this.initializeRoutes();
  }


  private initializeRoutes() {
    this.router.get(`${this.path}/client/active`, this.usersController.getAllActiveClient);
    this.router.get(`${this.path}/freelancers/active`, this.usersController.getAllActiveFreelance);    //active freelancers
    this.router.get(`${this.path}/geteditorcount/active`, this.usersController.geteditorcount);
    // Register
    this.router.post(`${this.path}/insert_user`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertUser);
    //backend login
    this.router.post(`${this.path}/login`, this.usersController.loginEmployee);
    this.router.post(`${this.path}/get_user_by_id`, this.usersController.getUserById);
    this.router.post(`${this.path}/update_user_by_id`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.updateUserById);
    this.router.post(`${this.path}/soft_delete_user`, this.usersController.softDeleteUser);
    this.router.post(`${this.path}/forgot-password`, this.usersController.forgotPassword);
    this.router.post(`${this.path}/reset-password`, this.usersController.resetPassword);

    // Get All types of user By id
    this.router.post(`${this.path}/get_freelancer_by_id`, this.usersController.getFreelancerById);

    this.router.post(`${this.path}/get_client_by_id`, this.usersController.getClientById);

    this.router.post(`${this.path}/get_admin_by_id`, this.usersController.getAdminById);

    // Register invited user
    this.router.post(`${this.path}/register`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertEmployee);
    // frontend login user
    this.router.post(`${this.path}/loginf`, this.usersController.Login);

    this.router.post(`${this.path}/getfreelaner`, (req, res, next) => this.usersController.getfreelancer(req, res, next));

    this.router.post(`${this.path}/change-password`, authMiddleware, this.usersController.changePassword);

    // Invite user (Admin only)
    this.router.post(`${this.path}/send-invitation`, this.usersController.sendInvitation);


  }
}

export default UsersRoute;