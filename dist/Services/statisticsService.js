"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataBaseService_1 = __importDefault(require("./dataBaseService"));
const workoutService_1 = __importDefault(require("./workoutService"));
class StatisticsService {
    constructor() {
        this.GetCommonSatisticsByName = async (clientName) => {
            const [abonement, workoutDates, allWorkouts] = await Promise.all([
                dataBaseService_1.default.GetApartAbonementByName(clientName),
                dataBaseService_1.default.GetWorkoutesDatesByName(clientName),
                workoutService_1.default.GetAllWorkoutResults(clientName),
            ]);
            const totalReps = allWorkouts.reduce((initial, wk) => {
                wk.workoutResult.forEach((ex) => ex.forEach((set) => (initial += set.numberOfreps)));
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
            ];
            const totalVolumeProgression = [];
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
            const strengthProgression = [];
            allWorkouts.forEach((workout) => {
                const date = new Date(workout.dateOfWorkout);
                workout.workoutResult.forEach((setsArray, exercise) => {
                    if (keyExercises.includes(exercise)) {
                        const validSets = setsArray.filter((set) => set.weightValue >= 4);
                        if (validSets.length > 0) {
                            const totalWeight = validSets.reduce((sum, set) => sum + set.weightValue, 0);
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
}
exports.default = new StatisticsService();
