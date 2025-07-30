"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const authRoute_1 = __importDefault(require("./Routs/authRoute"));
const dataBaseRoute_1 = __importDefault(require("./Routs/dataBaseRoute"));
const adminRoute_1 = __importDefault(require("./Routs/adminRoute"));
const exerciseRoute_1 = __importDefault(require("./Routs/exerciseRoute"));
const workoutsRoute_1 = __importDefault(require("./Routs/workoutsRoute"));
const statRoute_1 = __importDefault(require("./Routs/statRoute"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const errorMiddleware_1 = __importDefault(require("./Middlewares/errorMiddleware"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    credentials: true,
    origin: process.env.CLIENT_URL,
}));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use("/auth", authRoute_1.default);
app.use("/dataBase", dataBaseRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.use("/exercises", exerciseRoute_1.default);
app.use("/workouts", workoutsRoute_1.default);
app.use("/statistics", statRoute_1.default);
app.use(errorMiddleware_1.default);
const start = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_DB_URL);
        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    }
    catch (error) {
        if (error instanceof Error)
            console.log(error.message);
    }
};
start();
