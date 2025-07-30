"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const statisticsService_1 = __importDefault(require("../Services/statisticsService"));
class StatisticsController {
    constructor() {
        this.GetCommonSatisticsByName = async (req, res, next) => {
            try {
                const { clientName } = req.params;
                const statData = await statisticsService_1.default.GetCommonSatisticsByName(clientName);
                res.status(200).json(statData);
            }
            catch (error) {
                next(error);
            }
        };
        this.GetWeightChangeDynamicsDataByName = async (req, res, next) => {
            try {
                const { clientName, exerciseName } = req.params;
                const statData = await statisticsService_1.default.GetWeightChangeDynamicsDataByName(clientName, exerciseName);
                res.status(200).json(statData);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = new StatisticsController();
