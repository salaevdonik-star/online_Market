import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import CustomErrorHandler from "../error/error";
import { access_token, refresh_token, TokenPayload } from "../validator/token.generator";

export default function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw CustomErrorHandler.BadRequest("Token not found");
    }

    const decode = jwt.verify(token, process.env.REFRESH_SECRET_KEY as string) as TokenPayload;

    const payload: TokenPayload = {
      id: decode.id,
      email: decode.email,
      role: decode.role,
    };

    const access = access_token(payload);
    const refresh = refresh_token(payload);

    res.cookie("accessToken", access, {
      httpOnly: true,
      maxAge: 60 * 1000 * 15,
    });
    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
}
