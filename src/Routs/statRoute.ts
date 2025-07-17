import { Router } from "express";
import statisticsConrtoller from "../Controllers/statisticsConrtoller";
import { adminMiddlaware } from "../Middlewares/adminMiddleware";
import { authMiddlaware } from "../Middlewares/authMiddleware";

const router = Router();

// router.post(
//   "/saveWorkoutPlan",
//   adminMiddlaware,
//   workoutController.SaveWorkoutPlan
// );

router.get(
  "/getStatisticsByName/:clientName",
  authMiddlaware,
  statisticsConrtoller.GetCommonSatisticsByName
);

export default router;
