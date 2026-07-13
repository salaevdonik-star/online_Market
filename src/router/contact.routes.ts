import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { sendPlainEmail } from "../utils/email-sender";
import CustomErrorHandler from "../error/error";

const contactRouter = Router();

contactRouter.post("/contact", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone) {
      throw CustomErrorHandler.BadRequest("Name, email va phone shart");
    }

    await sendPlainEmail(
      process.env.GOOGLE_EMAIL as string,
      `Yangi xabar: ${name}`,
      `Ism: ${name}\nEmail: ${email}\nTelefon: ${phone}\n\nXabar:\n${message ?? ""}`
    );

    res.status(200).json({ message: "Message sent" });
  } catch (error) {
    next(error);
  }
});

export default contactRouter;
