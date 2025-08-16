import { Request, Response, NextFunction } from "express";

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export interface IAsyncHandler {
  handle: (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => void;
}

export class AsyncHandler implements IAsyncHandler {
  constructor() {}

  public handle = (fn: AsyncFunction) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}

const asyncHandler = new AsyncHandler().handle

export default asyncHandler