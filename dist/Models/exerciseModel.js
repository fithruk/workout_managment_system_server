"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InstructionPhaseSchema = new mongoose_1.Schema({
    PhaseKey: { type: Number, required: true },
    PhaseName: { type: String, required: true },
    Instructions: { type: [String], required: true },
});
const DescriptionSchema = new mongoose_1.Schema({
    StepNameEng: { type: String, required: true },
    StepNameRu: { type: String, required: true },
    StepNameUa: { type: String, required: true },
    DescriptionsRu: { type: [InstructionPhaseSchema], required: true },
    DescriptionsUa: { type: [InstructionPhaseSchema], required: true },
});
const exerciseSchema = new mongoose_1.Schema({
    ExerciseName: { type: String, required: true },
    ExerciseMuscleGroup: { type: String, required: true },
    Equipment: { type: String, required: true },
    Difficulty: { type: String, required: true },
    ImageUrl: { type: String, required: true },
    Steps: { type: [DescriptionSchema], required: true },
});
exports.default = (0, mongoose_1.model)("exercise", exerciseSchema);
