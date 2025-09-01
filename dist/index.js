"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoute_1 = __importDefault(require("./Routs/authRoute"));
const dataBaseRoute_1 = __importDefault(require("./Routs/dataBaseRoute"));
const adminRoute_1 = __importDefault(require("./Routs/adminRoute"));
const exerciseRoute_1 = __importDefault(require("./Routs/exerciseRoute"));
const workoutsRoute_1 = __importDefault(require("./Routs/workoutsRoute"));
const statRoute_1 = __importDefault(require("./Routs/statRoute"));
const errorMiddleware_1 = __importDefault(require("./Middlewares/errorMiddleware"));
const types_1 = require("./Types/types");
const socketService_1 = __importDefault(require("./Services/socketService"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express_1.default.json({ limit: "100mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "100mb" }));
app.use("/auth", authRoute_1.default);
app.use("/dataBase", dataBaseRoute_1.default);
app.use("/admin", adminRoute_1.default);
app.use("/exercises", exerciseRoute_1.default);
app.use("/workouts", workoutsRoute_1.default);
app.use("/statistics", statRoute_1.default);
app.use(errorMiddleware_1.default);
// Socket events
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error("No token"));
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     (socket as any).user = decoded;
//     next();
//   } catch {
//     return next(new Error("Invalid token"));
//   }
// });
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    const socketService = new socketService_1.default(io, socket);
    try {
        socketService.HandShacke();
    }
    catch (error) {
        console.error("Handshake error:", error);
    }
    socket.on("disconnect", () => {
        try {
            console.log("Socket disconnected:", socket.id);
            socketService.notifyAdmins();
        }
        catch (error) {
            console.error("Disconnect error:", error);
        }
    });
    socket.on(types_1.SocketEventsEnum.newClientConnected, () => {
        try {
            socketService.NewClientConnected();
        }
        catch (error) {
            console.error("New client error:", error);
        }
    });
    socket.on(types_1.SocketEventsEnum.updateWorkout, async (data) => {
        try {
            const parsedData = JSON.parse(data);
            const updatedWorkout = await socketService.UpdateWorkout(parsedData);
            if (updatedWorkout) {
                socketService.SendUpdatedWorkoutToAdmin({
                    name: updatedWorkout.clientName,
                    date: updatedWorkout.dateOfWorkout.toString(),
                    workoutResult: Object.fromEntries(updatedWorkout.workoutResult),
                });
            }
        }
        catch (error) {
            console.error("Update workout error:", error);
        }
    });
    socket.on(types_1.SocketEventsEnum.newNotification, async (data) => {
        try {
            await socketService.newNotification(data);
        }
        catch (error) {
            console.error("New notification error:", error);
        }
    });
    socket.on(types_1.SocketEventsEnum.markNotificationAsReaded, async (data) => {
        try {
            const updNotifs = await socketService.MarkNotificationAsReaded(data);
            socket.emit(types_1.SocketEventsEnum.loadNotification, JSON.stringify(updNotifs));
        }
        catch (error) {
            console.error("Mark notification error:", error);
        }
    });
});
const start = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_DB_URL);
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        if (error instanceof Error)
            console.log(error.message);
    }
};
start();
