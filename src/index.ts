import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";  
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db.config";
import errorMiddleware from "./middleware/error.middleware";
import logger from "./utils/logger";

import authRouter from "./router/auth.routes";
import categoryRouter from "./router/category.routes";
import productRouter from "./router/product.routes";
import cartRouter from "./router/cart.routes";
import wishlistRouter from "./router/wishlist.routes";
import addressRouter from "./router/adress.routes";
import orderRouter from "./router/order.routes";
import contactRouter from "./router/contact.routes";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
  })
);

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads", "images")));

app.use(authRouter);
app.use(categoryRouter);
app.use(productRouter); 
app.use(cartRouter);
app.use(wishlistRouter);
app.use(addressRouter);
app.use(orderRouter);
app.use(contactRouter);

app.use(errorMiddleware);

process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection: " + (reason && reason.message ? reason.message : reason));
});

process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception: " + err.message, { stack: err.stack });
});

app.listen(PORT, () => {
  logger.info("Server is running at: " + PORT);
  console.log("Server is running at: " + PORT);
});
