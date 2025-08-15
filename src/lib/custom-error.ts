import { StatusCodes } from "http-status-codes";

export default class CustomError extends Error {
  constructor(
    public statusCode: StatusCodes,
    public message: string,
  ) {
    super(message);
  }
}
