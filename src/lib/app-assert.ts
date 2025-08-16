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
   * Asserts a condition and throws an CustomError if the condition is falsy
   *
   * @param {any} condition - always accept the success condition on which if system doesn't follows should throw an error
   * @param {StatusCodes} httpStatusCode - accepts http status codes in both number and StatusCodes format
   * @param {string} message - a message that should show up to the user if the condition fails
   * @returns asserts condition
   */
  assert(condition: any, httpStatusCode: StatusCodes, message: string) {
    return this.assertFn(condition, this.errorCreator(httpStatusCode, message));
  }
}

const appAssert = new AppAssertionService().assert.bind(new AppAssertionService());

export default appAssert;
