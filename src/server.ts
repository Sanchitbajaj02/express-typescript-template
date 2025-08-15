import "dotenv/config";
import "module-alias/register";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";

import Database from "@/config/db.config";
import RateLimit from "@/lib/rate-limit";
import logger from "@/logger";
import morganLogger from "@/middleware/morgan-middleware";

const app: Express = express();
const port = process.env.PORT || 5000;

const ALLOWED_ORIGINS: string[] = [];

// Middleware
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(morganLogger("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// rate limit implementation
app.use(new RateLimit(10, 5 * 60).rateLimiter());

// Cache-Control headers for all responses
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the application!!",
  });
});

app.listen(port, async () => {
  logger.log(`Server running on http://localhost:${port}`);

  // database connection
  const conn = new Database();
  await conn.connectToDatabase();
});
