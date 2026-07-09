import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.config";
import CustomErrorHandler from "../error/error";
import sendEmail from "../utils/email-sender";
import { access_token, refresh_token } from "../validator/token.generator";

function generateOtp() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 9)).join("");
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { email } });

    if (foundedUser) {
      throw CustomErrorHandler.UnAuthorized("User already exists");
    }

    const randomCode = generateOtp();
    const dateNow = Date.now() + 120000;
    const hashPassword = await bcrypt.hash(password, 12);

    await sendEmail(email, randomCode);

    await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        phone,
        password: hashPassword,
        otp: randomCode,
        otp_time: BigInt(dateNow),
      },
    });

    res.status(201).json({
      message: "Registered",
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, code } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { email } });

    if (!foundedUser) {
      throw CustomErrorHandler.UnAuthorized("User not found");
    }

    if (!foundedUser.otp_time || Number(foundedUser.otp_time) < Date.now()) {
      throw CustomErrorHandler.UnAuthorized("code expired");
    }

    if (foundedUser.otp !== code) {
      throw CustomErrorHandler.UnAuthorized("wrong code");
    }

    const payload = {
      id: foundedUser.id,
      email: foundedUser.email,
      role: foundedUser.role,
    };

    const access = access_token(payload);
    const refresh = refresh_token(payload);

    res.cookie("accessToken", access, {
      httpOnly: true,
      maxAge: 60 * 1000 * 15,
    });
    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 7,
    });

    await prisma.user.update({
      where: { id: foundedUser.id },
      data: { otp: null, otp_time: null },
    });

    res.status(200).json({
      message: "Success",
      token: access,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { email } });

    if (!foundedUser) {
      throw CustomErrorHandler.UnAuthorized("User not found");
    }

    const decode = await bcrypt.compare(password, foundedUser.password);

    if (!decode) {
      throw CustomErrorHandler.UnAuthorized("Wrong password");
    }

    const randomCode = generateOtp();
    const dateNow = Date.now() + 120000;

    await sendEmail(email, randomCode);

    await prisma.user.update({
      where: { id: foundedUser.id },
      data: { otp: randomCode, otp_time: BigInt(dateNow) },
    });

    res.status(200).json({
      message: "Please check your email",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "ok",
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const foundedUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        created_at: true,
      },
    });

    if (!foundedUser) {
      throw CustomErrorHandler.NotFound("User not found");
    }

    const profileData: any = { ...foundedUser };

    if (foundedUser.role === "admin" || foundedUser.role === "superadmin") {
      profileData.my_categories = await prisma.category.findMany({
        where: { created_by: foundedUser.id },
      });
      profileData.my_products = await prisma.product.findMany({
        where: { created_by: foundedUser.id },
        include: { category: true, images: true },
      });
    }

    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { first_name, last_name, address, current_password, new_password } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { id: req.user!.id } });

    if (!foundedUser) {
      throw CustomErrorHandler.NotFound("User not found");
    }

    const updateData: any = { first_name, last_name, address };

    if (current_password && new_password) {
      const match = await bcrypt.compare(current_password, foundedUser.password);
      if (!match) {
        throw CustomErrorHandler.UnAuthorized("Current password is wrong");
      }
      updateData.password = await bcrypt.hash(new_password, 12);
    }

    await prisma.user.update({
      where: { id: foundedUser.id },
      data: updateData,
    });

    res.status(200).json({ message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { email } });

    if (!foundedUser) {
      throw CustomErrorHandler.UnAuthorized("User not found");
    }

    const randomCode = generateOtp();
    const dateNow = Date.now() + 120000;

    await sendEmail(email, randomCode);

    await prisma.user.update({
      where: { id: foundedUser.id },
      data: { otp: randomCode, otp_time: BigInt(dateNow) },
    });

    res.status(200).json({
      message: "Please check your email",
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { new_password } = req.body;

    const foundedUser = await prisma.user.findUnique({ where: { email: req.user!.email } });

    if (!foundedUser) {
      throw CustomErrorHandler.NotFound("User not found");
    }

    const hashPassword = await bcrypt.hash(new_password, 12);

    await prisma.user.update({
      where: { id: foundedUser.id },
      data: { password: hashPassword },
    });

    res.status(200).json({
      message: "Success",
    });
  } catch (error) {
    next(error);
  }
};
