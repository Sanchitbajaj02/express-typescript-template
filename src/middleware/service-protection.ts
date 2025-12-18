import xss from "xss";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import { SanitizeOptions, CorsOptions, XssOptions } from "@/types/protection.types";
import { Logger } from "winston";


export default class ServerProtection {
  private logger: Logger;
  private sanizeOptions: SanitizeOptions;
  private xssOptions?: XssOptions;
  private allowedOrigins: string[];

  constructor(
    logger: Logger,
    sanizeOptions: SanitizeOptions,
    allowedOrigins: string[] = [],
    xssOptions: XssOptions = {}
  ) {
    this.logger = logger;
    this.sanizeOptions = sanizeOptions;
    this.allowedOrigins = allowedOrigins;
    this.xssOptions = xssOptions;
  }

  /**
   * CORS protection middleware
   * @returns Express middleware function
   */
  public corsProtection = ({ allowedOrigins, credentials }: CorsOptions) => {
    this.allowedOrigins = allowedOrigins;
    return cors({
      origin: this.allowedOrigins,
      credentials: credentials,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    });
  };

  /**
   * Sanitize a string value
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  public sanitizeString = (str: string): string => {
    if (typeof str !== "string") {
      return str;
    }

    // First pass: HTML encode dangerous characters
    let sanitized = str;

    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    // Use XSS library for comprehensive sanitization
    sanitized = xss(sanitized, this.xssOptions);

    // Additional sanitization for common XSS patterns
    sanitized = sanitized
      // Remove javascript: protocols
      .replace(/javascript:/gi, "")
      // Remove data: URLs that might contain scripts
      .replace(/data:(?!image\/)/gi, "")
      // Remove vbscript: protocols
      .replace(/vbscript:/gi, "")
      // Remove on* event handlers
      .replace(/\bon\w+\s*=/gi, "")
      // Remove expression() CSS
      .replace(/expression\s*\(/gi, "")
      // Remove @import CSS
      .replace(/@import/gi, "")
      // Remove eval()
      .replace(/eval\s*\(/gi, "");

    return sanitized;
  };

  /**
   * Check if input contains potential XSS threats
   * @param {*} data - Data to check
   * @returns {boolean} True if threats detected
   */
  private detectXSSThreats = (data: any): boolean => {
    const threats = [
      /<script[^>]*>.*?<\/script>/gis,
      /<iframe[^>]*>.*?<\/iframe>/gis,
      /<object[^>]*>.*?<\/object>/gis,
      /<embed[^>]*>/gis,
      /javascript:/gi,
      /vbscript:/gi,
      /data:.*script/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi,
      /<img[^>]+src[^>]*=.*onerror/gis,
      /<svg[^>]*>.*?<\/svg>/gis,
    ];

    function checkString(str: string) {
      if (typeof str !== "string") return false;
      return threats.some((pattern) => pattern.test(str));
    }

    function checkData(item: any) {
      if (typeof item === "string") {
        return checkString(item);
      } else if (Array.isArray(item)) {
        return item.some(checkData);
      } else if (typeof item === "object" && item !== null) {
        return Object.values(item).some(checkData);
      }
      return false;
    }

    return checkData(data);
  };

  /**
   * Main XSS sanitization middleware
   * @param {any} options - Middleware configuration options
   * @returns Express middleware function
   */
  private xssSanitizer = (options: SanitizeOptions) => {
    const { skipRoutes, logThreats, blockOnThreat } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip certain routes if specified
        if (skipRoutes && skipRoutes.length > 0 && skipRoutes.some((route: string) => req.path.includes(route))) {
          return next();
        }

        // Detect threats before sanitization
        const hasThreats =
          this.detectXSSThreats(req.body) || this.detectXSSThreats(req.query) || this.detectXSSThreats(req.params);

        if (hasThreats && logThreats) {
          this.logger.warn("XSS threat detected in request:", {
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
          });
        }

        if (hasThreats && blockOnThreat) {
          return res.status(StatusCodes.NOT_ACCEPTABLE).json({
            messages: {
              error: "Malicious content detected",
              message: "Request contains potentially dangerous content",
            },
          });
        }

        next();
      } catch (error) {
        this.logger.error("XSS Sanitization Error:", { error });

        // In case of error, either continue (less secure) or block
        if (options.failSecurely !== false) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Input validation failed",
            message: "Unable to process request safely",
          });
        }

        next();
      }
    };
  };

  /**
   * Express middleware for specific XSS route protection
   * @param {any} options - Route-specific options
   * @returns Middleware function
   */
  public xssProtection = (options: any = {}) => {
    return this.xssSanitizer({ ...this.sanizeOptions, ...options });
  };

  /**
   * Middleware for miscellaneous security protections
   * @returns Express middleware function
   */
  public miscProtection = () => {
    return (req: Request, res: Response, next: NextFunction) => {
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
    };
  };
}
