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
import statisticsService from "./statisticsService";

type NotificationType = {
  clientNames: string[];
  title: string;
  message: string;
};

type ExerciseEntry = {
  date: string;
  maxWeight: number;
  avgWeight: number;
  avgReps: number;
  tonnage: number;
};

type TrainingData = Record<string, ExerciseEntry[]>;

type StepProgress = {
  from: string;
  to: string;
  changes: {
    key: keyof Omit<ExerciseEntry, "date">;
    diff: number;
    message: string;
  }[];
  summary: string;
};

type ProgressResult = {
  exercise: string;
  steps: StepProgress[];
};

class SocketService {
  io: Server;
  socket: Socket;
  constructor(io: Server, socket: Socket) {
    ((this.io = io), (this.socket = socket));
  }

  public HandShacke = () => {
    const accessToken = this.socket.handshake.auth.token;

    const userNameFromClient = this.socket.handshake.query.name;
    const userRoleFromClient = this.socket.handshake.query.role;
    this.socket.data.userName = userNameFromClient;
    this.socket.data.userRole = userRoleFromClient;
    console.log(userNameFromClient + " connected");
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
          date,
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
          JSON.stringify(currentClientsWorkouts),
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
      new Date(workoutData.date),
    );

    return workout.toObject();
  };

  public SendUpdatedWorkoutToAdmin = (workoutData: SoketUpdateWorkoutType) => {
    for (const [, apartSocket] of this.io.sockets.sockets) {
      if (apartSocket.data.userRole === "admin") {
        apartSocket.emit(
          SocketEventsEnum.sendUpdatedWorkoutToAdmin,
          JSON.stringify(workoutData),
        );
      }
    }
  };

  public SendNotificationToClient = async (
    clientName: string,
    userId: Types.ObjectId,
  ) => {
    const notifications =
      await notificationService.GetUserNotifications(userId);

    for (const [, apartSocket] of this.io.sockets.sockets) {
      // console.log(clientName + " clientName");
      // console.log(notifications);

      if (apartSocket.data.userName === clientName) {
        apartSocket.emit(
          SocketEventsEnum.loadNotification,
          JSON.stringify(notifications),
        );
      }
    }
  };

  public newNotification = async (data: string) => {
    const parcedData: NotificationType = JSON.parse(data);

    const clientNames = parcedData.clientNames;

    if (parcedData.title === "progressStatisticsCurrentAbon") {
      const { clientNames, message } = parcedData;
      const range = +message.split(":")[1];
      const clientProgressDynamics =
        await statisticsService.GetProgressStatisticsbyCurrentAbon(
          clientNames[0],
          range,
        );

      parcedData.title = "Огляд досягнень на цьому етапі";

      function analyzeProgress(
        oldWeight: number,
        oldReps: number,
        newWeight: number,
        newReps: number,
      ): string {
        const weightDiff = newWeight - oldWeight;
        const repsDiff = newReps - oldReps;

        if (weightDiff > 0 && repsDiff > 0) {
          return "📈 Відмінний прогрес - зросла і вага, і кількість повторень!";
        }

        if (
          (weightDiff > 0 && repsDiff < 0) ||
          (weightDiff < 0 && repsDiff > 0)
        ) {
          return "⚖️ Динаміка розвитку: один показник покращився, інший — адаптується до нових умов.";
        }

        if (weightDiff < 0 && repsDiff < 0) {
          return "📉 Регрес - знизилися і вага, і кількість повторень.";
        }

        return "⚖️ Без змін показники залишилися на тому ж рівні.";
      }

      function calculateStepProgress(data: TrainingData): string {
        let output = "";

        for (const [exercise, entries] of Object.entries(data)) {
          if (entries.length < 2) continue;

          output += `🏋️ Вправа: ${exercise}`;

          for (let i = 1; i < entries.length; i++) {
            const prev = entries[i - 1];
            const curr = entries[i];
            const changes: string[] = [];

            (["maxWeight", "avgWeight", "avgReps", "tonnage"] as const).forEach(
              (key) => {
                const diff = curr[key] - prev[key];
                if (diff !== 0) {
                  const action = diff > 0 ? "додав" : "втратив";
                  const unit =
                    key === "maxWeight" || key === "avgWeight"
                      ? "кг"
                      : key === "avgReps"
                        ? "повторень"
                        : "кг";

                  changes.push(
                    `• ${key}: (${prev.date} → ${
                      curr.date
                    }) ты ${action} на ${Math.round(diff)} ${unit}`,
                  );
                }
              },
            );

            const summary = analyzeProgress(
              prev.maxWeight,
              prev.avgReps,
              curr.maxWeight,
              curr.avgReps,
            );

            output += `\n📅 ${prev.date} → ${curr.date}\n${changes.join(
              "\n",
            )}\n👉 Підсумок: ${summary}\n`;
          }

          output += "\n";
        }

        return output.trim();
      }

      parcedData.message = calculateStepProgress(clientProgressDynamics);
    }

    await Promise.all(
      clientNames.map(async (client) => {
        const newNotification = await notificationService.CrateNewNotification({
          clientName: client,
          title: parcedData.title,
          message: parcedData.message,
        });

        const populated = await newNotification.populate("userId", "name");

        const clientName = (populated.userId as unknown as { name: string })
          .name;

        await this.SendNotificationToClient(clientName, populated.userId);
      }),
    );
  };

  public MarkNotificationAsReaded = async (data: string) => {
    const parcedData: { userId: string; visibleNotifications: string[] } =
      JSON.parse(data);

    const updNotifs: UpdatedNotifications[] =
      await notificationService.MarkNotificationAsReaded(
        parcedData.userId,
        parcedData.visibleNotifications,
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
