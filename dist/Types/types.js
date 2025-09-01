"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketEventsEnum = void 0;
var SocketEventsEnum;
(function (SocketEventsEnum) {
    SocketEventsEnum["getClientWhoAreTrainingNow"] = "getClientWhoAreTrainingNow";
    SocketEventsEnum["clientDisconnected"] = "clientDisconnected";
    SocketEventsEnum["newClientConnected"] = "newClientConnected";
    SocketEventsEnum["updateWorkout"] = "updateWorkout";
    SocketEventsEnum["sendUpdatedWorkoutToAdmin"] = "sendUpdatedWorkoutToAdmin";
    SocketEventsEnum["newNotification"] = "newNotification";
    SocketEventsEnum["loadNotification"] = "loadNotification";
    SocketEventsEnum["markNotificationAsReaded"] = "markNotificationAsReaded";
})(SocketEventsEnum || (exports.SocketEventsEnum = SocketEventsEnum = {}));
