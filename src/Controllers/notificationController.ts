import { Request, Response, NextFunction } from "express";
import notificationService from "../Services/notificationService";

import { NotificationType } from "../Types/types";

class NotificationController {
  public CreateNewNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        clientName,
        title,
        message,
      }: Omit<NotificationType, "userId"> & { clientName: string } = req.body;

      const notification = await notificationService.CrateNewNotification({
        clientName,
        title,
        message,
      });
      console.log(notification.userId);
      console.log(notification.title);
      console.log(notification.message);
      res.status(200).json({});
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationController();
