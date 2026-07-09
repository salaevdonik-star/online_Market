import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controller/cart.controller";
import authorization from "../middleware/authorization";

const cartRouter = Router();

cartRouter.get("/cart", authorization, getCart);
cartRouter.post("/cart", authorization, addToCart);
cartRouter.patch("/cart/:id", authorization, updateCartItem);
cartRouter.delete("/cart/:id", authorization, removeCartItem);

export default cartRouter;
