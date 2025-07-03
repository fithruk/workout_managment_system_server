import { Router } from "express";
import adminController from "../Controllers/adminController";
import { adminMiddlaware } from "../Middlewares/adminMiddleware";
const route = Router();

route.get("/getAllClients", adminMiddlaware, adminController.GetAllClients);
route.get(
  "/getCurrentWorkoutPlan/:name/:date",
  adminMiddlaware,
  adminController.GetCurrentWorkoutPlan
);
route.post(
  "/getTodayClientsAbonements",
  adminMiddlaware,
  adminController.GetTodayClientsAbonements
);
route.post(
  "/getClientWorkouts",
  adminMiddlaware,
  adminController.GetClientWorkouts
);
route.post(
  "/createNewAbonement",
  adminMiddlaware,
  adminController.CreateNewAbonement
);

route.post("/getTimeRangeWorkoutData", adminController.GetTimeRangeWorkoutData);

export default route;
