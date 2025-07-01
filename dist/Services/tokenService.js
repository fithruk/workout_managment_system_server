"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tokenModel_1 = __importDefault(require("../Models/tokenModel"));
class TokenService {
    constructor() {
        this.GenerateToken = (payload) => {
            const token = jsonwebtoken_1.default.sign({ email: payload.email, name: payload.name, _id: payload._id }, process.env.TOKEN_SECRET, { expiresIn: "15d" });
            return token;
        };
        this.ValidateToken = (token) => {
            try {
                const userData = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
                return userData;
            }
            catch (e) {
                return null;
            }
        };
        this.SaveToken = async (userId, token) => {
            const currentToken = await tokenModel_1.default.findOne({ user: userId });
            if (currentToken) {
                currentToken.token = token;
                return await currentToken.save();
            }
            const newToken = await tokenModel_1.default.create({ user: userId, token });
            return newToken;
        };
        this.DecodeToken = (token) => {
            return jsonwebtoken_1.default.decode(token);
        };
    }
    async RemoveToken(token) {
        const tokenData = await tokenModel_1.default.deleteOne({ token });
        return tokenData;
    }
}
exports.default = new TokenService();
