"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exerciseController_1 = __importDefault(require("../Controllers/exerciseController"));
const authMiddleware_1 = require("../Middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get("/allExercises", authMiddleware_1.authMiddlaware, exerciseController_1.default.GetAllExercises);
router.post("/loadExercisesByPlan", authMiddleware_1.authMiddlaware, exerciseController_1.default.GetExercisesByPlan);
exports.default = router;
