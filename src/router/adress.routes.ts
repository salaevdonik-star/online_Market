import { Router } from "express";
import {getAddresses, addAddress, updateAddress, deleteAddress,} from "../controller/adress.controller";
import validateMiddleware from "../middleware/validate.middleware";
import addressValidator, { addressUpdateValidator } from "../validator/adress.validator";
import authorization from "../middleware/authorization";

const addressRouter = Router();

addressRouter.get("/addresses", authorization, getAddresses);
addressRouter.post("/addresses", authorization, validateMiddleware(addressValidator), addAddress);
addressRouter.patch("/addresses/:id", authorization, validateMiddleware(addressUpdateValidator), updateAddress);
addressRouter.delete("/addresses/:id", authorization, deleteAddress);

export default addressRouter;
