import { Router } from "express";
import {getAllProducts, getFlashSaleProducts, getBestSellingProducts, getNewArrivalProducts, getProductsByCategory,
search, getOneProduct, getRelatedProducts, addProduct, updateProduct, deleteProduct, addReview,} from "../controller/product.controller";
import validateMiddleware from "../middleware/validate.middleware";
import productValidator from "../validator/product.validator";
import reviewValidator from "../validator/review.validator";
import authorization from "../middleware/authorization";
import adminChecker from "../middleware/admin.checker";
import { productImages } from "../config/multer";

const productRouter = Router();

// Home page sections
productRouter.get("/products/explore", getAllProducts);
productRouter.get("/products/flash-sale", getFlashSaleProducts);
productRouter.get("/products/best-selling", getBestSellingProducts);
productRouter.get("/products/new-arrival", getNewArrivalProducts);

productRouter.get("/products/search", search);
productRouter.get("/products/category/:category_id", getProductsByCategory);

// Product detail page
productRouter.get("/products/:slug", getOneProduct);
productRouter.get("/products/:slug/related", getRelatedProducts);
productRouter.post("/products/:id/reviews", authorization, validateMiddleware(reviewValidator), addReview);

// Admin CRUD
productRouter.post(
  "/products",
  productImages,
  authorization,
  adminChecker,
  validateMiddleware(productValidator),
  addProduct
);
productRouter.put("/products/:id", productImages, authorization, adminChecker, updateProduct);
productRouter.delete("/products/:id", authorization, adminChecker, deleteProduct);

export default productRouter;
