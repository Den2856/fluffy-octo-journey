import type { RequestHandler } from "express";

export const asyncHandler = <
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
};
