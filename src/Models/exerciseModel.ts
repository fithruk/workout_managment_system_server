import { Schema, model } from "mongoose";

const InstructionPhaseSchema = new Schema({
  PhaseKey: { type: Number, required: true },
  PhaseName: { type: String, required: true },
  Instructions: { type: [String], required: true },
});

const DescriptionSchema = new Schema({
  StepNameEng: { type: String, required: true },
  StepNameRu: { type: String, required: true },
  StepNameUa: { type: String, required: true },
  DescriptionsRu: { type: [InstructionPhaseSchema], required: true },
  DescriptionsUa: { type: [InstructionPhaseSchema], required: true },
});

const exerciseSchema = new Schema({
  ExerciseName: { type: String, required: true },
  ExerciseMuscleGroup: { type: String, required: true },
  Equipment: { type: String, required: true },
  Difficulty: { type: String, required: true },
  ImageUrl: { type: String, required: true },
  Steps: { type: [DescriptionSchema], required: true },
});

export default model("exercise", exerciseSchema);
