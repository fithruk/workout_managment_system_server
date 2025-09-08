"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workoutService_1 = __importDefault(require("../Services/workoutService"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
class WorkoutController {
    constructor() {
        this.SaveWorkoutPlan = async (req, res, next) => {
            try {
                const plan = req.body;
                await workoutService_1.default.SaveWorkoutPlan(plan);
                res.status(200).send();
            }
            catch (error) {
                next(error);
            }
        };
        this.DeleteWorkoutPlan = async (req, res, next) => {
            try {
                const { clientName, dateOfWorkout, } = req.body;
                const { acknowledged, deletedCount } = await workoutService_1.default.DeleteWorkoutPlan(clientName, dateOfWorkout);
                if (!deletedCount) {
                    throw apiExeption_1.default.BadRequest("WP does not exist");
                }
                res.status(200).send();
            }
            catch (error) {
                next(error);
            }
        };
        this.GetWorkoutPlan = async (req, res, next) => {
            try {
                const { dateOfWorkout, clientName, } = req.body;
                const workoutPlan = await workoutService_1.default.GetWorkoutPlan(dateOfWorkout, clientName);
                res.status(200).json({ workoutPlan });
            }
            catch (error) {
                next(error);
            }
        };
        this.SaveWorkoutResult = async (req, res, next) => {
            try {
                const { name, date, workoutResult, } = req.body;
                const workoutResponce = await workoutService_1.default.SaveWorkoutResults(workoutResult, name, new Date(date));
                res.status(200).json({ workoutResponce });
            }
            catch (error) {
                next(error);
            }
        };
        this.GetWorkoutResult = async (req, res, next) => {
            try {
                const { name, date } = req.params;
                const workoutResponce = await workoutService_1.default.GetWorkoutResults(name, new Date(date));
                res.status(200).json({ workoutResponce });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new WorkoutController();
