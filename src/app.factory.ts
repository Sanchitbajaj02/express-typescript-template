import express, { Express } from "express";
import { Dependencies } from "@/container/di.container";
import RateLimit from "@/lib/rate-limit";
import MorganLogger from "@/middleware/morgan-middleware";
import ErrorHandler from "@/middleware/error-handler";
import ServerProtection from "@/middleware/service-protection";

export function createApp(deps: Dependencies): Express {
  const { logger, config } = deps;

  const app: Express = express();

  // Service protection initialization
  const serviceProtection = new ServerProtection(
    logger,
    {
      blockOnThreat: config.security.blockOnThreat,
      logThreats: config.security.logThreats,
    }
  );

  // CORS middleware
  app.use(serviceProtection.corsProtection({
    allowedOrigins: config.security.allowedOrigins,
    credentials: false
  }));

  // Morgan logging middleware
  app.use(new MorganLogger(logger, "dev").getMiddleware());

  // Body parsing middleware
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting middleware
  app.use(
    new RateLimit(
      logger,
      config.rateLimit.limit,
      config.rateLimit.windowSeconds
    ).rateLimiter()
  );

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