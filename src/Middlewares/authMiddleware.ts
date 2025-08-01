import { Request, Response, NextFunction } from "express";
import tokenService from "../Services/tokenService";
import ApiError from "../Exeptions/apiExeption";

const authMiddlaware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(" ")[1];
    console.log(req.headers["user-agent"]);
    console.log(accessToken + " accessToken");

    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = tokenService.ValidateToken(accessToken);
    console.log(userData);

    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
};

export { authMiddlaware };
