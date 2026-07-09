import { Request, Response, NextFunction } from "express";

type ValidatorFn = (data: any) => { error?: any };

export default function validateMiddleware(validator: ValidatorFn) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = validator(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details ? error.details[0].message : error.message,
      });
    }
    next();
  };
}
