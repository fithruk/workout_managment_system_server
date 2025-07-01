import ApiError from "../Exeptions/apiExeption";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorMiddlaware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    console.log(err);
    res.status(err.status).json({ message: err.message, errors: err.errors });
    return;
  }
  console.log(err);

  res.status(500).json({ message: "Unexpected error" });
};

export default errorMiddlaware;

export { errorMiddlaware };
