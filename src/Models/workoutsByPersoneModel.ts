import { Schema, model } from "mongoose";

const workoutByPersoneSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  workoutDates: {
    type: [Date],
    required: true,
  },
});

export default model("WorkoutByPersone", workoutByPersoneSchema);
