import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomErrorHandler from "../error/error";
import { TokenPayload } from "../validator/token.generator";

export default function authorization(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw CustomErrorHandler.BadRequest("Token not found");
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY as string) as TokenPayload;

    req.user = decode;

    next();
  } catch (error) {
    next(error);
  }
}
