import { StatusCodes } from "http-status-codes";

export default class CustomError extends Error {
  constructor(
    public statusCode: StatusCodes,
    public message: string,
    public errors: any = [],
    public stack: string = ""
  ) {
    super(message);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
