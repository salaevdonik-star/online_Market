import { Router } from "express";
import {
  register,
  verify,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  changePassword,
} from "../controller/auth.controller";
import validateMiddleware from "../middleware/validate.middleware";
import { registerValidator, loginValidator } from "../validator/auth.validator";
import refreshToken from "../middleware/refresh-token";
import authorization from "../middleware/authorization";

const authRouter = Router();

authRouter.post("/register", validateMiddleware(registerValidator), register);
authRouter.post("/verify", verify);
authRouter.post("/login", validateMiddleware(loginValidator), login);
authRouter.get("/refresh", refreshToken);
authRouter.get("/logout", logout);
authRouter.post("/forgot_password", forgotPassword);
authRouter.post("/change_password", authorization, changePassword);
authRouter.get("/profile", authorization, getProfile);
authRouter.patch("/profile", authorization, updateProfile);

export default authRouter;
