import { Server, Socket } from "socket.io";
import {
  SocketEventsEnum,
  SocketMessageType,
  SoketUpdateWorkoutType,
} from "../Types/types";
import workoutService from "./workoutService";

type EmitEventMsgType = SocketMessageType | string[];

class SocketService {
  io: Server;
  socket: Socket;
  constructor(io: Server, socket: Socket) {
    (this.io = io), (this.socket = socket);
  }

  // Удалить или применять везде
  private EmitEvent = (event: SocketEventsEnum, msg?: EmitEventMsgType) => {
    switch (event) {
      case SocketEventsEnum.getClientWhoAreTrainingNow:
        this.socket.emit(
          SocketEventsEnum.getClientWhoAreTrainingNow,
          JSON.stringify(msg)
        );
        break;

      default:
        break;
    }
  };

  public HandShacke = () => {
    const accessToken = this.socket.handshake.auth.token;

    const userNameFromClient = this.socket.handshake.query.name;
    const userRoleFromClient = this.socket.handshake.query.role;
    // console.log(`User name from client: ${userNameFromClient}`);
    // console.log(`User role from client: ${userRoleFromClient}`);
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
        // apartSocket.emit(
        //   SocketEventsEnum.getClientWhoAreTrainingNow,
        //   JSON.stringify(
        //     [...allServerRooms.keys()].filter(
        //       (name) =>
        //         name !== apartSocket.data.userName && isNotSocketId(name)
        //     )
        //   )
        // );
        apartSocket.emit(
          SocketEventsEnum.getClientWhoAreTrainingNow,
          JSON.stringify(currentClientsWorkouts)
        );
      }
    }
  };

  public NewClientConnected = (data: string) => {
    const roomName = this.socket.data.userName;

    if (roomName) this.socket.join(roomName);

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

  // public Disconnect = () => {
  //   this.socket.on("disconnect", () => {
  //     console.log("Socket disconnected:", this.socket.id);
  //   });
  // };
}

export default SocketService;
