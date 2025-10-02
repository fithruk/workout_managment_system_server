"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../Types/types");
const workoutService_1 = __importDefault(require("./workoutService"));
const notificationService_1 = __importDefault(require("./notificationService"));
const userService_1 = __importDefault(require("./userService"));
const statisticsService_1 = __importDefault(require("./statisticsService"));
class SocketService {
    constructor(io, socket) {
        this.HandShacke = () => {
            const accessToken = this.socket.handshake.auth.token;
            const userNameFromClient = this.socket.handshake.query.name;
            const userRoleFromClient = this.socket.handshake.query.role;
            this.socket.data.userName = userNameFromClient;
            this.socket.data.userRole = userRoleFromClient;
        };
        this.notifyAdmins = async () => {
            const allServerRooms = this.io.sockets.adapter.rooms;
            const isNotSocketId = (name) => !this.io.sockets.sockets.has(name);
            const currentClientsWorkouts = [];
            for (const [, apartSocket] of this.io.sockets.sockets) {
                if (apartSocket.data.userRole === "user") {
                    const clientName = apartSocket.data.userName;
                    const date = new Date();
                    const workoutData = await workoutService_1.default.GetWorkoutResults(clientName, date);
                    if (workoutData) {
                        currentClientsWorkouts.push(workoutData);
                        continue;
                    }
                    currentClientsWorkouts.push({ clientName, date, workoutResult: {} });
                }
            }
            for (const [, apartSocket] of this.io.sockets.sockets) {
                if (apartSocket.data.userRole === "admin") {
                    apartSocket.emit(types_1.SocketEventsEnum.getClientWhoAreTrainingNow, JSON.stringify(currentClientsWorkouts));
                }
            }
        };
        this.NewClientConnected = async () => {
            const clientName = this.socket.data.userName;
            const user = await userService_1.default.GetClient(clientName);
            if (clientName)
                this.socket.join(clientName);
            if (user)
                this.SendNotificationToClient(clientName, user._id);
            this.notifyAdmins();
        };
        this.UpdateWorkout = async (workoutData) => {
            const workout = await workoutService_1.default.SaveWorkoutResults(workoutData.workoutResult, workoutData.name, new Date(workoutData.date));
            return workout.toObject();
        };
        this.SendUpdatedWorkoutToAdmin = (workoutData) => {
            for (const [, apartSocket] of this.io.sockets.sockets) {
                if (apartSocket.data.userRole === "admin") {
                    apartSocket.emit(types_1.SocketEventsEnum.sendUpdatedWorkoutToAdmin, JSON.stringify(workoutData));
                }
            }
        };
        this.SendNotificationToClient = async (clientName, userId) => {
            const notifications = await notificationService_1.default.GetUserNotifications(userId);
            for (const [, apartSocket] of this.io.sockets.sockets) {
                // console.log(clientName + " clientName");
                // console.log(notifications);
                if (apartSocket.data.userName === clientName) {
                    apartSocket.emit(types_1.SocketEventsEnum.loadNotification, JSON.stringify(notifications));
                }
            }
        };
        this.newNotification = async (data) => {
            const parcedData = JSON.parse(data);
            const clientNames = parcedData.clientNames;
            if (parcedData.title === "progressStatisticsCurrentAbon") {
                const { clientNames, message } = parcedData;
                const range = +message.split(":")[1];
                const clientProgressDynamics = await statisticsService_1.default.GetProgressStatisticsbyCurrentAbon(clientNames[0], range);
                parcedData.title = "Огляд досягнень на цьому етапі";
                function analyzeProgress(oldWeight, oldReps, newWeight, newReps) {
                    const weightDiff = newWeight - oldWeight;
                    const repsDiff = newReps - oldReps;
                    if (weightDiff > 0 && repsDiff > 0) {
                        return "📈 Відмінний прогрес - зросла і вага, і кількість повторень!";
                    }
                    if ((weightDiff > 0 && repsDiff < 0) ||
                        (weightDiff < 0 && repsDiff > 0)) {
                        return "⚖️ Динаміка розвитку: один показник покращився, інший — адаптується до нових умов.";
                    }
                    if (weightDiff < 0 && repsDiff < 0) {
                        return "📉 Регрес - знизилися і вага, і кількість повторень.";
                    }
                    return "⚖️ Без змін показники залишилися на тому ж рівні.";
                }
                function calculateStepProgress(data) {
                    let output = "";
                    for (const [exercise, entries] of Object.entries(data)) {
                        if (entries.length < 2)
                            continue;
                        output += `🏋️ Вправа: ${exercise}`;
                        for (let i = 1; i < entries.length; i++) {
                            const prev = entries[i - 1];
                            const curr = entries[i];
                            const changes = [];
                            ["maxWeight", "avgWeight", "avgReps", "tonnage"].forEach((key) => {
                                const diff = curr[key] - prev[key];
                                if (diff !== 0) {
                                    const action = diff > 0 ? "прогресував" : "втратив";
                                    const unit = key === "maxWeight" || key === "avgWeight"
                                        ? "кг"
                                        : key === "avgReps"
                                            ? "повторень"
                                            : "кг";
                                    changes.push(`• ${key}: (${prev.date} → ${curr.date}) ты ${action} на ${Math.round(diff)} ${unit}`);
                                }
                            });
                            const summary = analyzeProgress(prev.maxWeight, prev.avgReps, curr.maxWeight, curr.avgReps);
                            output += `\n📅 ${prev.date} → ${curr.date}\n${changes.join("\n")}\n👉 Підсумок: ${summary}\n`;
                        }
                        output += "\n";
                    }
                    return output.trim();
                }
                parcedData.message = calculateStepProgress(clientProgressDynamics);
            }
            await Promise.all(clientNames.map(async (client) => {
                const newNotification = await notificationService_1.default.CrateNewNotification({
                    clientName: client,
                    title: parcedData.title,
                    message: parcedData.message,
                });
                const populated = await newNotification.populate("userId", "name");
                const clientName = populated.userId
                    .name;
                await this.SendNotificationToClient(clientName, populated.userId);
            }));
        };
        this.MarkNotificationAsReaded = async (data) => {
            const parcedData = JSON.parse(data);
            const updNotifs = await notificationService_1.default.MarkNotificationAsReaded(parcedData.userId, parcedData.visibleNotifications);
            return updNotifs;
        };
        (this.io = io), (this.socket = socket);
    }
}
exports.default = SocketService;
