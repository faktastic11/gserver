import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface User {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
export interface AuthenticatedRequest<T = unknown> extends Request {
  user?: User;
}
