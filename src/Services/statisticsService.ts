import { Exercise, WorkoutData } from "../Types/types";
import dataBaseService from "./dataBaseService";
import workoutService from "./workoutService";
import exerciseService from "./exerciseService";

//По группам мышц, какие группы чаще тренируются RadarChart +
//График прироста рабочих весов (по ключевым упражнениям). +
//Максимальный рабочий вес +
//Общее количество рабочих подходов / повторений / поднятого веса.(Тоннаж) +

const keyExercises = [
  "Barbell Bench Press",
  "Deadlift",
  "Back Squat",
  "Skull Crusher",
  "Incline Dumbbell Bench Press",
  "Barbell Incline Bench Press",
  "Barbell Bicep Curl",
  "Barbell Row",
  "Overhead Press",
  "Front Squat",
  "Romanian Deadlift",
  "Weighted Pull Up",
  "EZ Bar Curl",
  "Close-grip Bench Press",
];

type TonnagePerWorkout = {
  date: Date;
  tonnage: Record<string, number>;
};

class StatisticsService {
  public GetCommonSatisticsByName = async (clientName: string) => {
    const [abonement, workoutDates, allWorkouts, allExercises] =
      await Promise.all([
        dataBaseService.GetApartAbonementByName(clientName),
        dataBaseService.GetWorkoutesDatesByName(clientName),
        workoutService.GetAllWorkoutResults(clientName),
        exerciseService.GetAllExercises(),
      ]);
    const totalReps = allWorkouts.reduce((initial, wk) => {
      wk.workoutResult.forEach((ex) =>
        ex.forEach((set) => (initial += set.numberOfreps))
      );
      return initial;
    }, 0);

    const strengthProgression = this.GetStrengthProgression(allWorkouts);
    const frequentMuscleGroups = this.GetFrequentMuscleGroups(
      allWorkouts,
      allExercises as Exercise[]
    );
    const maxWeights = this.GetMaxWeights(allWorkouts);
    const tonnagePerWorkout = this.GetTonnagePerWorkout(
      allWorkouts,
      allExercises as Exercise[]
    );

    return {
      abonement,
      totalWorkouts: allWorkouts.length,
      totalReps,
      strengthProgression,
      workoutDates,
      frequentMuscleGroups,
      maxWeights,
      tonnagePerWorkout,
    };
  };

  private GetStrengthProgression = (allWorkouts: WorkoutData[]) => {
    type VolumeEntry = { date: Date; totalVolume: number };

    const totalVolumeProgression: VolumeEntry[] = [];

    allWorkouts.forEach((workout) => {
      const date = new Date(workout.dateOfWorkout);

      let totalVolume = 0;

      workout.workoutResult.forEach((setsArray) => {
        setsArray.forEach((set) => {
          if (set.weightValue! >= 4) {
            totalVolume += set.weightValue! * set.numberOfreps!;
          }
        });
      });

      totalVolumeProgression.push({
        date,
        totalVolume,
      });
    });

    totalVolumeProgression.sort((a, b) => a.date.getTime() - b.date.getTime());

    type StrengthEntry = {
      exercise: string;
      date: Date;
      averageWeight: number;
    };

    const strengthProgression: StrengthEntry[] = [];

    allWorkouts.forEach((workout) => {
      const date = new Date(workout.dateOfWorkout);

      workout.workoutResult.forEach((setsArray, exercise) => {
        if (keyExercises.includes(exercise)) {
          const validSets = setsArray.filter((set) => set.weightValue! >= 4);

          if (validSets.length > 0) {
            const totalWeight = validSets.reduce(
              (sum: number, set) => sum + set.weightValue!,
              0
            );
            const avgWeight = totalWeight / validSets.length;

            strengthProgression.push({
              exercise,
              date,
              averageWeight: +avgWeight.toFixed(1),
            });
          }
        }
      });
    });

    return strengthProgression.sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  };

  private GetFrequentMuscleGroups = (
    allWorkouts: WorkoutData[],
    allExercises: Exercise[]
  ) => {
    const groups: Record<string, number> = {};
    let allSets = 0;

    const exerciseMap = new Map(
      allExercises.map((ex) => [ex.ExerciseName, ex.ExerciseMuscleGroup])
    );

    allWorkouts.forEach((wk) => {
      for (const exerciseName of wk.workoutResult.keys()) {
        const muscleGroup = exerciseMap.get(exerciseName);

        if (muscleGroup) {
          groups[muscleGroup] = (groups[muscleGroup] || 0) + 1;
          allSets += 1;
        }
      }
    });

    const percentages: Record<string, number> = {};
    for (const [muscleGroup, count] of Object.entries(groups)) {
      percentages[muscleGroup] = +((count / allSets) * 100).toFixed(1);
    }

    return percentages;
  };

  private GetMaxWeights = (allWorkouts: WorkoutData[]) => {
    const maxWeights: Record<string, number> = {};

    allWorkouts.forEach((wk) => {
      for (const [exerciseName, sets] of wk.workoutResult.entries()) {
        sets.forEach((set) => {
          const weight = set.weightValue ?? 0;

          if (weight <= 1) {
            return;
          }

          if (
            maxWeights[exerciseName] === undefined ||
            weight > maxWeights[exerciseName]
          ) {
            maxWeights[exerciseName] = weight;
          }
        });
      }
    });

    return maxWeights;
  };

  private GetTonnagePerWorkout = (
    allWorkouts: WorkoutData[],
    allExercises: Exercise[]
  ): TonnagePerWorkout[] => {
    const exerciseMap = new Map(
      allExercises.map((ex) => [ex.ExerciseName, ex.ExerciseMuscleGroup])
    );

    const tonnageByWorkout: TonnagePerWorkout[] = [];

    allWorkouts.forEach((wk) => {
      const tonnageForThisWorkout: Record<string, number> = {};

      for (const [exerciseName, sets] of wk.workoutResult.entries()) {
        const muscleGroup = exerciseMap.get(exerciseName);

        if (!muscleGroup) continue;

        sets.forEach((set) => {
          const weight = set.weightValue ?? 0;
          const reps = set.numberOfreps ?? 0;

          if (weight <= 0 || reps <= 0) return;

          const tonnage = weight * reps;

          tonnageForThisWorkout[muscleGroup] =
            (tonnageForThisWorkout[muscleGroup] || 0) + tonnage;
        });
      }

      tonnageByWorkout.push({
        date: wk.dateOfWorkout,
        tonnage: tonnageForThisWorkout,
      });
    });

    return tonnageByWorkout;
  };

  public GetWeightChangeDynamicsDataByName = async (
    clientName: string,
    exerciseName: string
  ) => {
    const workoutData = await workoutService.GetWeightChangeDynamicsDataByName(
      clientName,
      exerciseName
    );

    return workoutData;
  };
}

export default new StatisticsService();
