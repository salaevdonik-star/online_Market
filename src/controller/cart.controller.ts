import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.user!.id },
      include: { product: { include: { images: true } } },
    });

    const subtotal = cartItems.reduce(
      (sum: number, item: (typeof cartItems)[number]) => sum + item.product.price * item.quantity,
      0
    );

    res.status(200).json({
      items: cartItems,
      subtotal,
      shipping: subtotal > 140 ? 0 : 15,
      total: subtotal + (subtotal > 140 ? 0 : 15),
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product_id, quantity, color, size } = req.body;

    const product = await prisma.product.findUnique({ where: { id: product_id } });

    if (!product) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        user_id_product_id_color_size: {
          user_id: req.user!.id,
          product_id,
          color: color ?? "",
          size: size ?? "",
        },
      },
      update: { quantity: { increment: Number(quantity ?? 1) } },
      create: {
        user_id: req.user!.id,
        product_id,
        quantity: Number(quantity ?? 1),
        color: color ?? "",
        size: size ?? "",
      },
    });

    res.status(201).json({ message: "Added to cart", cartItem });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");
    const { quantity } = req.body;

    const foundedItem = await prisma.cartItem.findUnique({ where: { id } });

    if (!foundedItem || foundedItem.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Cart item not found");
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity: Number(quantity) },
    });

    res.status(200).json({ message: "Cart updated", cartItem });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedItem = await prisma.cartItem.findUnique({ where: { id } });

    if (!foundedItem || foundedItem.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Cart item not found");
    }

    await prisma.cartItem.delete({ where: { id } });

    res.status(200).json({ message: "Removed from cart" });
  } catch (error) {
    next(error);
  }
};
