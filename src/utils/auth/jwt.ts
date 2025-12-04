import jwt from "jsonwebtoken";

/**
 * @deprecated This utility function is unused. Use AuthService.generateToken() instead.
 * Kept for potential future use or migration purposes.
 */
export const generateToken = (payload: any, expiresIn = "1d") => {
  // @ts-ignore - jsonwebtoken types issue
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn }
  );
};
