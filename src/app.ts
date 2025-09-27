import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import fs from "fs";
import Routes from "./interfaces/routes.interface";
import errorMiddleware from "./middlewares/error.middleware";
import { logger, stream } from "./utils/logger";
import authMiddleware from "./middlewares/auth.middleware";
import nunjucks from "nunjucks";
import dotenv from 'dotenv';
dotenv.config();


class App {
  
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.env = process.env.NODE_ENV || "development";
    this.app.use(cookieParser()); // make sure this comes BEFORE your theme middleware
    /** Move theme middleware before anything else */
    this.setDynamicThemeSupport();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();

    this.app.get("/", (req, res) => {
      const customization = {
        pageTitle: "Welcome to My Store",
        settings: {
          showNewsletterSignup: true,
          heroText: "Shop our Spring Collection!",
        },
      };
      res.render("index.njk", customization);
    });
  }

  
  public listen() {
    this.app.listen(this.port, () => {
      logger.info(
        `🚀 App listening on the port ${this.port}. Current Env ${this.env}.`
      );
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    // if (this.env === 'production') {
    //   this.app.use(morgan('combined', { stream }));
    //   //{ origin: 'your.domain.com', credentials: true }
    //   this.app.use(cors());
    // } else if (this.env === 'development') {
    //   this.app.use(morgan('dev', { stream }));
    //   this.app.use(cors({ origin: true, credentials: true }));
    // }

    if (this.env === "production") {
      this.app.use(morgan("combined", { stream }));
    } else if (this.env === "development") {
      this.app.use(morgan("dev", { stream }));
    }

    // Set CORS to allow all origins and allow credentials
    this.app.use(
      cors({
        origin: "*",
        credentials: true,
      })
    );

    // this.app.use(fileUpload());
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: "2gb" }));
    this.app.use(express.urlencoded({ limit: "2gb", extended: true }));
    this.app.use(cookieParser());
  }

  private setDynamicThemeSupport() {
    const themeMap = {
      localhost: "elegant",
    };

    const getThemeFromRequest = (req: express.Request): string => {
      const themeFromQuery = req.query.theme?.toString();
      const themeFromCookie = req.cookies?.theme;
      const theme = "default";

      console.log(
        "[Theme Resolution] Hostname:",
        req.hostname,
        "| Theme Query:",
        req.query.theme,
        "| Cookie Theme:",
        themeFromCookie,
        "| Resolved:",
        theme
      );

      return theme;
    };

    this.app.use((req, res, next) => {
      const theme = getThemeFromRequest(req);

      // Set cookie if not already set
      if (!req.cookies.theme && theme) {
        res.cookie("theme", theme, { maxAge: 900000, httpOnly: false });
      }

      const themePath = path.resolve(__dirname, "themes", theme, "templates");

      nunjucks.configure(themePath, {
        autoescape: true,
        express: this.app,
        noCache: true,
      });

      res.locals.theme = theme;
      next();
    });

    this.app.get("/shop", (req, res) => {
      res.render("shop.njk", { theme: res.locals.theme });
    });

    this.app.get("/assets/*", (req, res, next) => {
      const theme = res.locals.theme;
      const assetPath = req.params[0]; // gets the actual path after /assets/

      const resolvedFile = path.join(
        __dirname,
        `themes/${theme}/assets`,
        assetPath
      );
      console.log("[Assets] Theme:", theme, "| File:", resolvedFile);

      fs.access(resolvedFile, fs.constants.F_OK, (err) => {
        if (err) {
          return res.status(404).send("Asset not found");
        }
        res.sendFile(resolvedFile);
      });
    });
  }

  private initializeRoutes(routes: Routes[]) {
    this.app.use("/api/v1/", authMiddleware);
    routes.forEach((route) => {
      this.app.use("/api/v1/", route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: "REST API",
          version: "1.0.0",
          description: "Example docs",
        },
      },
      apis: [""],
    };

    // const specs = swaggerJSDoc(options);
    // this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
