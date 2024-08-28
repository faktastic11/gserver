import { logApiError } from "controllers/error";
import { NextFunction, Request, Response } from "express";

export enum reqTargetTypes {
  BODY = "body",
  QUERY = "query",
  PARAMS = "params",
}
export default async (
  req: Request,
  res: Response,
  next: NextFunction,
  targets: {
    schema;
    reqTarget: reqTargetTypes;
  }[],
) => {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true, // remove unknown props
  };

  for (const { schema, reqTarget } of targets) {
    const { error, value } = schema.validate(req[reqTarget], options);
    if (error) {
      return logApiError(
        req,
        res,
        next,
        Error("Validation Error"),
        400,
        error.details,
      );
    } else {
      req[reqTarget] = value;
    }
  }
  next();
};
