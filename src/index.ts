require("dotenv").config();
import express from "express";
import AuthRouter from "./Routs/authRoute";
import DataBaseRouter from "./Routs/dataBaseRoute";
import AdminRouter from "./Routs/adminRoute";
import ExerciseRouter from "./Routs/exerciseRoute";
import WorkoutRouter from "./Routs/workoutsRoute";
import StatisticsRouter from "./Routs/statRoute";
import mongoose from "mongoose";
import cors from "cors";
import errorMiddlaware from "./Middlewares/errorMiddleware";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/auth", AuthRouter);
app.use("/dataBase", DataBaseRouter);
app.use("/admin", AdminRouter);
app.use("/exercises", ExerciseRouter);
app.use("/workouts", WorkoutRouter);
app.use("/statistics", StatisticsRouter);
app.use(errorMiddlaware);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL!);
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
};

start();
