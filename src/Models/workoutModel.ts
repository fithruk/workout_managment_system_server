import { Schema, model } from "mongoose";

const WorkoutPlanSchema = new Schema({
  dateOfWorkout: {
    type: Date,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  workoutPlan: [
    {
      musclesGroup: {
        type: String,
        required: true,
      },
      exercise: {
        type: String,
        required: true,
      },
      sets: {
        type: Number,
        required: true,
      },
      reps: {
        type: Number,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
    },
  ],
});

export default model("workoutPlan", WorkoutPlanSchema);
