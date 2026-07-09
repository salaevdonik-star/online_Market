import jwt from "jsonwebtoken";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const access_token = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn: "15m" });
};

export const refresh_token = (payload: TokenPayload) => {
  return jwt.sign(payload, process.env.REFRESH_SECRET_KEY as string, { expiresIn: "7d" });
};
