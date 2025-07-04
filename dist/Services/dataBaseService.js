"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workoutsByPersoneModel_1 = __importDefault(require("../Models/workoutsByPersoneModel"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const abonementModel_1 = __importDefault(require("../Models/abonementModel"));
const dataNormilize_1 = require("../Helpers/DataNormilize/dataNormilize");
const workoutsByPersoneModel_2 = __importDefault(require("../Models/workoutsByPersoneModel"));
const dayjs_1 = __importDefault(require("dayjs"));
class DataBaseService {
    constructor() {
        this.FeedWorkoutsByPersone = async (clients) => {
            await workoutsByPersoneModel_1.default.deleteMany({});
            const newData = Object.entries(clients).map(([name, workoutDates]) => ({
                name,
                workoutDates,
            }));
            await workoutsByPersoneModel_1.default.insertMany(newData);
        };
        this.GetWorkoutesDatesByName = async (name) => {
            const sortedName = name
                .split(" ")
                .sort((a, b) => a.localeCompare(b))
                .join(" ");
            const candidate = await workoutsByPersoneModel_1.default.findOne({
                name: sortedName,
            });
            if (!candidate)
                throw apiExeption_1.default.BadRequest(`That name ${sortedName} does not exist in database`);
            return candidate.workoutDates;
        };
        this.CreateNewAbonement = async (name, abonementDuration, dateOfStart) => {
            const normalizedDate = (0, dataNormilize_1.normalizeToUTCMinute)(dateOfStart);
            const currentAbonement = await abonementModel_1.default.findOne({ name });
            if (currentAbonement) {
                currentAbonement.abonementDuration =
                    +currentAbonement.abonementDuration + +abonementDuration;
                currentAbonement.dateOfCreation = dateOfStart;
                await currentAbonement.save();
                return currentAbonement;
            }
            else {
                const newAbonement = await abonementModel_1.default.create({
                    name,
                    abonementDuration,
                    dateOfCreation: new Date(normalizedDate),
                });
                return newAbonement;
            }
        };
        this.GetAllAbonements = async () => {
            return await abonementModel_1.default.find();
        };
        this.GetApartAbonementByName = async (name) => {
            return (await this.GetAllAbonements()).find((abon) => abon.name == name);
        };
        this.GetClientsByDate = async (date) => {
            const allClients = await workoutsByPersoneModel_2.default.find().lean();
            return allClients
                .filter((client) => {
                const lastDateRaw = client.workoutDates[client.workoutDates.length - 1];
                const lastDate = new Date(lastDateRaw);
                return (0, dayjs_1.default)(lastDate).isSame((0, dayjs_1.default)(date), "day");
            })
                .map((client) => ({
                clientName: client.name,
                date: (0, dayjs_1.default)(new Date(client.workoutDates[client.workoutDates.length - 1])).toDate(),
            }));
        };
    }
}
exports.default = new DataBaseService();
