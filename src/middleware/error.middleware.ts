import { Request, Response, NextFunction } from "express";
import CustomErrorHandler from "../error/error";
import logger from "../utils/logger";

export default function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  try {
    const meta = {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    };

    if (err instanceof CustomErrorHandler) {
      if (err.status >= 500) {
        logger.error(err.message, meta);
      } else {
        logger.warn(err.message, meta);
      }

      return res.status(err.status).json({
        message: err.message,
        errors: err.errors,
      });
    }

    // Prisma known errors (unique constraint, not found, etc.)
    if (err.code === "P2002") {
      logger.warn("Unique constraint violation: " + JSON.stringify(err.meta), meta);
      return res.status(400).json({
        message: `${err.meta?.target?.join(", ")} already exists`,
      });
    }

    if (err.code === "P2025") {
      logger.warn("Record not found: " + err.message, meta);
      return res.status(404).json({
        message: "Record not found",
      });
    }

    logger.error(err.message, { ...meta, stack: err.stack });

    return res.status(500).json({
      message: err.message,
    });
  } catch (error: any) {
    logger.error("Error middleware ichida xato: " + error.message);
    return res.status(500).json({
      message: error.message,
    });
  }
}
