"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statisticsConrtoller_1 = __importDefault(require("../Controllers/statisticsConrtoller"));
const authMiddleware_1 = require("../Middlewares/authMiddleware");
const router = (0, express_1.Router)();
// router.post(
//   "/saveWorkoutPlan",
//   adminMiddlaware,
//   workoutController.SaveWorkoutPlan
// );
router.get("/getStatisticsByName/:clientName", authMiddleware_1.authMiddlaware, statisticsConrtoller_1.default.GetCommonSatisticsByName);
router.get("/GetWeightChangeDynamicsDataByName/:clientName/:exerciseName", authMiddleware_1.authMiddlaware, statisticsConrtoller_1.default.GetWeightChangeDynamicsDataByName);
exports.default = router;
