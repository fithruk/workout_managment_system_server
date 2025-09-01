"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = __importDefault(require("../Services/notificationService"));
class NotificationController {
    constructor() {
        this.CreateNewNotification = async (req, res, next) => {
            try {
                const { clientName, title, message, } = req.body;
                const notification = await notificationService_1.default.CrateNewNotification({
                    clientName,
                    title,
                    message,
                });
                console.log(notification.userId);
                console.log(notification.title);
                console.log(notification.message);
                res.status(200).json({});
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new NotificationController();
