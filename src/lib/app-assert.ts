import assert from "node:assert";
import { StatusCodes } from "http-status-codes";
import CustomError from "@/lib/custom-error";

export interface AssertionService {
  assert: (condition: any, httpStatusCode: StatusCodes, message: string) => asserts condition;
}

export class AppAssertionService implements AssertionService {
  private readonly assertFn;
  private readonly errorCreator;

  constructor(
    assertFn: typeof assert = assert,
    errorCreator: (status: StatusCodes, message: string) => CustomError = (status, message) =>
      new CustomError(status, message)
  ) {
    this.assertFn = assertFn;
    this.errorCreator = errorCreator;
  }

  /**
   * Asserts a condition and throws an AppError if the condition is falsy
   *
   * @param {any} condition
   * @param {StatusCodes} httpStatusCode
   * @param {string} message
   * @returns asserts condition
   */
  assert(condition: any, httpStatusCode: StatusCodes, message: string) {
    return this.assertFn(condition, this.errorCreator(httpStatusCode, message));
  }
}

const appAssert = new AppAssertionService().assert.bind(new AppAssertionService())

export default appAssert