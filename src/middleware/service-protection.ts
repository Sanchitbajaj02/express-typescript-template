import xss from "xss";
import { Request, Response, NextFunction, Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { ILoggerService } from "@/logger";

type SanitizeOptions = {
  blockOnThreat: boolean;
  logThreats: boolean;
  skipRoutes?: string[];
  failSecurely?: boolean;
};

type XssOptions = {
  whiteList?: any;
  stripIgnoreTag?: boolean;
  allowCommentTag?: boolean;
  css?: boolean;
  stripIgnoreTagBody?: string[];
};

// XSS configuration options
const xssOptions = {
  whiteList: {
    // Allow safe HTML tags if needed (customize based on your requirements)
    // For strict sanitization, keep this minimal or empty
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"],
  allowCommentTag: false,
  css: false, // Disable CSS to prevent CSS-based XSS
};

export default class ServerProtection {
  private logger: ILoggerService;
  private sanizeOptions: SanitizeOptions;
  private xssOptions?: XssOptions;

  constructor(logger: ILoggerService, sanizeOptions: SanitizeOptions, xssOptions: XssOptions = {}) {
    this.logger = logger;
    this.sanizeOptions = sanizeOptions;
    this.xssOptions = xssOptions;
  }

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
  private xssSanitizer = (options: any = {}) => {
    const { skipRoutes, logThreats, blockOnThreat } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Skip certain routes if specified
        if (skipRoutes.some((route: string) => req.path.includes(route))) {
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
        this.logger.error("XSS Sanitization Error:", error);

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
