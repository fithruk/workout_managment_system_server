import dataBaseService from "./dataBaseService";
import workoutService from "./workoutService";

class StatisticsService {
  public GetCommonSatisticsByName = async (clientName: string) => {
    const [abonement, workoutDates, allWorkouts] = await Promise.all([
      dataBaseService.GetApartAbonementByName(clientName),
      dataBaseService.GetWorkoutesDatesByName(clientName),
      workoutService.GetAllWorkoutResults(clientName),
    ]);
    const totalReps = allWorkouts.reduce((initial, wk) => {
      wk.workoutResult.forEach((ex) =>
        ex.forEach((set) => (initial += set.numberOfreps))
      );
      return initial;
    }, 0);

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
    ];

    type VolumeEntry = { date: Date; totalVolume: number };

    const totalVolumeProgression: VolumeEntry[] = [];

    allWorkouts.forEach((workout) => {
      const date = new Date(workout.dateOfWorkout);

      let totalVolume = 0;

      workout.workoutResult.forEach((setsArray) => {
        setsArray.forEach((set) => {
          if (set.weightValue >= 4) {
            totalVolume += set.weightValue * set.numberOfreps;
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
          const validSets = setsArray.filter((set) => set.weightValue >= 4);

          if (validSets.length > 0) {
            const totalWeight = validSets.reduce(
              (sum: number, set) => sum + set.weightValue,
              0
            );
            const avgWeight = totalWeight / validSets.length;

            strengthProgression.push({
              exercise,
              date,
              averageWeight: avgWeight,
            });
          }
        }
      });
    });

    strengthProgression.sort((a, b) => a.date.getTime() - b.date.getTime());
    console.log(abonement);

    return {
      abonement,
      totalWorkouts: allWorkouts.length,
      totalReps,
      strengthProgression,
    };
  };
}

export default new StatisticsService();
