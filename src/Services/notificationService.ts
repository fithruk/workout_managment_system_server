import { Types } from "mongoose";
import ApiError from "../Exeptions/apiExeption";
import notificationModel from "../Models/notificationModel";
import { NotificationType, UpdatedNotifications } from "../Types/types";
import userService from "./userService";

class NotificationService {
  public CrateNewNotification = async ({
    clientName,
    title,
    message,
  }: Omit<NotificationType, "userId"> & { clientName: string }) => {
    const user = await userService.GetClient(clientName);

    if (!user) throw ApiError.BadRequest("User does not exist");

    const notification = await notificationModel.create({
      userId: user._id,
      title,
      message,
    });
    return notification;
  };

  public GetUserNotifications = async (userId: Types.ObjectId) => {
    return await notificationModel.find({
      userId,
      // isRead: false,
    });
  };

  public MarkNotificationAsReaded = async (
    userId: string,
    visibleNotifications: string[]
  ): Promise<UpdatedNotifications[]> => {
    const filter = {
      userId,
      ...(visibleNotifications.length > 0 && {
        _id: { $in: visibleNotifications },
      }),
    };

    await notificationModel.updateMany(filter, {
      $set: { isRead: true },
    });

    return await notificationModel.find({ userId });
  };
}

export default new NotificationService();
