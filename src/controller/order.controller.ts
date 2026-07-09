import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

const COUPONS: Record<string, number> = {
  SALE10: 10,
  SALE20: 20,
};

// POST /coupons/apply
export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    const discountPct = COUPONS[String(code).toUpperCase()];

    if (!discountPct) {
      throw CustomErrorHandler.BadRequest("Invalid coupon code");
    }

    res.status(200).json({ code, discountPct });
  } catch (error) {
    next(error);
  }
};

// POST /orders  (Checkout page - "Place Order")
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      first_name,
      company_name,
      street_address,
      apartment,
      town_city,
      phone_number,
      email,
      save_info,
      payment_method,
      coupon_code,
    } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.user!.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw CustomErrorHandler.BadRequest("Cart is empty");
    }

    const subtotal = cartItems.reduce(
      (sum: number, item: (typeof cartItems)[number]) => sum + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    if (coupon_code) {
      const couponPercent = COUPONS[String(coupon_code).toUpperCase()];
      if (couponPercent) {
        discount = (subtotal * couponPercent) / 100;
      }
    }

    const shipping = subtotal > 140 ? 0 : 15;
    const total = subtotal - discount + shipping;

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.order.create({
        data: {
          user_id: req.user!.id,
          subtotal,
          shipping,
          total,
          payment_method: payment_method === "bank" ? "bank" : "cash_on_delivery",
          coupon_code: coupon_code ?? null,
          billing_details: {
            first_name,
            company_name,
            street_address,
            apartment,
            town_city,
            phone_number,
            email,
            save_info: !!save_info,
          },
          items: {
            create: cartItems.map((item: (typeof cartItems)[number]) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { user_id: req.user!.id } });

      return created;
    });

    res.status(201).json({ message: "Order placed", order });
  } catch (error) {
    next(error);
  }
};

// GET /orders (My Account - My Orders)
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { user_id: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { created_at: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOneOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Order not found");
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// PATCH /orders/:id/cancel (My Account - My Cancellations)
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Order not found");
    }

    if (order.status === "completed") {
      throw CustomErrorHandler.BadRequest("Completed orders cannot be cancelled");
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.status(200).json({ message: "Order cancelled", order: updated });
  } catch (error) {
    next(error);
  }
};

// PATCH /orders/:id/return (My Account - My Returns)
export const returnOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Order not found");
    }

    if (order.status !== "completed") {
      throw CustomErrorHandler.BadRequest("Only completed orders can be returned");
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "returned" },
    });

    res.status(200).json({ message: "Order marked as returned", order: updated });
  } catch (error) {
    next(error);
  }
};