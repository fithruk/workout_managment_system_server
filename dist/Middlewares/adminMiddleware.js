"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddlaware = void 0;
const tokenService_1 = __importDefault(require("../Services/tokenService"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const adminMiddlaware = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        const accessToken = authorizationHeader.split(" ")[1];
        if (!accessToken) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        const userData = tokenService_1.default.ValidateToken(accessToken);
        if (!userData) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        if (userData.email !== "sergeytrenerbelov@gmail.com") {
            return next(apiExeption_1.default.BadRequest("Недостатньо прав"));
        }
        next();
    }
    catch (e) {
        return next(apiExeption_1.default.UnauthorizedError());
    }
};
exports.adminMiddlaware = adminMiddlaware;
