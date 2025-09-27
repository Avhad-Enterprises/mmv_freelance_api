// controllers/firebase.controller.ts
import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import FirebaseService from "../services/firebase-login.service";

const firebaseService = new FirebaseService();

export default class FirebaseController {
    public FirebaseLogin = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const userData = req.body;

        if (!userData.email || !userData.token || !userData.uid) {
            return res.status(400).json({
                success: false,
                message: "Missing required Firebase login credentials.",
            });
        }

        try {
            const result = await firebaseService.loginOrRegisterUser(userData);

            return res.status(result.isNew ? 201 : 200).json({
                success: true,
                message: result.message,
                isNew: result.isNew,
            });
        } catch (err) {
            console.error("Firebase Login Error:", err);
            next(err);
        }
    };

    public FirebaseUpdate = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: "Email and phone number are required.",
            });
        }

        try {
            const updated = await firebaseService.firebaseUpdate(email, phone);

            if (!updated) {
                throw new HttpException(404, "User not found");
            }

            return res.status(200).json({
                success: true,
                message: "Phone number updated successfully.",
            });
        } catch (error) {
            console.error("Firebase Update Error:", error);
            next(error);
        }
    };
}
