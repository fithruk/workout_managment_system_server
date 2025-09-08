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
        this.GetAllWorkoutPlansForToday = async () => {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);
            const Wplans = await workoutModel_1.default.find({
                dateOfWorkout: {
                    $gte: start,
                    $lt: end,
                },
            });
            if (!Wplans)
                throw apiExeption_1.default.BadRequest(`Планов тренуваннь на ${start.toLocaleDateString()} немає`);
            return Wplans;
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
        // public SaveWorkoutResults = async (
        //   workoutResult: SetsAndValuesResults,
        //   name: string,
        //   date: Date
        // ) => {
        //   const normalizedDate = normalizeToUTCMinute(date);
        //   const currentWorkout = await workoutResultModel.findOne({
        //     clientName: name,
        //     dateOfWorkout: new Date(normalizedDate),
        //   });
        //   if (!currentWorkout) {
        //     const workout = await workoutResultModel.create({
        //       clientName: name,
        //       dateOfWorkout: new Date(normalizedDate),
        //       workoutResult: workoutResult,
        //     });
        //     return workout;
        //   }
        //   (currentWorkout.workoutResult as unknown as SetsAndValuesResults) =
        //     workoutResult;
        //   await currentWorkout.save();
        //   return currentWorkout;
        // };
        this.SaveWorkoutResults = async (workoutResult, name, date) => {
            // Обнуляем время, чтобы осталась только дата
            const onlyDateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
            const currentWorkout = await workoutResultModel_1.default.findOne({
                clientName: name,
                dateOfWorkout: onlyDateUTC,
            });
            if (!currentWorkout) {
                const workout = await workoutResultModel_1.default.create({
                    clientName: name,
                    dateOfWorkout: onlyDateUTC,
                    workoutResult: workoutResult,
                });
                return workout;
            }
            // обновляем результат
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
        this.GetWeightChangeDynamicsDataByName = async (clientName, exerciseName) => {
            const exerciseData = await workoutResultModel_1.default.aggregate([
                {
                    $match: {
                        clientName,
                        [`workoutResult.${exerciseName}`]: { $exists: true },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: "$dateOfWorkout",
                        sets: `$workoutResult.${exerciseName}`,
                    },
                },
                {
                    $sort: { date: 1 }, // по дате по возрастанию
                },
            ]);
            return exerciseData;
        };
        this.GetClientsWhoAreTrainingNow = async () => {
            const start = (0, dataNormilize_1.normalizeToUTCMinute)(new Date());
            start.setHours(0, 0, 0, 0);
            const end = (0, dataNormilize_1.normalizeToUTCMinute)(start);
            end.setDate(end.getDate() + 1);
            return await workoutResultModel_1.default.find({
                dateOfWorkout: {
                    $gte: start,
                    $lt: end,
                },
            });
        };
        this.DeleteWorkoutPlan = async (clientName, date) => {
            const start = (0, dataNormilize_1.normalizeToUTCMinute)(new Date(date));
            start.setHours(0, 0, 0, 0);
            const end = (0, dataNormilize_1.normalizeToUTCMinute)(start);
            end.setDate(end.getDate() + 1);
            return await workoutModel_1.default.deleteOne({
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
