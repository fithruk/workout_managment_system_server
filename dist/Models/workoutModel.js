"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const WorkoutPlanSchema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)("workoutPlan", WorkoutPlanSchema);
