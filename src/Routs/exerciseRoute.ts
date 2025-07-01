import { Router } from "express";
import exerciseController from "../Controllers/exerciseController";
import { authMiddlaware } from "../Middlewares/authMiddleware";

const router = Router();

router.get("/allExercises", authMiddlaware, exerciseController.GetAllExercises);
router.post(
  "/loadExercisesByPlan",
  authMiddlaware,
  exerciseController.GetExercisesByPlan
);

export default router;
