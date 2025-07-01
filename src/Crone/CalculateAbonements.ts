import dayjs from "dayjs";
import nodeCron from "node-cron";
import dataBaseService from "../Services/dataBaseService";

const processAbonements = async () => {
  const today = dayjs();
  const allAbonements = await dataBaseService.GetAllAbonements();

  for (let index = 0; index < allAbonements.length; index++) {
    const abonement = allAbonements[index];

    if (abonement.abonementDuration <= 0) {
      console.log(
        `[Пропуск] ${abonement.name}: абонемент уже израсходован (осталось 0 занятий)`
      );
      continue;
    }

    const allWorkoutsByName = await dataBaseService.GetWorkoutesDatesByName(
      abonement.name
    );

    const dateOfStartAbonement = dayjs(abonement.dateOfCreation);
    const passedDays = today.diff(dateOfStartAbonement, "day");
    const endOfRangeDate = dateOfStartAbonement.add(passedDays, "day");

    const workoutsInDateRange = allWorkoutsByName.filter((date) => {
      const workoutDate = new Date(date as unknown as Date);
      return (
        workoutDate >= dateOfStartAbonement.toDate() &&
        workoutDate <= endOfRangeDate.toDate()
      );
    });

    const completedWorkouts = workoutsInDateRange.length;
    const oldDuration = abonement.abonementDuration;
    abonement.abonementDuration = oldDuration - completedWorkouts;

    await abonement.save();

    console.log(
      `[Обновлён] ${abonement.name}:\n` +
        ` - Старт абонемента: ${dateOfStartAbonement.format("YYYY-MM-DD")}\n` +
        ` - Прошло дней: ${passedDays}\n` +
        ` - Тренировок в диапазоне: ${completedWorkouts}\n` +
        ` - Было занятий: ${oldDuration}, Осталось: ${abonement.abonementDuration}`
    );
  }

  console.log("✅ Расчёт абонементов завершён на", today.format("YYYY-MM-DD"));
};

const setupAbonementCron = () => {
  nodeCron.schedule("30 22 * * *", async () => {
    await processAbonements();
  });
};
export { setupAbonementCron };
