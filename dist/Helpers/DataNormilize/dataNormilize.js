"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeToUTCMinute = normalizeToUTCMinute;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
function normalizeToUTCMinute(date) {
    return (0, dayjs_1.default)(date).utc().second(0).millisecond(0).toDate();
}
