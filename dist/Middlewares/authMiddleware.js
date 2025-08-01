"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlaware = void 0;
const tokenService_1 = __importDefault(require("../Services/tokenService"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const authMiddlaware = (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        const accessToken = authorizationHeader.split(" ")[1];
        console.log(req.headers["user-agent"]);
        console.log(accessToken + " accessToken");
        if (!accessToken) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        const userData = tokenService_1.default.ValidateToken(accessToken);
        console.log(userData);
        if (!userData) {
            return next(apiExeption_1.default.UnauthorizedError());
        }
        next();
    }
    catch (e) {
        return next(apiExeption_1.default.UnauthorizedError());
    }
};
exports.authMiddlaware = authMiddlaware;
