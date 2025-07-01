import { Router } from "express";
import dataBaseController from "../Controllers/dataBaseController";

const router: Router = Router();

router.get(
  "/getWKDatesByName/:name",
  dataBaseController.GetWorkoutesDatesByName
);
router.get("/getAbonByName/:name", dataBaseController.GetApartAbonementByName);
router.post("/feed", dataBaseController.FeedWorkoutsByPersone);

export default router;
