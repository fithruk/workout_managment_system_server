import { Server, Socket } from "socket.io";
import {
  SocketEventsEnum,
  SoketUpdateWorkoutType,
  UpdatedNotifications,
} from "../Types/types";
import workoutService from "./workoutService";
import notificationService from "./notificationService";
import { Types } from "mongoose";
import userService from "./userService";

type NotificationType = { clientName: string; title: string; message: string };

class SocketService {
  io: Server;
  socket: Socket;
  constructor(io: Server, socket: Socket) {
    (this.io = io), (this.socket = socket);
  }

  // Удалить или применять везде
  // private EmitEvent = (event: SocketEventsEnum, msg?: EmitEventMsgType) => {
  //   switch (event) {
  //     case SocketEventsEnum.getClientWhoAreTrainingNow:
  //       this.socket.emit(
  //         SocketEventsEnum.getClientWhoAreTrainingNow,
  //         JSON.stringify(msg)
  //       );
  //       break;

  //     default:
  //       break;
  //   }
  // };

  public HandShacke = () => {
    const accessToken = this.socket.handshake.auth.token;

    const userNameFromClient = this.socket.handshake.query.name;
    const userRoleFromClient = this.socket.handshake.query.role;
    this.socket.data.userName = userNameFromClient;
    this.socket.data.userRole = userRoleFromClient;
  };

  public notifyAdmins = async () => {
    const allServerRooms = this.io.sockets.adapter.rooms;
    const isNotSocketId = (name: string) => !this.io.sockets.sockets.has(name);

    const currentClientsWorkouts = [];

    for (const [, apartSocket] of this.io.sockets.sockets) {
      if (apartSocket.data.userRole === "user") {
        const clientName = apartSocket.data.userName;
        const date = new Date();
        const workoutData = await workoutService.GetWorkoutResults(
          clientName,
          date
        );
        if (workoutData) {
          currentClientsWorkouts.push(workoutData);
          continue;
        }
        currentClientsWorkouts.push({ clientName, date, workoutResult: {} });
      }
    }

    for (const [, apartSocket] of this.io.sockets.sockets) {
      if (apartSocket.data.userRole === "admin") {
        apartSocket.emit(
          SocketEventsEnum.getClientWhoAreTrainingNow,
          JSON.stringify(currentClientsWorkouts)
        );
      }
    }
  };

  public NewClientConnected = async () => {
    const clientName = this.socket.data.userName;
    const user = await userService.GetClient(clientName);
    if (clientName) this.socket.join(clientName);
    if (user) this.SendNotificationToClient(clientName, user._id);

    this.notifyAdmins();
  };

  public UpdateWorkout = async (workoutData: SoketUpdateWorkoutType) => {
    const workout = await workoutService.SaveWorkoutResults(
      workoutData.workoutResult,
      workoutData.name,
      new Date(workoutData.date)
    );

    return workout.toObject();
  };

  public SendUpdatedWorkoutToAdmin = (workoutData: SoketUpdateWorkoutType) => {
    for (const [, apartSocket] of this.io.sockets.sockets) {
      if (apartSocket.data.userRole === "admin") {
        apartSocket.emit(
          SocketEventsEnum.sendUpdatedWorkoutToAdmin,
          JSON.stringify(workoutData)
        );
      }
    }
  };

  public SendNotificationToClient = async (
    clientName: string,
    userId: Types.ObjectId
  ) => {
    const notifications = await notificationService.GetUserNotifications(
      userId
    );

    for (const [, apartSocket] of this.io.sockets.sockets) {
      console.log(clientName + " clientName");
      console.log(notifications);

      if (apartSocket.data.userName === clientName) {
        apartSocket.emit(
          SocketEventsEnum.loadNotification,
          JSON.stringify(notifications)
        );
      }
    }
  };

  public newNotification = async (data: string) => {
    const parcedData: NotificationType = JSON.parse(data);

    const newNotification = await notificationService.CrateNewNotification(
      parcedData
    );

    const populated = await newNotification.populate("userId", "name");

    const clientName = (populated.userId as unknown as { name: string }).name;

    await this.SendNotificationToClient(clientName, populated.userId);
  };

  public MarkNotificationAsReaded = async (data: string) => {
    const parcedData: { userId: string; visibleNotifications: string[] } =
      JSON.parse(data);

    const updNotifs: UpdatedNotifications[] =
      await notificationService.MarkNotificationAsReaded(
        parcedData.userId,
        parcedData.visibleNotifications
      );
    return updNotifs;
  };

  // public Disconnect = () => {
  //   this.socket.on("disconnect", () => {
  //     console.log("Socket disconnected:", this.socket.id);
  //   });
  // };
}

export default SocketService;
