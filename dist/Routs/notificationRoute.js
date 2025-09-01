"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../Middlewares/authMiddleware");
const notificationController_1 = __importDefault(require("../Controllers/notificationController"));
const router = (0, express_1.Router)();
router.post("/createNotification", authMiddleware_1.authMiddlaware, notificationController_1.default.CreateNewNotification);
exports.default = router;
