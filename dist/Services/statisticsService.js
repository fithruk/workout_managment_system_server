"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataBaseService_1 = __importDefault(require("./dataBaseService"));
const workoutService_1 = __importDefault(require("./workoutService"));
const exerciseService_1 = __importDefault(require("./exerciseService"));
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
class StatisticsService {
    constructor() {
        this.GetStrengthProgression = (allWorkouts) => {
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
                                averageWeight: +avgWeight.toFixed(1),
                            });
                        }
                    }
                });
            });
            return strengthProgression.sort((a, b) => a.date.getTime() - b.date.getTime());
        };
        this.GetFrequentMuscleGroups = (allWorkouts, allExercises) => {
            if (!allWorkouts.length)
                return;
            const groups = {
                arm: 0,
                back: 0,
                chest: 0,
                leg: 0,
                abs: 0,
                shoulder: 0,
            };
            let allSets = 0;
            const exerciseMap = new Map(allExercises.map((ex) => [ex.ExerciseName, ex.ExerciseMuscleGroup]));
            allWorkouts.forEach((wk) => {
                for (const exerciseName of wk.workoutResult.keys()) {
                    const muscleGroup = exerciseMap.get(exerciseName);
                    if (muscleGroup) {
                        groups[muscleGroup] = (groups[muscleGroup] || 0) + 1;
                        allSets += 1;
                    }
                }
            });
            const percentages = {};
            for (const [muscleGroup, count] of Object.entries(groups)) {
                percentages[muscleGroup] = +((count / allSets) * 100).toFixed(1);
            }
            return percentages;
        };
        this.GetMaxWeights = (allWorkouts) => {
            const maxWeights = {};
            allWorkouts.forEach((wk) => {
                for (const [exerciseName, sets] of wk.workoutResult.entries()) {
                    sets.forEach((set) => {
                        const weight = set.weightValue ?? 0;
                        if (weight <= 1) {
                            return;
                        }
                        if (maxWeights[exerciseName] === undefined ||
                            weight > maxWeights[exerciseName]) {
                            maxWeights[exerciseName] = weight;
                        }
                    });
                }
            });
            return maxWeights;
        };
        this.GetTonnagePerWorkout = (allWorkouts, allExercises) => {
            const exerciseMap = new Map(allExercises.map((ex) => [ex.ExerciseName, ex.ExerciseMuscleGroup]));
            const tonnageByWorkout = [];
            allWorkouts.forEach((wk) => {
                const tonnageForThisWorkout = {};
                for (const [exerciseName, sets] of wk.workoutResult.entries()) {
                    const muscleGroup = exerciseMap.get(exerciseName);
                    if (!muscleGroup)
                        continue;
                    sets.forEach((set) => {
                        const weight = set.weightValue ?? 0;
                        const reps = set.numberOfreps ?? 0;
                        if (weight <= 0 || reps <= 0)
                            return;
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
        this.GetWeightChangeDynamicsDataByName = async (clientName, exerciseName) => {
            const workoutData = await workoutService_1.default.GetWeightChangeDynamicsDataByName(clientName, exerciseName);
            return workoutData;
        };
        this.GetCommonSatisticsByName = async (clientName) => {
            const [abonement, workoutDates, allWorkouts, allExercises] = await Promise.all([
                dataBaseService_1.default.GetApartAbonementByName(clientName),
                dataBaseService_1.default.GetWorkoutesDatesByName(clientName),
                workoutService_1.default.GetAllWorkoutResults(clientName),
                exerciseService_1.default.GetAllExercises(),
            ]);
            const totalReps = allWorkouts.reduce((initial, wk) => {
                wk.workoutResult.forEach((ex) => ex.forEach((set) => (initial += set.numberOfreps)));
                return initial;
            }, 0);
            const strengthProgression = this.GetStrengthProgression(allWorkouts);
            const frequentMuscleGroups = this.GetFrequentMuscleGroups(allWorkouts, allExercises);
            const maxWeights = this.GetMaxWeights(allWorkouts);
            const tonnagePerWorkout = this.GetTonnagePerWorkout(allWorkouts, allExercises);
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
        this.GetProgressStatisticsbyCurrentAbon = async (clientName, lastWorkoutsRange) => {
            const allWorkout = await workoutService_1.default.GetAllWorkoutResults(clientName);
            // const maxWeights = this.GetMaxWeights(allWorkout);
            const start = allWorkout.length >= lastWorkoutsRange + 3
                ? allWorkout.length - lastWorkoutsRange + 3
                : 0;
            const workoutsInRange = allWorkout.slice(start);
            const calcStats = (sets, date) => {
                const totalReps = sets.reduce((acc, s) => acc + s.numberOfreps, 0);
                const totalWeight = sets.reduce((acc, s) => acc + s.weightValue, 0);
                const tonnage = sets.reduce((acc, s) => acc + s.weightValue * s.numberOfreps, 0);
                return {
                    date,
                    maxWeight: Math.max(...sets.map((s) => s.weightValue)),
                    avgWeight: +(totalWeight / sets.length).toFixed(1),
                    avgReps: +(totalReps / sets.length).toFixed(1),
                    tonnage,
                };
            };
            const buildExerciseDynamics = (workoutsInRange) => {
                const result = {};
                for (const wk of workoutsInRange) {
                    const date = new Date(wk.dateOfWorkout).toISOString().split("T")[0];
                    for (const [exercise, sets] of wk.workoutResult.entries()) {
                        const stats = calcStats(sets, date);
                        if (!result[exercise]) {
                            result[exercise] = [];
                        }
                        result[exercise].push(stats);
                    }
                }
                return result;
            };
            const dynamics = buildExerciseDynamics(workoutsInRange);
            return dynamics;
        };
    }
}
exports.default = new StatisticsService();
