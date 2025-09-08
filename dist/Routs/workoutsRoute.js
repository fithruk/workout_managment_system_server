"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workoutController_1 = __importDefault(require("../Controllers/workoutController"));
const adminMiddleware_1 = require("../Middlewares/adminMiddleware");
const authMiddleware_1 = require("../Middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post("/saveWorkoutPlan", adminMiddleware_1.adminMiddlaware, workoutController_1.default.SaveWorkoutPlan);
router.post("/getWorkoutPlan", authMiddleware_1.authMiddlaware, workoutController_1.default.GetWorkoutPlan);
router.post("/saveWorkoutResults", authMiddleware_1.authMiddlaware, workoutController_1.default.SaveWorkoutResult);
router.delete("/deleteWorkoutPlan", adminMiddleware_1.adminMiddlaware, workoutController_1.default.DeleteWorkoutPlan);
router.get("/getWorkoutResults/:name/:date", authMiddleware_1.authMiddlaware, workoutController_1.default.GetWorkoutResult);
exports.default = router;
