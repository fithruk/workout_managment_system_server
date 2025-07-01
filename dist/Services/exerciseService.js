"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exerciseModel_1 = __importDefault(require("../Models/exerciseModel"));
class ExerciseService {
    constructor() {
        this.GetAllExercises = async () => {
            return await exerciseModel_1.default.find();
        };
        this.GetExercisesByPlan = async (exercises) => {
            return await exerciseModel_1.default.find({
                ExerciseName: {
                    $in: exercises.map((ex) => new RegExp(`^${ex}$`, "i")),
                },
            });
        };
    }
}
exports.default = new ExerciseService();
