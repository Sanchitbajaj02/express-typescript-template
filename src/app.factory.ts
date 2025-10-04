import express, { Express } from "express";
import { Dependencies } from "@/container/di.container";
import RateLimit from "@/lib/rate-limit";
import MorganLogger from "@/middleware/morgan-middleware";
import ErrorHandler from "@/middleware/error-handler";
import ServerProtection from "@/middleware/service-protection";

export default class AppFactory {
  constructor(private deps: Dependencies) {}

  public createApp(): Express {
    const { logger, config } = this.deps;

    const app: Express = express();

    // Service protection initialization
    const serviceProtection = new ServerProtection(
      logger,
      {
        blockOnThreat: config.security.blockOnThreat,
        logThreats: config.security.logThreats,
      },
      config.security.allowedOrigins,
      config.security.xssOptions
    );

    // CORS middleware
    app.use(
      serviceProtection.corsProtection({
        allowedOrigins: config.security.allowedOrigins,
        credentials: config.security.credentials,
      })
    );

    // Morgan logging middleware
    app.use(new MorganLogger(logger, "dev").createMorganMiddleware());

    // Body parsing middleware
    app.use(express.json({ limit: "1mb" }));
    app.use(express.urlencoded({ extended: true }));

    // Rate limiting middleware
    app.use(new RateLimit(logger, config.rateLimit.limit, config.rateLimit.windowSeconds).rateLimiter());

    // XSS Protection middleware
    app.use(serviceProtection.xssProtection());

    // Cache-Control headers for all responses
    app.use(serviceProtection.miscProtection());

    // Routes
    app.get("/", (req, res) => {
      res.json({
        message: "Welcome to the application!!",
      });
    });

    // Error handling middleware (must be last)
    app.use(new ErrorHandler(logger).handle);

    return app;
  }
}
