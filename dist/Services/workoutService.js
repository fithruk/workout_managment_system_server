"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const workoutModel_1 = __importDefault(require("../Models/workoutModel"));
const workoutResultModel_1 = __importDefault(require("../Models/workoutResultModel"));
const dataNormilize_1 = require("../Helpers/DataNormilize/dataNormilize");
const dayjs_1 = __importDefault(require("dayjs"));
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
            if (Wplan) {
                // (Wplan.workoutPlan as ExerciseType[]) = workoutPlan;
                // await Wplan.save();
                // return;
                await Wplan.deleteOne();
            }
            await workoutModel_1.default.create({
                dateOfWorkout: new Date(dateOfWorkout),
                clientName,
                workoutPlan,
            });
        };
        this.GetWorkoutPlan = async (dateOfWorkout, clientName) => {
            const start = new Date(dateOfWorkout);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            const Wplan = await workoutModel_1.default.findOne({
                clientName,
                dateOfWorkout: {
                    $gte: start,
                    $lt: end,
                },
            });
            if (!Wplan)
                throw apiExeption_1.default.BadRequest(`Плану тренування на ${start.toLocaleDateString()} немає`);
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
            // const normalizedDate = normalizeToUTCMinute(dateOfWorkout);
            const start = (0, dataNormilize_1.normalizeToUTCMinute)(dateOfWorkout);
            start.setHours(0, 0, 0, 0);
            const end = (0, dataNormilize_1.normalizeToUTCMinute)(start);
            end.setDate(end.getDate() + 1);
            const currentWorkout = await workoutResultModel_1.default.findOne({
                clientName,
                dateOfWorkout: {
                    $gte: new Date(start),
                    $lte: new Date(end),
                },
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
        this.GetAllWorkoutResults = async (clientName) => {
            const workoutResults = await workoutResultModel_1.default.find({
                clientName,
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
                            $lt: (0, dayjs_1.default)(dateOfRangeEnd).add(1, "day").startOf("day").toDate(),
                        },
                    },
                },
                {
                    $lookup: {
                        from: "workoutresults",
                        let: { date: "$dateOfWorkout", name: "$clientName" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$clientName", "$$name"] },
                                            {
                                                $eq: [
                                                    {
                                                        $dateToString: {
                                                            format: "%Y-%m-%d",
                                                            date: "$dateOfWorkout",
                                                        },
                                                    },
                                                    {
                                                        $dateToString: { format: "%Y-%m-%d", date: "$$date" },
                                                    },
                                                ],
                                            },
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
        // public GetCurrentWorkoutPlan = async (
        //   clientName: string,
        //   dateOfWorkout: Date
        // ) => {
        //   console.log(dateOfWorkout + " dateOfWorkout");
        //   const start = new Date(dateOfWorkout);
        //   console.log(start +  " start");
        //   start.setHours(0, 0, 0, 0);
        //   const end = new Date(start);
        //   end.setDate(end.getDate() + 1); // следующий день
        //   return await WorkoutModel.findOne({
        //     clientName,
        //     dateOfWorkout: {
        //       $gte: start,
        //       $lt: end,
        //     },
        //   });
        // };
        this.GetCurrentWorkoutPlan = async (clientName, dateOfWorkout) => {
            const start = (0, dataNormilize_1.normalizeToUTCMinute)(dateOfWorkout);
            start.setHours(0, 0, 0, 0);
            const end = (0, dataNormilize_1.normalizeToUTCMinute)(start);
            end.setDate(end.getDate() + 1);
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
