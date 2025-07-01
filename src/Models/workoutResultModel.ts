import { Schema, model } from "mongoose";

type OneSet = {
  numberOfSet: number;
  numberOfreps: number;
  weightValue: number;
};

const OneSetSchema = new Schema<OneSet>({
  numberOfSet: { type: Number, required: true },
  numberOfreps: { type: Number, required: true },
  weightValue: { type: Number, required: true },
});

const WorkoutResultSchema = new Schema({
  dateOfWorkout: {
    type: Date,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  workoutResult: {
    type: Map,
    of: [OneSetSchema],
    required: true,
  },
});
export default model("workoutResult", WorkoutResultSchema);
