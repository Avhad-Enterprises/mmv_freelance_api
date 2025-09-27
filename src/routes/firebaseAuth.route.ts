import { Router } from "express";
import Route from "../interfaces/route.interface";
import FirebaseController from "../controllers/firebase_login.controller";

export default class FirebaseAuth implements Route {
    public path = "/auth";
    public router = Router();
    private controller = new FirebaseController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}/login`,
            this.controller.FirebaseLogin.bind(this.controller)
        );

        this.router.put(
            `${this.path}/users/update`,
            this.controller.FirebaseUpdate.bind(this.controller)
        );
    }
}
