import { Request, Response, NextFunction } from "express";
import exerciseService from "../Services/exerciseService";

class ExerciseController {
  public GetAllExercises = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const exerciseArray = await exerciseService.GetAllExercises();
      res.status(200).json({ exercises: exerciseArray });
    } catch (error) {
      next(error);
    }
  };

  public GetExercisesByPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { exercises }: { exercises: string[] } = req.body;
      const exercisesByPlan = await exerciseService.GetExercisesByPlan(
        exercises
      );

      res.status(200).json(exercisesByPlan);
    } catch (error) {
      next(error);
    }
  };
}

export default new ExerciseController();
