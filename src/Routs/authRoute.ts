import { Router } from "express";
import authController from "../Controllers/authController";
const router: Router = Router();

router.post("/registration", authController.Registration);
router.post("/login", authController.Login);

export default router;
