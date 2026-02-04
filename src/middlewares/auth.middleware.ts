import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../exceptions/HttpException";
import {
  DataStoredInToken,
  RequestWithUser,
} from "../interfaces/auth.interface";
import DB, { T } from "../../database/index";
import { IsEmpty } from "class-validator";

const authMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Allow OPTIONS requests for CORS preflight
    if (req.method === "OPTIONS") {
      return next();
    }

    // Public routes that don't require authentication
    const publicRoutes = [
      "/users/password-reset-request",
      "/users/password-reset",
      "/auth/login",
      "/auth/register",
      "/auth/register/client",
      "/auth/register/videographer",
      "/auth/register/videoeditor",
      "/admin/invites/accept",
      "/admin/invites/verify",
      "/admin/invites/register",
      "/health",
      "/projects-tasks/listings",
      "/freelancers/getfreelancers-public", // GET /freelancers/getfreelancers-public (public-safe)
      "/categories", // GET /categories (read-only)
      "/categories/by-type", // GET /categories/by-type (read-only)
      "/skills",
      "/blog", // GET /blog and GET /blog/:id (public read-only)
      "/faq", // GET /faq and GET /faq/:id (public read-only)
      "/contact/submit", // POST /contact/submit (public contact form)
      "/careers", // GET /careers and GET /careers/:id (public read-only)
      // CMS Landing Page routes (public)
      "/cms-landing/public", // GET /cms-landing/public/* (all public CMS endpoints)
      // OAuth routes (public)
      "/oauth/providers",
      "/oauth/google",
      "/oauth/google/callback",
      "/oauth/facebook",
      "/oauth/facebook/callback",
      "/oauth/apple",
      "/oauth/apple/callback",
    ];

    // Check if the current path matches any public route
    // GET requests to public routes don't require auth
    // Only specific POST routes don't require auth (registration, login, password reset, contact submit)
    // Exclude admin-only endpoints like /faq/all that need auth
    const adminOnlyRoutes = ["/faq/all"];
    const isAdminOnlyRoute = adminOnlyRoutes.some((route) =>
      req.path.startsWith(route),
    );

    const isPublicGetRoute =
      publicRoutes.some((route) => req.path.startsWith(route)) &&
      req.method === "GET" &&
      !isAdminOnlyRoute;

    // Specific POST routes that are allowed without authentication
    const publicPostRoutes = [
      "/auth/login",
      "/auth/register",
      "/auth/register/client",
      "/auth/register/videographer",
      "/auth/register/videoeditor",
      "/admin/invites/accept",
      "/admin/invites/verify",
      "/admin/invites/register",
      "/users/password-reset-request",
      "/users/password-reset",
      "/contact/submit",
      "/subscribed/insert",
    ];
    const isPublicPostRoute =
      publicPostRoutes.some((route) => req.path.includes(route)) &&
      req.method === "POST";

    if (isPublicGetRoute || isPublicPostRoute) {
      await DB.raw("SET search_path TO public");
      return next();
    }

    const bearerHeader = req.headers["authorization"];
    if (bearerHeader) {
      const bearer = bearerHeader.split(" ");

      const bearerToken = bearer[1];
      if (bearerToken != "null") {
        const secret = process.env.JWT_SECRET;

        try {
          const verificationResponse = (await jwt.verify(
            bearerToken,
            secret,
          )) as any;

          if (verificationResponse) {
            const userId = verificationResponse.id;
            const findUser = await DB(T.USERS_TABLE)
              .where({ user_id: userId })
              .first();

            if (findUser) {
              req.user = findUser;

              // Fetch user roles from database
              const userRoles = await DB("user_roles")
                .join("role", "user_roles.role_id", "role.role_id")
                .where("user_roles.user_id", userId)
                .select("role.name");

              // Attach roles to user object
              req.user.roles = userRoles.map((r) => r.name);

              // Attach permissions from token (Zero-Latency)
              req.user.permissions = verificationResponse.permissions || [];

              await DB.raw("SET search_path TO public");
              next();
            } else {
              next(new HttpException(401, "Invalid authentication token"));
            }
          } else {
            next(new HttpException(401, "UnAuthorized User"));
          }
        } catch (error: any) {
          // Handle specific JWT errors
          if (error.name === "TokenExpiredError") {
            next(
              new HttpException(
                401,
                "Authentication token has expired. Please login again.",
              ),
            );
          } else if (error.name === "JsonWebTokenError") {
            next(new HttpException(401, "Invalid authentication token"));
          } else if (error.name === "NotBeforeError") {
            next(new HttpException(401, "Authentication token not active"));
          } else {
            next(
              new HttpException(
                401,
                "Authentication token verification failed",
              ),
            );
          }
        }
      } else {
        next(new HttpException(401, "Authentication token missing"));
      }
    } else {
      next(new HttpException(401, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Authentication failed"));
  }
};

export default authMiddleware;
