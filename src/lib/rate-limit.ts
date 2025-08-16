import { rateLimit } from "express-rate-limit";
import { NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import type { ILoggerService } from "@/logger";

export default class RateLimit {
  private limit: number;
  private windowSize: number;
  private skipArray: string[];
  private logger: ILoggerService;

  /**
   * The rate limit configuration constructor that accepts 2 paramater: `limit` and `windowSize`
   *
   * @param {number} limit accepts the limit parameter over which the api stops working
   * @param {number} windowSize accepts the cooldown period in seconds. E.g. windowSize = 1 means `1000ms`
   * @param {string[]} [skipArray=[]] accepts the routes which needs to be skipped
   */
  constructor(logger: ILoggerService, limit: number, windowSize: number, skipArray: string[] = []) {
    this.limit = limit;
    this.windowSize = windowSize * 1000;
    this.skipArray = skipArray;
    this.logger = logger;
  }

  public rateLimiter() {
    if (process.env.NODE_ENV === "development") {
      return (req: any, res: any, next: NextFunction) => next();
    }
    return rateLimit({
      windowMs: this.windowSize,
      limit: this.limit,
      max: this.limit,
      standardHeaders: "draft-7",
      validate: true,
      handler: (req, res) => {
        this.logger.warn(`Too many requests from this IP, please try again after ${this.windowSize / 1000} seconds`)
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
          message: `Too many requests from this IP, please try again after ${this.windowSize / 1000} seconds`,
        });
      },
      skip: (req, res) => {
        return this.skipArray.some((route) => req.path.startsWith(route));
      },
    });
  }
}
