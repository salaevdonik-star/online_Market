import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveAllToCart,
} from "../controller/wishlist.controller";
import authorization from "../middleware/authorization";

const wishlistRouter = Router();

wishlistRouter.get("/wishlist", authorization, getWishlist);
wishlistRouter.post("/wishlist/:product_id", authorization, addToWishlist);
wishlistRouter.delete("/wishlist/:product_id", authorization, removeFromWishlist);
wishlistRouter.post("/wishlist/move-all-to-cart", authorization, moveAllToCart);

export default wishlistRouter;
