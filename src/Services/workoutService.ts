import ApiError from "../Exeptions/apiExeption";
import WorkoutModel from "../Models/workoutModel";
import workoutResultModel from "../Models/workoutResultModel";
import { normalizeToUTCMinute } from "../Helpers/DataNormilize/dataNormilize";
import {
  ExerciseType,
  WorkoutPlanType,
  SetsAndValuesResults,
} from "../Types/types";

class WorkoutService {
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

  public SaveWorkoutPlan = async (plan: WorkoutPlanType) => {
    const { clientName, dateOfWorkout, workoutPlan } = plan;

    const start = new Date(dateOfWorkout);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1); // следующий день

    const Wplan = await WorkoutModel.findOne({
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

    await WorkoutModel.create({
      dateOfWorkout: new Date(dateOfWorkout),
      clientName,
      workoutPlan,
    });
  };

  public GetWorkoutPlan = async (dateOfWorkout: Date, clientName: string) => {
    const start = new Date(dateOfWorkout);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const Wplan = await WorkoutModel.findOne({
      clientName,
      dateOfWorkout: {
        $gte: start,
        $lt: end,
      },
    });

    if (!Wplan)
      throw ApiError.BadRequest(
        `Плану тренування на ${start.toLocaleDateString()} немає`
      );

    return Wplan;
  };

  public SaveWorkoutResults = async (
    workoutResult: SetsAndValuesResults,
    name: string,
    date: Date
  ) => {
    const normalizedDate = normalizeToUTCMinute(date);

    const currentWorkout = await workoutResultModel.findOne({
      clientName: name,
      dateOfWorkout: new Date(normalizedDate),
    });

    if (!currentWorkout) {
      const workout = await workoutResultModel.create({
        clientName: name,
        dateOfWorkout: new Date(normalizedDate),
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
    const normalizedDate = normalizeToUTCMinute(dateOfWorkout);

    const currentWorkout = await workoutResultModel.findOne({
      clientName,
      dateOfWorkout: new Date(normalizedDate),
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

  public GetCurrentWorkoutPlan = async (
    clientName: string,
    dateOfWorkout: Date
  ) => {
    const start = normalizeToUTCMinute(dateOfWorkout);

    start.setHours(0, 0, 0, 0);

    const end = normalizeToUTCMinute(start);
    end.setDate(end.getDate() + 1);

    return await WorkoutModel.findOne({
      clientName,
      dateOfWorkout: {
        $gte: start,
        $lt: end,
      },
    });
  };
}

export default new WorkoutService();
