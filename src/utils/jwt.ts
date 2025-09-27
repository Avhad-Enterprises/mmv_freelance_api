import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

export const generateToken = (payload: object, expiresIn = "1d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
