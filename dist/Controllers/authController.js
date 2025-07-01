"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../Services/userService"));
class AuthController {
    constructor() {
        this.Registration = async (req, res, next) => {
            try {
                const { contactInfo, healthData } = req.body;
                const user = await userService_1.default.CreateNewUser({ contactInfo, healthData });
                res.status(200).json({ user });
            }
            catch (error) {
                next(error);
            }
        };
        this.Login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                const { token, user } = await userService_1.default.Login(email, password);
                res.cookie("token", token, {
                    maxAge: 15 * 24 * 60 * 60,
                    httpOnly: true,
                });
                res.status(200).json({ user });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new AuthController();
