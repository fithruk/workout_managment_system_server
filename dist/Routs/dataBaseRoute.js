"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataBaseController_1 = __importDefault(require("../Controllers/dataBaseController"));
const router = (0, express_1.Router)();
router.get("/getWKDatesByName/:name", dataBaseController_1.default.GetWorkoutesDatesByName);
router.get("/getAbonByName/:name", dataBaseController_1.default.GetApartAbonementByName);
router.post("/feed", dataBaseController_1.default.FeedWorkoutsByPersone);
exports.default = router;
