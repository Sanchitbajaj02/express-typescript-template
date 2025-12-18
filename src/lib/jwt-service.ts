import { sign, verify, TokenExpiredError, JsonWebTokenError, SignOptions } from "jsonwebtoken";
import CustomError from "@/lib/custom-error";
import { StatusCodes } from "http-status-codes";
/**
 * @abstract creates jwt token while login
 * @param {any} payload
 * @param {number | string} expiryLimit - Expiry time in seconds (number) or string format like "24h", "1d"
 * @returns { string | null}
 */
export const createTokenJWT = (payload: any, expiryLimit: number | string = "24h"): string | null => {
  if (Object.keys(payload).length < 1) {
    return null;
  }

  const signOptions: SignOptions = {
    algorithm: "HS256",
    expiresIn: expiryLimit as any,
  };

  const signedToken = sign(payload, String(process.env.JWT_SECRET), signOptions);

  return signedToken;
};

/**
 * @abstract verifies jwt token from request headers
 * @param {string} token 
 * @returns 
 */
export const verifyTokenJWT = (token: string) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new CustomError(StatusCodes.INTERNAL_SERVER_ERROR, "JWT_SECRET is not configured");
    }
    return verify(token, String(process.env.JWT_SECRET));
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new CustomError(StatusCodes.FORBIDDEN, "Token expired, please login again");
    } else if (error instanceof JsonWebTokenError) {
      // Log the actual error for debugging
      console.error("JWT Verification Error:", error.message);
      throw new CustomError(StatusCodes.FORBIDDEN, `Invalid Token provided! ${error.message}`);
    } else if (error instanceof CustomError) {
      throw error;
    } else {
      console.error("Token verification failed:", error);
      throw new CustomError(StatusCodes.FORBIDDEN, "Token verification failed");
    }
  }
};
