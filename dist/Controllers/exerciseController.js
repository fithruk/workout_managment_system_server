"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exerciseService_1 = __importDefault(require("../Services/exerciseService"));
class ExerciseController {
    constructor() {
        this.GetAllExercises = async (req, res, next) => {
            try {
                const exerciseArray = await exerciseService_1.default.GetAllExercises();
                res.status(200).json({ exercises: exerciseArray });
            }
            catch (error) {
                next(error);
            }
        };
        this.GetExercisesByPlan = async (req, res, next) => {
            try {
                const { exercises } = req.body;
                const exercisesByPlan = await exerciseService_1.default.GetExercisesByPlan(exercises);
                res.status(200).json(exercisesByPlan);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new ExerciseController();
