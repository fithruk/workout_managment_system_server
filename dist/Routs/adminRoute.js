"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = __importDefault(require("../Controllers/adminController"));
const adminMiddleware_1 = require("../Middlewares/adminMiddleware");
const route = (0, express_1.Router)();
route.get("/getAllClients", adminMiddleware_1.adminMiddlaware, adminController_1.default.GetAllClients);
route.get("/getCurrentWorkoutPlan/:name/:date", adminMiddleware_1.adminMiddlaware, adminController_1.default.GetCurrentWorkoutPlan);
route.get("/getAllTimeClients", adminMiddleware_1.adminMiddlaware, adminController_1.default.GetAllTimeClients);
route.put("/updateAbonements", adminController_1.default.UpdateAbonements);
route.post("/getTodayClientsAbonements", adminMiddleware_1.adminMiddlaware, adminController_1.default.GetTodayClientsAbonements);
route.post("/getClientWorkouts", adminMiddleware_1.adminMiddlaware, adminController_1.default.GetClientWorkouts);
route.post("/createNewAbonement", adminMiddleware_1.adminMiddlaware, adminController_1.default.CreateNewAbonement);
route.post("/getTimeRangeWorkoutData", adminController_1.default.GetTimeRangeWorkoutData);
exports.default = route;
