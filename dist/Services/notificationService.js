"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const notificationModel_1 = __importDefault(require("../Models/notificationModel"));
const userService_1 = __importDefault(require("./userService"));
class NotificationService {
    constructor() {
        this.CrateNewNotification = async ({ clientName, title, message, }) => {
            const user = await userService_1.default.GetClient(clientName);
            if (!user)
                throw apiExeption_1.default.BadRequest("User does not exist");
            const notification = await notificationModel_1.default.create({
                userId: user._id,
                title,
                message,
            });
            return notification;
        };
        this.GetUserNotifications = async (userId) => {
            return await notificationModel_1.default.find({
                userId,
                // isRead: false,
            });
        };
        this.MarkNotificationAsReaded = async (userId, visibleNotifications) => {
            const filter = {
                userId,
                ...(visibleNotifications.length > 0 && {
                    _id: { $in: visibleNotifications },
                }),
            };
            await notificationModel_1.default.updateMany(filter, {
                $set: { isRead: true },
            });
            return await notificationModel_1.default.find({ userId });
        };
    }
}
exports.default = new NotificationService();
