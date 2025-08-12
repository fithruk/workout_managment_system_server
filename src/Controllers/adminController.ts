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
      if (!abonement) {
        throw ApiError.BadRequest(
          "Something went wrong while creating new abonement"
        );
      }
      res.status(200).json({ abonement });
    } catch (error) {
      next(error);
    }
  };

  public GetTodayClientsAbonements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { todaysDate }: { todaysDate: string } = req.body;

      if (isNaN(new Date(todaysDate).getTime())) {
        console.log("shlyapa");
      }

      const abonements = await adminService.GetTodayClientsAbonements(
        new Date(todaysDate)
      );

      res.status(200).json(abonements);
    } catch (error) {
      next(error);
    }
  };

  UpdateAbonements = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { names }: { names: string[] } = req.body;
      const filteredAbonements = await adminService.UpdateAbonements(names);

      res.status(200).json(filteredAbonements);
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

  public GetAllTimeClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const allTimeClients = await adminService.GetAllTimeClients();

      res.status(200).json(allTimeClients ?? []);
    } catch (error) {
      next(error);
    }
  };

  public GetAllWorkoutPlansForToday = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const allWorkoutPlansForToday =
        await adminService.GetAllWorkoutPlansForToday();

      res.status(200).json(allWorkoutPlansForToday ?? []);
    } catch (error) {
      next(error);
    }
  };

  public GetClientsWhoAreTrainingNow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const clients = await adminService.GetClientsWhoAreTrainingNow();

      res.status(200).json(clients ?? []);
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
