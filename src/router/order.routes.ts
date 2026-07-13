import { Router } from "express";
import { applyCoupon, createOrder, getMyOrders, getOneOrder, cancelOrder, returnOrder } from "../controller/order.controller";
import validateMiddleware from "../middleware/validate.middleware";
import orderValidator from "../validator/order.validator";
import authorization from "../middleware/authorization";

const orderRouter = Router();

orderRouter.post("/coupons/apply", applyCoupon);
orderRouter.post("/orders", authorization, validateMiddleware(orderValidator), createOrder);
orderRouter.get("/orders", authorization, getMyOrders);
orderRouter.get("/orders/:id", authorization, getOneOrder);
orderRouter.patch("/orders/:id/cancel", authorization, cancelOrder);
orderRouter.patch("/orders/:id/return", authorization, returnOrder);

export default orderRouter;
