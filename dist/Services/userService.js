"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userDTO_1 = __importDefault(require("../DTOs/userDTO"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const userModel_1 = __importDefault(require("../Models/userModel"));
const tokenService_1 = __importDefault(require("./tokenService"));
class UserService {
    constructor() {
        this.CreateNewUser = async (data) => {
            try {
                const { contactInfo, healthData } = data;
                const candidate = await userModel_1.default.findOne({ email: contactInfo.email });
                if (candidate)
                    return apiExeption_1.default.ConflictError();
                const newUser = await userModel_1.default.create({ ...contactInfo, ...healthData });
                const userDTo = new userDTO_1.default(newUser.email, newUser.name, newUser.role);
                return { userDTo };
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        };
        this.Login = async (email, password) => {
            const candidate = await userModel_1.default.findOne({ email });
            if (!candidate || candidate.password !== password)
                throw apiExeption_1.default.BadRequest("User does not exist");
            if (candidate && candidate.password !== password)
                throw apiExeption_1.default.BadRequest("Password is incorrect");
            const userDTO = new userDTO_1.default(candidate.name, candidate.email, candidate.role, candidate._id.toString());
            const newToken = tokenService_1.default.GenerateToken({ ...userDTO });
            await tokenService_1.default.SaveToken(candidate._id.toString(), newToken);
            return { token: newToken, user: { ...userDTO, token: newToken } };
        };
        this.GetAllClients = async () => {
            const clients = await userModel_1.default.find();
            return clients.map((client) => new userDTO_1.default(client.name, client.email, client.role, client._id.toString()));
        };
    }
}
exports.default = new UserService();
