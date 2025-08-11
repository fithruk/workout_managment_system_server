"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../Types/types");
const workoutService_1 = __importDefault(require("./workoutService"));
class SocketService {
    constructor(io, socket) {
        // Удалить или применять везде
        this.EmitEvent = (event, msg) => {
            switch (event) {
                case types_1.SocketEventsEnum.getClientWhoAreTrainingNow:
                    this.socket.emit(types_1.SocketEventsEnum.getClientWhoAreTrainingNow, JSON.stringify(msg));
                    break;
                default:
                    break;
            }
        };
        this.HandShacke = () => {
            const accessToken = this.socket.handshake.auth.token;
            const userNameFromClient = this.socket.handshake.query.name;
            const userRoleFromClient = this.socket.handshake.query.role;
            // console.log(`User name from client: ${userNameFromClient}`);
            // console.log(`User role from client: ${userRoleFromClient}`);
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
                    // apartSocket.emit(
                    //   SocketEventsEnum.getClientWhoAreTrainingNow,
                    //   JSON.stringify(
                    //     [...allServerRooms.keys()].filter(
                    //       (name) =>
                    //         name !== apartSocket.data.userName && isNotSocketId(name)
                    //     )
                    //   )
                    // );
                    apartSocket.emit(types_1.SocketEventsEnum.getClientWhoAreTrainingNow, JSON.stringify(currentClientsWorkouts));
                }
            }
        };
        this.NewClientConnected = (data) => {
            const roomName = this.socket.data.userName;
            if (roomName)
                this.socket.join(roomName);
            this.notifyAdmins();
        };
        this.GetClientWhoAreTrainingNow = () => {
            this.socket.on(types_1.SocketEventsEnum.getClientWhoAreTrainingNow, () => {
                const allRooms = [...this.socket.rooms];
                this.EmitEvent(types_1.SocketEventsEnum.getClientWhoAreTrainingNow, allRooms);
            });
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
        (this.io = io), (this.socket = socket);
    }
}
exports.default = SocketService;
