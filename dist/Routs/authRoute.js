"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../Controllers/authController"));
const router = (0, express_1.Router)();
router.post("/registration", authController_1.default.Registration);
router.post("/login", authController_1.default.Login);
exports.default = router;
