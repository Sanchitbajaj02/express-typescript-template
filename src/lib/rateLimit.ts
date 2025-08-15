import { rateLimit } from "express-rate-limit";
import { NextFunction } from "express";

export default class RateLimit {
  private limit: number;
  private windowSize: number;

  /**
   * The rate limit configuration constructor that accepts 2 paramater: `limit` and `windowSize`
   *
   * @param {number} limit accepts the limit parameter over which the api stops working
   * @param {number} windowSize accepts the cooldown period in seconds. E.g. windowSize = 1 means `1000ms`
   */
  constructor(limit: number, windowSize: number) {
    this.limit = limit;
    this.windowSize = windowSize * 1000;
  }

  public rateLimiter() {
    if (process.env.NODE_ENV === "development") {
      return (req: any, res: any, next: NextFunction) => next();
    }
    return rateLimit({
      windowMs: this.windowSize,
      limit: this.limit,
      max: this.limit,
      message: {
        message: `Too many requests from this IP, please try again after ${this.windowSize / 1000} seconds`,
      },
    });
  }
}
