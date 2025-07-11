"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const workoutModel_1 = __importDefault(require("../Models/workoutModel"));
const workoutResultModel_1 = __importDefault(require("../Models/workoutResultModel"));
const dataNormilize_1 = require("../Helpers/DataNormilize/dataNormilize");
class WorkoutService {
    constructor() {
        // public SaveWorkoutPlan = async (plan: WorkoutPlanType) => {
        //   const { clientName, dateOfWorkout, workoutPlan } = plan;
        //   const normalizedDate = normalizeToUTCMinute(plan.dateOfWorkout);
        //   const Wplan = await WorkoutModel.findOne({ clientName, dateOfWorkout });
        //   if (Wplan) {
        //     (Wplan.workoutPlan as ExerciseType[]) = workoutPlan;
        //     await Wplan.save();
        //     return;
        //   }
        //   await WorkoutModel.create({
        //     dateOfWorkout: new Date(normalizedDate),
        //     clientName,
        //     workoutPlan,
        //   });
        // };
        this.SaveWorkoutPlan = async (plan) => {
            const { clientName, dateOfWorkout, workoutPlan } = plan;
            const start = new Date(dateOfWorkout);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1); // следующий день
            const Wplan = await workoutModel_1.default.findOne({
                clientName,
                dateOfWorkout: {
                    $gte: start,
                    $lt: end,
                },
            });
            console.log(Wplan);
            if (Wplan) {
                Wplan.workoutPlan = workoutPlan;
                await Wplan.save();
                return;
            }
            await workoutModel_1.default.create({
                dateOfWorkout: new Date(dateOfWorkout),
                clientName,
                workoutPlan,
            });
        };
        this.GetWorkoutPlan = async (dateOfWorkout, clientName) => {
            const normalizedDate = (0, dataNormilize_1.normalizeToUTCMinute)(dateOfWorkout);
            console.log(normalizedDate + " normalizedDate");
            const Wplan = await workoutModel_1.default.findOne({
                clientName,
                dateOfWorkout: new Date(normalizedDate),
            });
            if (!Wplan)
                throw apiExeption_1.default.BadRequest(`Плану тренування на ${dateOfWorkout} немає`);
            return Wplan;
        };
        this.SaveWorkoutResults = async (workoutResult, name, date) => {
            const normalizedDate = (0, dataNormilize_1.normalizeToUTCMinute)(date);
            const currentWorkout = await workoutResultModel_1.default.findOne({
                clientName: name,
                dateOfWorkout: new Date(normalizedDate),
            });
            if (!currentWorkout) {
                const workout = await workoutResultModel_1.default.create({
                    clientName: name,
                    dateOfWorkout: new Date(normalizedDate),
                    workoutResult: workoutResult,
                });
                return workout;
            }
            currentWorkout.workoutResult =
                workoutResult;
            await currentWorkout.save();
            return currentWorkout;
        };
        this.GetWorkoutResults = async (clientName, dateOfWorkout) => {
            const normalizedDate = (0, dataNormilize_1.normalizeToUTCMinute)(dateOfWorkout);
            const currentWorkout = await workoutResultModel_1.default.findOne({
                clientName,
                dateOfWorkout: new Date(normalizedDate),
            });
            if (!currentWorkout)
                return null;
            return currentWorkout;
        };
        this.GetWorkoutResultsByRange = async (dateOfRangeStart, dateOfRangeEnd, clientName) => {
            const workoutResults = await workoutResultModel_1.default.find({
                clientName,
                dateOfWorkout: {
                    $gte: new Date(dateOfRangeStart),
                    $lte: new Date(dateOfRangeEnd),
                },
            });
            return workoutResults;
        };
        this.GetCombinedWorkoutDataByRange = async (dateOfRangeStart, dateOfRangeEnd, clientName) => {
            const combined = await workoutModel_1.default.aggregate([
                {
                    $match: {
                        clientName,
                        dateOfWorkout: {
                            $gte: new Date(dateOfRangeStart),
                            $lte: new Date(dateOfRangeEnd),
                        },
                    },
                },
                {
                    $lookup: {
                        from: "workoutresults", // имя коллекции в MongoDB, не имя модели
                        let: { date: "$dateOfWorkout", name: "$clientName" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$clientName", "$$name"] },
                                            { $eq: ["$dateOfWorkout", "$$date"] },
                                        ],
                                    },
                                },
                            },
                        ],
                        as: "result",
                    },
                },
                {
                    $addFields: {
                        resultDoc: { $arrayElemAt: ["$result", 0] },
                    },
                },
                {
                    $addFields: {
                        workoutResult: "$resultDoc.workoutResult",
                    },
                },
                {
                    $project: {
                        result: 0,
                        resultDoc: 0,
                    },
                },
                {
                    $sort: { dateOfWorkout: 1 },
                },
            ]);
            return combined;
        };
        // public GetCurrentWorkoutPlan = async (
        //   clientName: string,
        //   dateOfWorkout: Date
        // ) => {
        //   const normalizedDate = normalizeToUTCMinute(dateOfWorkout);
        //   return await WorkoutModel.findOne({
        //     clientName,
        //     dateOfWorkout: new Date(normalizedDate),
        //   });
        // };
        this.GetCurrentWorkoutPlan = async (clientName, dateOfWorkout) => {
            const start = new Date(dateOfWorkout);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1); // следующий день
            return await workoutModel_1.default.findOne({
                clientName,
                dateOfWorkout: {
                    $gte: start,
                    $lt: end,
                },
            });
        };
    }
}
exports.default = new WorkoutService();
