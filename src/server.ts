import "dotenv/config";
import "module-alias/register";
import express, { Express } from "express";
import cors from "cors";

import Database from "@/config/db.config";
import RateLimit from "@/lib/rate-limit";
import logger from "@/logger";
import morganLogger from "@/middleware/morgan-middleware";
import ErrorHandler from "@/middleware/error-handler";
import ServerProtection from "@/middleware/service-protection";

const app: Express = express();
const port = process.env.PORT || 5000;

const ALLOWED_ORIGINS: string[] = [];

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(morganLogger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// rate limit implementation
app.use(new RateLimit(logger, 10, 5 * 60).rateLimiter());

// service protection initialization
const serviceProtection = new ServerProtection(logger, {
  blockOnThreat: true,
  logThreats: true,
});

// XSS Protection middleware
app.use(serviceProtection.xssProtection);

// Cache-Control headers for all responses
app.use(serviceProtection.miscProtection);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application!!",
  });
});

// common error handler logic
app.use(new ErrorHandler(logger).handle);

app.listen(port, async () => {
  logger.info(`Server running on http://localhost:${port}`);

  // database connection
  const conn = new Database();
  await conn.connectToDatabase();
});
