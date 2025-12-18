import assert from "node:assert";
import { StatusCodes } from "http-status-codes";
import CustomError from "@/lib/custom-error";

/**
 * Asserts a condition and throws an CustomError if the condition is falsy
 *
 * @param {any} condition - always accept the success condition on which if system doesn't follows should throw an error
 * @param {StatusCodes} httpStatusCode - accepts http status codes in both number and StatusCodes format
 * @param {string} message - a message that should show up to the user if the condition fails
 * @returns asserts condition
 */
function appAssert(condition: any, httpStatusCode: StatusCodes, message: string): asserts condition {
  assert(condition, new CustomError(httpStatusCode, message));
}

export default appAssert;
