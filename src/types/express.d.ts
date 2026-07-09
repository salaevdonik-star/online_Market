import { TokenPayload } from "../validator/token.generator";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
