import ApiError from "../Exeptions/apiExeption";
import WorkoutModel from "../Models/workoutModel";
import workoutResultModel from "../Models/workoutResultModel";

import {
  ExerciseType,
  WorkoutPlanType,
  SetsAndValuesResults,
} from "../Types/types";

class WorkoutService {
  public SaveWorkoutPlan = async (plan: WorkoutPlanType) => {
    const { clientName, dateOfWorkout, workoutPlan } = plan;
    const Wplan = await WorkoutModel.findOne({ clientName, dateOfWorkout });
    if (Wplan) {
      (Wplan.workoutPlan as ExerciseType[]) = workoutPlan;
      await Wplan.save();
      return;
    }

    await WorkoutModel.create({
      dateOfWorkout,
      clientName,
      workoutPlan,
    });
  };

  public GetWorkoutPlan = async (dateOfWorkout: Date, clientName: string) => {
    const Wplan = await WorkoutModel.findOne({ clientName, dateOfWorkout });
    if (!Wplan)
      throw ApiError.BadRequest(`Плану тренування на ${dateOfWorkout} немає`);

    return Wplan;
  };

  public SaveWorkoutResults = async (
    workoutResult: SetsAndValuesResults,
    name: string,
    date: Date
  ) => {
    const currentWorkout = await workoutResultModel.findOne({
      clientName: name,
      dateOfWorkout: date,
    });

    if (!currentWorkout) {
      const workout = await workoutResultModel.create({
        clientName: name,
        dateOfWorkout: date,
        workoutResult: workoutResult,
      });
      return workout;
    }
    (currentWorkout.workoutResult as unknown as SetsAndValuesResults) =
      workoutResult;
    await currentWorkout.save();
    return currentWorkout;
  };

  public GetWorkoutResults = async (
    clientName: string,
    dateOfWorkout: Date
  ) => {
    const currentWorkout = await workoutResultModel.findOne({
      clientName,
      dateOfWorkout,
    });
    if (!currentWorkout) return null;
    return currentWorkout;
  };

  public GetWorkoutResultsByRange = async (
    dateOfRangeStart: Date,
    dateOfRangeEnd: Date,
    clientName: string
  ) => {
    const workoutResults = await workoutResultModel.find({
      clientName,
      dateOfWorkout: {
        $gte: new Date(dateOfRangeStart),
        $lte: new Date(dateOfRangeEnd),
      },
    });

    return workoutResults;
  };

  public GetCombinedWorkoutDataByRange = async (
    dateOfRangeStart: Date,
    dateOfRangeEnd: Date,
    clientName: string
  ) => {
    const combined = await WorkoutModel.aggregate([
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

  public GetCurrentWorkoutPlan = async (
    clientName: string,
    dateOfWorkout: Date
  ) => {
    return await WorkoutModel.findOne({ clientName, dateOfWorkout });
  };
}

export default new WorkoutService();
