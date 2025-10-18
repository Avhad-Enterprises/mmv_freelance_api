import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import compression from "compression";
import Routes from "./interfaces/routes.interface";
import errorMiddleware from "./middlewares/error.middleware";
import { logger, stream } from "./utils/logger";
import authMiddleware from "./middlewares/auth.middleware";
import dotenv from 'dotenv';
import multerErrorHandler from './middlewares/multer-error.middleware';
import DB from '../database/index';
dotenv.config();


class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.env = process.env.NODE_ENV || "development";
    
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public async listen() {
    try {
      // Test database connection before starting server
      console.log('🔍 Testing database connection...');
      await DB.raw('SELECT 1 as test');
      console.log('✅ Database connection successful');

      this.app.listen(this.port, () => {
        logger.info(
          `🚀 App listening on the port ${this.port}. Current Env ${this.env}.`
        );
      }).on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          logger.error(`❌ Port ${this.port} is already in use. Please use a different port or kill the process using it.`);
          logger.error(`To kill processes on port ${this.port}, run: lsof -ti:${this.port} | xargs kill -9`);
          process.exit(1);
        } else {
          logger.error(`❌ Server startup error: ${error.message}`);
          throw error;
        }
      });
    } catch (error: any) {
      console.error('❌ Database connection failed:', error.message);
      logger.error(`❌ Database connection failed: ${error.message}`);
      process.exit(1);
    }
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    if (this.env === "production") {
      this.app.use(morgan("combined", { stream }));
    } else if (this.env === "development") {
      this.app.use(morgan("dev", { stream }));
    }

    // Set CORS to allow all origins and allow credentials
    // this.app.use(
    //   cors({
    //     origin: "*",
    //     credentials: true,
    //   })
    // );

    const allowedOrigins = [
  "https://makemyvid.io",
  "http://localhost:3000"
];

this.app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: "200mb" })); // Reduced from 2gb
    this.app.use(express.urlencoded({ limit: "200mb", extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    // Health check endpoint (no auth required)
    this.app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: this.env
      });
    });

    // API routes with /api/v1 prefix and auth middleware
    // Auth middleware will exclude public routes like /auth/login, /auth/register
    this.app.use("/api/v1", authMiddleware);
    routes.forEach((route) => {
      this.app.use("/api/v1", route.router);
    });

    // 404 handler for unmatched routes
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
      });
    });
  }

  private initializeErrorHandling() {
    // Handle multer-specific errors first
    this.app.use(multerErrorHandler);
    // General error handling
    this.app.use(errorMiddleware);
  }
}

export default App;
