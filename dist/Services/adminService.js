"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("./userService"));
const dataBaseService_1 = __importDefault(require("./dataBaseService"));
const workoutService_1 = __importDefault(require("./workoutService"));
class AdminService {
    constructor() {
        this.GetAllClients = async () => {
            return await userService_1.default.GetAllClients();
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
            const normalizeName = (name) => name
                .toLowerCase()
                .trim()
                .split(/\s+/) // разбиваем по пробелам (включая лишние)
                .sort()
                .join(" ");
            const abonemetsForTable = allAbonements
                .map((ab) => {
                const client = todaysClients.find((cl) => normalizeName(cl.clientName) === normalizeName(ab.name));
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
    }
}
exports.default = new AdminService();
