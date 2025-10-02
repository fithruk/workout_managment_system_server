"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("./userService"));
const dataBaseService_1 = __importDefault(require("./dataBaseService"));
const workoutService_1 = __importDefault(require("./workoutService"));
const dayjs_1 = __importDefault(require("dayjs"));
const normalizeName_1 = require("../Helpers/NormalizeName/normalizeName");
class AdminService {
    constructor() {
        this.GetAllClients = async () => {
            return await userService_1.default.GetAllClients();
        };
        this.GetAllTimeClients = async () => {
            return await dataBaseService_1.default.GetAllTimeClients();
        };
        this.GetClientWorkouts = async (name) => {
            return await dataBaseService_1.default.GetWorkoutesDatesByName(name);
        };
        this.CreateNewAbonement = async (name, abonementDuration, dateOfStart) => {
            return await dataBaseService_1.default.CreateNewAbonement(name, abonementDuration, dateOfStart);
        };
        this.GetTimeRangeWorkoutData = async (dateOfRangeStart, dateOfRangeeEnd, clientName) => {
            // const workoutResults = await workoutService.GetWorkoutResultsByRange(
            //   dateOfRangeStart,
            //   dateOfRangeeEnd,
            //   clientName
            // );
            // const workoutPlans = await workoutService.GetWorkoutPlansByRange(
            //   dateOfRangeStart,
            //   dateOfRangeeEnd,
            //   clientName
            // );
            const data = workoutService_1.default.GetCombinedWorkoutDataByRange(dateOfRangeStart, dateOfRangeeEnd, clientName);
            return data;
        };
        this.GetCurrentWorkoutPlan = async (name, date) => {
            return await workoutService_1.default.GetCurrentWorkoutPlan(name, date);
        };
        this.GetTodayClientsAbonements = async (todaysDate) => {
            const [todaysClients, allAbonements] = await Promise.all([
                dataBaseService_1.default.GetClientsByDate(todaysDate),
                dataBaseService_1.default.GetAllAbonements(),
            ]);
            const abonemetsForTable = allAbonements
                .map((ab) => {
                const client = todaysClients.find((cl) => (0, normalizeName_1.normalizeName)(cl.clientName) === (0, normalizeName_1.normalizeName)(ab.name));
                if (!client)
                    return null;
                return {
                    clientName: client.clientName,
                    date: client.date,
                    ...(ab.toObject?.() ?? ab),
                };
            })
                .filter((item) => item !== null);
            return abonemetsForTable;
        };
        this.UpdateAbonements = async (names) => {
            const allAbonements = await dataBaseService_1.default.GetAllAbonements();
            const today = (0, dayjs_1.default)();
            for (let index = 0; index < allAbonements.length; index++) {
                const abonement = allAbonements[index];
                if (!names.includes((0, normalizeName_1.normalizeName)(abonement.name)))
                    continue;
                if (abonement.abonementDuration <= 0) {
                    console.log(`[Пропуск] ${abonement.name}: абонемент уже израсходован (осталось 0 занятий)`);
                    continue;
                }
                abonement.abonementDuration -= 1;
                abonement.dateOfLastActivation = today.toDate();
                const allWorkoutsByName = await dataBaseService_1.default.GetWorkoutesDatesByName(abonement.name);
                const dateOfStartAbonement = (0, dayjs_1.default)(abonement.dateOfCreation);
                const passedDays = today.diff(dateOfStartAbonement, "day");
                const endOfRangeDate = dateOfStartAbonement.add(passedDays, "day");
                const workoutsInDateRange = allWorkoutsByName.filter((date) => {
                    const workoutDate = new Date(date);
                    return (workoutDate >= dateOfStartAbonement.toDate() &&
                        workoutDate <= endOfRangeDate.toDate());
                });
                const completedWorkouts = workoutsInDateRange.length;
                const oldDuration = abonement.abonementDuration + 1;
                await abonement.save();
                console.log(`[Обновлён] ${abonement.name}:\n` +
                    ` - Старт абонемента: ${dateOfStartAbonement.format("YYYY-MM-DD")}\n` +
                    ` - Прошло дней: ${passedDays}\n` +
                    ` - Тренировок в диапазоне: ${completedWorkouts}\n` +
                    ` - Было занятий: ${oldDuration}, Осталось: ${abonement.abonementDuration}`);
            }
            return allAbonements;
        };
        this.GetAllWorkoutPlansForToday = async () => {
            return await workoutService_1.default.GetAllWorkoutPlansForToday();
        };
        this.GetClientsWhoAreTrainingNow = async () => {
            return await workoutService_1.default.GetClientsWhoAreTrainingNow();
        };
        this.GetAllAbonements = async () => {
            return await dataBaseService_1.default.GetAllAbonements();
        };
    }
}
exports.default = new AdminService();
