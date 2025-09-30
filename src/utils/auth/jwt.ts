import jwt from "jsonwebtoken";

export const generateToken = (payload: any, expiresIn = "1d") => {
  // @ts-ignore - jsonwebtoken types issue
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn }
  );
};
