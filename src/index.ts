require("dotenv").config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import AuthRouter from "./Routs/authRoute";
import DataBaseRouter from "./Routs/dataBaseRoute";
import AdminRouter from "./Routs/adminRoute";
import ExerciseRouter from "./Routs/exerciseRoute";
import WorkoutRouter from "./Routs/workoutsRoute";
import StatisticsRouter from "./Routs/statRoute";
import errorMiddlaware from "./Middlewares/errorMiddleware";
import {
  SocketEventsEnum,
  SocketMessageType,
  SoketUpdateWorkoutType,
} from "./Types/types";
import SocketService from "./Services/socketService";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/auth", AuthRouter);
app.use("/dataBase", DataBaseRouter);
app.use("/admin", AdminRouter);
app.use("/exercises", ExerciseRouter);
app.use("/workouts", WorkoutRouter);
app.use("/statistics", StatisticsRouter);
app.use(errorMiddlaware);

// Socket events

// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error("No token"));
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     (socket as any).user = decoded;
//     next();
//   } catch {
//     return next(new Error("Invalid token"));
//   }
// });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  const socketService = new SocketService(io, socket);

  socketService.HandShacke();

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    socketService.notifyAdmins();
  });

  socket.on(SocketEventsEnum.getClientWhoAreTrainingNow, () => {
    socketService.notifyAdmins();
  });

  socket.on(SocketEventsEnum.newClientConnected, (data) => {
    socketService.NewClientConnected(data);
  });
  //  name: string;
  //     date: string;
  //     workoutResult: SetsAndValuesResults;
  socket.on(SocketEventsEnum.updateWorkout, async (data) => {
    const parsedData: SoketUpdateWorkoutType = JSON.parse(data);

    const updatedWorkout = await socketService.UpdateWorkout(parsedData);
    if (updatedWorkout)
      socketService.SendUpdatedWorkoutToAdmin({
        name: updatedWorkout.clientName,
        date: updatedWorkout.dateOfWorkout.toString(),
        workoutResult: Object.fromEntries(updatedWorkout.workoutResult),
      });
  });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL!);
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
};

start();
