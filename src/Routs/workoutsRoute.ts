import { Router } from "express";
import workoutController from "../Controllers/workoutController";
import { adminMiddlaware } from "../Middlewares/adminMiddleware";
import { authMiddlaware } from "../Middlewares/authMiddleware";

const router = Router();

router.post(
  "/saveWorkoutPlan",
  adminMiddlaware,
  workoutController.SaveWorkoutPlan
);
router.post(
  "/getWorkoutPlan",
  authMiddlaware,
  workoutController.GetWorkoutPlan
);

router.post(
  "/saveWorkoutResults",
  authMiddlaware,
  workoutController.SaveWorkoutResult
);

router.get(
  "/getWorkoutResults/:name/:date",
  authMiddlaware,
  workoutController.GetWorkoutResult
);

export default router;
