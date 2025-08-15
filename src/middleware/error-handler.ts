import { ErrorRequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomError from "@/lib/custom-error";
import logger from "@/logger";

export interface IErrorHandler {
  handleCustomError: (res: Response, error: CustomError) => void;
  handle: ErrorRequestHandler;
}

export default class ErrorHandler implements IErrorHandler {
  constructor() {}

  handleCustomError(res: Response, error: CustomError): void {
    res.status(error.statusCode).json({
      message: error.message,
    });
  }

  public handle: ErrorRequestHandler = (error, req, res, _next) => {
    if (error instanceof CustomError) {
      logger.error(`Status: ${error.statusCode} | Message: ${error.message}`);
      this.handleCustomError(res, error as CustomError);
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
  };
}
