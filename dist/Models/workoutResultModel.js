"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OneSetSchema = new mongoose_1.Schema({
    numberOfSet: { type: Number, required: true },
    numberOfreps: { type: Number, required: true },
    weightValue: { type: Number, required: true },
});
const WorkoutResultSchema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)("workoutResult", WorkoutResultSchema);
