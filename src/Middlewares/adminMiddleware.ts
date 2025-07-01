import { Request, Response, NextFunction } from "express";
import tokenService from "../Services/tokenService";
import ApiError from "../Exeptions/apiExeption";

const adminMiddlaware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.ValidateToken(accessToken);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    if ((userData as any).email !== "sergeytrenerbelov@gmail.com") {
      return next(ApiError.BadRequest("Недостатньо прав"));
    }

    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};

export { adminMiddlaware };
