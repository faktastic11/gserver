import { Request } from "express";

export interface AuthenticatedRequest<T = unknown> extends Request {
  user?: T;
}
