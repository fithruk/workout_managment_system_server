import { Router } from "express";

import { authMiddlaware } from "../Middlewares/authMiddleware";
import notificationController from "../Controllers/notificationController";

const router = Router();

router.post(
  "/createNotification",
  authMiddlaware,
  notificationController.CreateNewNotification
);

export default router;
