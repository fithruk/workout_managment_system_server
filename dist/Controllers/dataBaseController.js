"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataBaseService_1 = __importDefault(require("../Services/dataBaseService"));
class DataBaseController {
    constructor() {
        this.FeedWorkoutsByPersone = async (req, res, next) => {
            try {
                const clients = req.body;
                await dataBaseService_1.default.FeedWorkoutsByPersone(clients);
                res.status(200).send();
            }
            catch (error) {
                next(error);
            }
        };
        this.GetWorkoutesDatesByName = async (req, res, next) => {
            try {
                const { name } = req.params;
                const workoutDates = await dataBaseService_1.default.GetWorkoutesDatesByName(name);
                res.status(200).json({ workoutDates: [...workoutDates] });
            }
            catch (error) {
                next(error);
            }
        };
        this.GetApartAbonementByName = async (req, res, next) => {
            try {
                const { name } = req.params;
                const abonement = await dataBaseService_1.default.GetApartAbonementByName(name);
                res.status(200).json({
                    abonement: abonement ?? {
                        abonementDuration: 0,
                        dateOfCreation: new Date(),
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new DataBaseController();
