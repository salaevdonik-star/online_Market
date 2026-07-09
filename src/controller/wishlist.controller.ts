import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

export const getWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlist = await prisma.wishlistItem.findMany({
      where: { user_id: req.user!.id },
      include: { product: { include: { images: true } } },
    });

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_id = getParam(req.params.product_id, "product_id");

    const product = await prisma.product.findUnique({ where: { id: product_id } });

    if (!product) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        user_id_product_id: { user_id: req.user!.id, product_id },
      },
      update: {},
      create: { user_id: req.user!.id, product_id },
    });

    res.status(201).json({ message: "Added to wishlist", item });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_id = getParam(req.params.product_id, "product_id");

    await prisma.wishlistItem.deleteMany({
      where: { user_id: req.user!.id, product_id },
    });

    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
};

// Wishlist page - "Move All To Bag"
export const moveAllToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { user_id: req.user!.id },
    });

    for (const item of wishlistItems) {
      await prisma.cartItem.upsert({
        where: {
          user_id_product_id_color_size: {
            user_id: req.user!.id,
            product_id: item.product_id,
            color: null as any,
            size: null as any,
          },
        },
        update: { quantity: { increment: 1 } },
        create: { user_id: req.user!.id, product_id: item.product_id, quantity: 1 },
      });
    }

    await prisma.wishlistItem.deleteMany({ where: { user_id: req.user!.id } });

    res.status(200).json({ message: "Moved all items to cart" });
  } catch (error) {
    next(error);
  }
};
