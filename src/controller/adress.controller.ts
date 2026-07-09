import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { user_id: req.user!.id },
    });

    res.status(200).json(addresses);
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, company, street, apartment, city, phone, email, is_default } =
      req.body;

    const address = await prisma.address.create({
      data: {
        user_id: req.user!.id,
        first_name,
        last_name,
        company,
        street,
        apartment,
        city,
        phone,
        email,
        is_default: is_default === "true" || is_default === true,
      },
    });

    res.status(201).json({ message: "Address added", address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedAddress = await prisma.address.findUnique({ where: { id } });

    if (!foundedAddress || foundedAddress.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Address not found");
    }

    const address = await prisma.address.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json({ message: "Address updated", address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedAddress = await prisma.address.findUnique({ where: { id } });

    if (!foundedAddress || foundedAddress.user_id !== req.user!.id) {
      throw CustomErrorHandler.NotFound("Address not found");
    }

    await prisma.address.delete({ where: { id } });

    res.status(200).json({ message: "Address deleted" });
  } catch (error) {
    next(error);
  }
};
