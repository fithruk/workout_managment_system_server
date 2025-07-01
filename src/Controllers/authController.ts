import { Request, Response, NextFunction } from "express";
import { RegistrationDataTypes } from "../Types/types";
import userService from "../Services/userService";

class AuthController {
  public Registration = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { contactInfo, healthData } = req.body as RegistrationDataTypes;
      const user = await userService.CreateNewUser({ contactInfo, healthData });
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  public Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await userService.Login(email, password);

      res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60,
        httpOnly: true,
      });

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
