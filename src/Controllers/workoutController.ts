import { Request, Response, NextFunction } from "express";
import workoutService from "../Services/workoutService";
import { SetsAndValuesResults, WorkoutPlanType } from "../Types/types";
import ApiError from "../Exeptions/apiExeption";

class WorkoutController {
  public SaveWorkoutPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const plan: WorkoutPlanType = req.body;
      await workoutService.SaveWorkoutPlan(plan);
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  };

  public DeleteWorkoutPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        clientName,
        dateOfWorkout,
      }: { clientName: string; dateOfWorkout: string } = req.body;

      const { acknowledged, deletedCount } =
        await workoutService.DeleteWorkoutPlan(clientName, dateOfWorkout);

      if (!deletedCount) {
        throw ApiError.BadRequest("WP does not exist");
      }

      res.status(200).send();
    } catch (error) {
      next(error);
    }
  };

  public GetWorkoutPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        dateOfWorkout,
        clientName,
      }: { dateOfWorkout: Date; clientName: string } = req.body;

      const workoutPlan = await workoutService.GetWorkoutPlan(
        dateOfWorkout,
        clientName
      );
      res.status(200).json({ workoutPlan });
    } catch (error) {
      next(error);
    }
  };

  public SaveWorkoutResult = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        name,
        date,
        workoutResult,
      }: { name: string; date: Date; workoutResult: SetsAndValuesResults } =
        req.body;

      const workoutResponce = await workoutService.SaveWorkoutResults(
        workoutResult,
        name,
        new Date(date)
      );
      res.status(200).json({ workoutResponce });
    } catch (error) {
      next(error);
    }
  };

  public GetWorkoutResult = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, date } = req.params;
      const workoutResponce = await workoutService.GetWorkoutResults(
        name,
        new Date(date)
      );
      res.status(200).json({ workoutResponce });
    } catch (error) {
      next(error);
    }
  };
}

export default new WorkoutController();
