import { Request, Response, NextFunction } from "express";
import adminService from "../Services/adminService";
import ApiError from "../Exeptions/apiExeption";

class AdminController {
  public GetAllClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const clients = await adminService.GetAllClients();
      res.status(200).json({ users: clients });
    } catch (error) {
      next(error);
    }
  };

  public GetClientWorkouts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name }: { name: string } = req.body;
      const clientsWorkouts = await adminService.GetClientWorkouts(name);

      res.status(200).json({ clientsWorkouts });
    } catch (error) {
      next(error);
    }
  };

  public CreateNewAbonement = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        name,
        abonementDuration,
        dateOfStart,
      }: { name: string; abonementDuration: number; dateOfStart: Date } =
        req.body;

      const abonement = await adminService.CreateNewAbonement(
        name,
        abonementDuration,
        dateOfStart
      );
      if (abonement) res.status(200).json({ abonement });
      throw ApiError.BadRequest(
        "Somethink went wrong while creating new abonement"
      );
    } catch (error) {
      next(error);
    }
  };

  public GetTimeRangeWorkoutData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        dateOfRangeStart,
        dateOfRangeeEnd,
        clientName,
      }: { dateOfRangeStart: Date; dateOfRangeeEnd: Date; clientName: string } =
        req.body;

      const workoutsAndPlans = await adminService.GetTimeRangeWorkoutData(
        dateOfRangeStart,
        dateOfRangeeEnd,
        clientName
      );

      res.status(200).json(workoutsAndPlans);
    } catch (error) {
      next(error);
    }
  };

  public GetCurrentWorkoutPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, date } = req.params;

      const currentWorkoutPlan = await adminService.GetCurrentWorkoutPlan(
        name,
        new Date(date)
      );

      res.status(200).json(currentWorkoutPlan?.workoutPlan ?? []);
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
