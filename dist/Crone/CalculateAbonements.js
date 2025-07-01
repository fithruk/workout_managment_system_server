"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAbonementCron = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const node_cron_1 = __importDefault(require("node-cron"));
const dataBaseService_1 = __importDefault(require("../Services/dataBaseService"));
const processAbonements = async () => {
    const today = (0, dayjs_1.default)();
    const allAbonements = await dataBaseService_1.default.GetAllAbonements();
    for (let index = 0; index < allAbonements.length; index++) {
        const abonement = allAbonements[index];
        if (abonement.abonementDuration <= 0) {
            console.log(`[Пропуск] ${abonement.name}: абонемент уже израсходован (осталось 0 занятий)`);
            continue;
        }
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
        const oldDuration = abonement.abonementDuration;
        abonement.abonementDuration = oldDuration - completedWorkouts;
        await abonement.save();
        console.log(`[Обновлён] ${abonement.name}:\n` +
            ` - Старт абонемента: ${dateOfStartAbonement.format("YYYY-MM-DD")}\n` +
            ` - Прошло дней: ${passedDays}\n` +
            ` - Тренировок в диапазоне: ${completedWorkouts}\n` +
            ` - Было занятий: ${oldDuration}, Осталось: ${abonement.abonementDuration}`);
    }
    console.log("✅ Расчёт абонементов завершён на", today.format("YYYY-MM-DD"));
};
const setupAbonementCron = () => {
    node_cron_1.default.schedule("30 22 * * *", async () => {
        await processAbonements();
    });
};
exports.setupAbonementCron = setupAbonementCron;
