"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminService_1 = __importDefault(require("../Services/adminService"));
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
class AdminController {
    constructor() {
        this.GetAllClients = async (req, res, next) => {
            try {
                const clients = await adminService_1.default.GetAllClients();
                res.status(200).json({ users: clients });
            }
            catch (error) {
                next(error);
            }
        };
        this.GetClientWorkouts = async (req, res, next) => {
            try {
                const { name } = req.body;
                const clientsWorkouts = await adminService_1.default.GetClientWorkouts(name);
                res.status(200).json({ clientsWorkouts });
            }
            catch (error) {
                next(error);
            }
        };
        this.CreateNewAbonement = async (req, res, next) => {
            try {
                const { name, abonementDuration, dateOfStart, } = req.body;
                const abonement = await adminService_1.default.CreateNewAbonement(name, abonementDuration, dateOfStart);
                if (!abonement) {
                    throw apiExeption_1.default.BadRequest("Something went wrong while creating new abonement");
                }
                res.status(200).json({ abonement });
            }
            catch (error) {
                next(error);
            }
        };
        this.GetTodayClientsAbonements = async (req, res, next) => {
            try {
                const { todaysDate } = req.body;
                if (isNaN(new Date(todaysDate).getTime())) {
                    console.log("shlyapa");
                }
                const abonements = await adminService_1.default.GetTodayClientsAbonements(new Date(todaysDate));
                res.status(200).json(abonements);
            }
            catch (error) {
                next(error);
            }
        };
        this.UpdateAbonements = async (req, res, next) => {
            try {
                const { names } = req.body;
                const filteredAbonements = await adminService_1.default.UpdateAbonements(names);
                res.status(200).json(filteredAbonements);
            }
            catch (error) {
                next(error);
            }
        };
        this.GetTimeRangeWorkoutData = async (req, res, next) => {
            try {
                const { dateOfRangeStart, dateOfRangeeEnd, clientName, } = req.body;
                const workoutsAndPlans = await adminService_1.default.GetTimeRangeWorkoutData(dateOfRangeStart, dateOfRangeeEnd, clientName);
                res.status(200).json(workoutsAndPlans);
            }
            catch (error) {
                next(error);
            }
        };
        this.GetCurrentWorkoutPlan = async (req, res, next) => {
            try {
                const { name, date } = req.params;
                const currentWorkoutPlan = await adminService_1.default.GetCurrentWorkoutPlan(name, new Date(date));
                res.status(200).json(currentWorkoutPlan?.workoutPlan ?? []);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new AdminController();
