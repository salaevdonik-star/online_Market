import { Request, Response, NextFunction } from "express";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import { getParam } from "../utils/get-param";

function slugify(name: string) {
  return (
    name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") +
    "-" +
    Date.now().toString().slice(-5)
  );
}

const productInclude = {
  category: true,
  images: true,
  reviews: true,
} as const;

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 8);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        include: productInclude,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count(),
    ]);

    res.status(200).json({
      data: products,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getFlashSaleProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { is_flash_sale: true },
      include: productInclude,
      take: 10,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getBestSellingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: productInclude,
      orderBy: {
        orderItems: { _count: "desc" },
      },
      take: 8,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getNewArrivalProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { is_new: true },
      include: productInclude,
      orderBy: { created_at: "desc" },
      take: 4,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category_id = getParam(req.params.category_id, "category_id");

    const products = await prisma.product.findMany({
      where: { category_id },
      include: productInclude,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchingvalue } = req.query;

    const products = await prisma.product.findMany({
      where: {
        name: { contains: String(searchingvalue ?? ""), mode: "insensitive" },
      },
      include: productInclude,
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

export const getOneProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = getParam(req.params.slug, "slug");

    const foundedProduct = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { id: true, first_name: true, last_name: true } },
          },
        },
      },
    });

    if (!foundedProduct) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    res.status(200).json(foundedProduct);
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = getParam(req.params.slug, "slug");

    const foundedProduct = await prisma.product.findUnique({ where: { slug } });

    if (!foundedProduct) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    const related = await prisma.product.findMany({
      where: {
        category_id: foundedProduct.category_id,
        id: { not: foundedProduct.id },
      },
      include: productInclude,
      take: 4,
    });

    res.status(200).json(related);
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      description,
      price,
      old_price,
      discount_pct,
      stock,
      category_id,
      colors,
      sizes,
      is_new,
      is_flash_sale,
      flash_sale_end,
    } = req.body;

    const files = (req.files as { [field: string]: Express.Multer.File[] }) || {};

    if (!files.images || files.images.length === 0) {
      throw CustomErrorHandler.BadRequest("Kamida bitta rasm shart!");
    }

    const colorsArr = Array.isArray(colors) ? colors : colors ? [colors] : [];
    const sizesArr = Array.isArray(sizes) ? sizes : sizes ? [sizes] : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug: slugify(name),
        description,
        price: Number(price),
        old_price: old_price ? Number(old_price) : null,
        discount_pct: discount_pct ? Number(discount_pct) : null,
        stock: Number(stock),
        category_id,
        colors: colorsArr,
        sizes: sizesArr,
        is_new: is_new === "true" || is_new === true,
        is_flash_sale: is_flash_sale === "true" || is_flash_sale === true,
        flash_sale_end: flash_sale_end ? new Date(flash_sale_end) : null,
        created_by: req.user!.id,
        images: {
          create: files.images.map((file, index) => ({
            url: `${process.env.BASE_URL}/uploads/${file.filename}`,
            is_main: index === 0,
          })),
        },
      },
      include: productInclude,
    });

    res.status(201).json({
      message: "Added new product",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");
    const {
      name,
      description,
      price,
      old_price,
      discount_pct,
      stock,
      category_id,
      colors,
      sizes,
      is_new,
      is_flash_sale,
      flash_sale_end,
    } = req.body;

    const foundedProduct = await prisma.product.findUnique({ where: { id } });

    if (!foundedProduct) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    const colorsArr = Array.isArray(colors) ? colors : colors ? [colors] : undefined;
    const sizesArr = Array.isArray(sizes) ? sizes : sizes ? [sizes] : undefined;

    const updateData: any = {
      name,
      description,
      price: price ? Number(price) : undefined,
      old_price: old_price ? Number(old_price) : undefined,
      discount_pct: discount_pct ? Number(discount_pct) : undefined,
      stock: stock ? Number(stock) : undefined,
      category_id,
      colors: colorsArr,
      sizes: sizesArr,
      is_new: is_new !== undefined ? is_new === "true" || is_new === true : undefined,
      is_flash_sale:
        is_flash_sale !== undefined ? is_flash_sale === "true" || is_flash_sale === true : undefined,
      flash_sale_end: flash_sale_end ? new Date(flash_sale_end) : undefined,
    };

    const files = (req.files as { [field: string]: Express.Multer.File[] }) || {};

    if (files.images && files.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { product_id: id } });
      updateData.images = {
        create: files.images.map((file, index) => ({
          url: `${process.env.BASE_URL}/uploads/${file.filename}`,
          is_main: index === 0,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: productInclude,
    });

    res.status(200).json({ message: "Updated product", product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");

    const foundedProduct = await prisma.product.findUnique({ where: { id } });

    if (!foundedProduct) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({ message: "Deleted product" });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = getParam(req.params.id, "id");
    const { rating, comment } = req.body;

    const foundedProduct = await prisma.product.findUnique({ where: { id } });

    if (!foundedProduct) {
      throw CustomErrorHandler.NotFound("Product not found");
    }

    const review = await prisma.review.upsert({
      where: {
        user_id_product_id: {
          user_id: req.user!.id,
          product_id: id,
        },
      },
      update: { rating: Number(rating), comment },
      create: {
        rating: Number(rating),
        comment,
        user_id: req.user!.id,
        product_id: id,
      },
    });

    res.status(201).json({ message: "Review saved", review });
  } catch (error) {
    next(error);
  }
};
