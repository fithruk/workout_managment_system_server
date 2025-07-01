import { Request, Response, NextFunction } from "express";
import DataBaseService from "../Services/dataBaseService";
import { WorkoutsByPersoneTypes } from "../Types/types";

class DataBaseController {
  public FeedWorkoutsByPersone = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const clients: WorkoutsByPersoneTypes = req.body;
      await DataBaseService.FeedWorkoutsByPersone(clients);
      res.status(200).send();
    } catch (error) {
      next(error);
    }
  };

  public GetWorkoutesDatesByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.params;

      const workoutDates = await DataBaseService.GetWorkoutesDatesByName(name);
      res.status(200).json({ workoutDates: [...workoutDates] });
    } catch (error) {
      next(error);
    }
  };

  public GetApartAbonementByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name } = req.params;

      const abonement = await DataBaseService.GetApartAbonementByName(name);

      res.status(200).json({
        abonement: abonement ?? {
          abonementDuration: 0,
          dateOfCreation: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new DataBaseController();
