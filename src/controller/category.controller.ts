import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { created_at: "asc" },
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchingvalue } = req.query;

    const categories = await prisma.category.findMany({
      where: {
        name: { contains: String(searchingvalue ?? ""), mode: "insensitive" },
      },
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const icon = req.file
      ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
      : null;

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        created_by: req.user!.id,
      },
    });

    res.status(201).json({
      message: "Added new category",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedCategory = await prisma.category.findUnique({ where: { id } });

    if (!foundedCategory) {
      throw CustomErrorHandler.NotFound("Category not found");
    }

    res.status(200).json(foundedCategory);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");
    const { name } = req.body;

    const foundedCategory = await prisma.category.findUnique({ where: { id } });

    if (!foundedCategory) {
      throw CustomErrorHandler.NotFound("Category not found");
    }

    const updateData: any = { name };

    if (req.file) {
      updateData.icon = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    await prisma.category.update({ where: { id }, data: updateData });

    res.status(200).json({ message: "Updated category" });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedCategory = await prisma.category.findUnique({ where: { id } });

    if (!foundedCategory) {
      throw CustomErrorHandler.NotFound("Category not found");
    }

    await prisma.category.delete({ where: { id } });

    res.status(200).json({ message: "Deleted category" });
  } catch (error) {
    next(error);
  }
};
