"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workoutsByPersoneModel_1 = __importDefault(require("../Models/workoutsByPersoneModel"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const abonementModel_1 = __importDefault(require("../Models/abonementModel"));
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
                    dateOfCreation: dateOfStart,
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
    }
}
exports.default = new DataBaseService();
