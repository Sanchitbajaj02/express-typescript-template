import { ErrorRequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import CustomError from "@/lib/custom-error";
import { Logger } from "winston";

export interface IErrorHandler {
  handle: ErrorRequestHandler;
}

export default class ErrorHandler implements IErrorHandler {
  private logger: Logger;
  constructor(logger: Logger) {
    this.logger = logger;
  }

  private handleCustomError = (res: Response, error: CustomError) => {
    res.status(error.statusCode).json({
      message: error.message,
    });
  };

  private handleNativeError = (res: Response, error: Error) => {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message,
    });
  };

  public handle: ErrorRequestHandler = (error, req, res, _next) => {
    if (error instanceof CustomError) {
      this.logger.error(`(${error.statusCode}): ${error.message}`);
      this.handleCustomError(res, error);
      return;
    }

    if (error instanceof Error) {
      this.logger.error(error.stack);
      this.handleNativeError(res, error);
      return;
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Internal server error");
  };
}
