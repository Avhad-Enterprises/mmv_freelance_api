// services/firebase.service.ts
import DB, { T } from "../../../database/index.schema";
import { verifyIdToken } from "../../utils/firebase/firebase-admin.util";
import HttpException from "../../exceptions/HttpException";

export default class FirebaseService {
    public async loginOrRegisterUser(userData: any) {
        const {
            uid,
            email,
            token,
            first_name,
            last_name,
            email_verified,
            signin_method,
        } = userData;
        const decodedToken = await verifyIdToken(token);

        console.log("Decoded Token:", decodedToken);
        console.log("Received email:", email);

        if (
            decodedToken.uid !== uid &&
            (decodedToken.email != email ||
                decodedToken.providerData[0].email != email)
        ) {
            throw new HttpException(
                401,
                "Invalid Firebase token: UID or email mismatch."
            );
        }

        const existingUser = await DB(T.USERS_TABLE).where({ email }).first();

        if (!existingUser) {
            await DB(T.USERS_TABLE).insert({
                first_name,
                last_name,
                email,
                email_verified,
                signin_method,
            });

            return {
                isNew: true,
                message: "User created and logged in successfully.",
            };
        } else {
            return { isNew: false, message: "Login successful." };
        }
    }

    public async firebaseUpdate(
        email: string,
        phone: string
    ): Promise<boolean> {
        const updatedRows = await DB(T.USERS_TABLE)
            .where({ email })
            .update({ phone_number: phone, phone_verified: true });
        return updatedRows > 0;
    }
}
