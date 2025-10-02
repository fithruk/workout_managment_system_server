import userService from "./userService";
import dataBaseService from "./dataBaseService";
import workoutService from "./workoutService";
import dayjs from "dayjs";
import { normalizeName } from "../Helpers/NormalizeName/normalizeName";

class AdminService {
  public GetAllClients = async () => {
    return await userService.GetAllClients();
  };

  public GetAllTimeClients = async () => {
    return await dataBaseService.GetAllTimeClients();
  };

  public GetClientWorkouts = async (name: string) => {
    return await dataBaseService.GetWorkoutesDatesByName(name);
  };

  public CreateNewAbonement = async (
    name: string,
    abonementDuration: number,
    dateOfStart: Date
  ) => {
    return await dataBaseService.CreateNewAbonement(
      name,
      abonementDuration,
      dateOfStart
    );
  };

  public GetTimeRangeWorkoutData = async (
    dateOfRangeStart: Date,
    dateOfRangeeEnd: Date,
    clientName: string
  ) => {
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

    const data = workoutService.GetCombinedWorkoutDataByRange(
      dateOfRangeStart,
      dateOfRangeeEnd,
      clientName
    );

    return data;
  };

  public GetCurrentWorkoutPlan = async (name: string, date: Date) => {
    return await workoutService.GetCurrentWorkoutPlan(name, date);
  };

  public GetTodayClientsAbonements = async (todaysDate: Date) => {
    const [todaysClients, allAbonements] = await Promise.all([
      dataBaseService.GetClientsByDate(todaysDate),
      dataBaseService.GetAllAbonements(),
    ]);

    const abonemetsForTable = allAbonements
      .map((ab) => {
        const client = todaysClients.find(
          (cl) => normalizeName(cl.clientName) === normalizeName(ab.name)
        );
        if (!client) return null;

        return {
          clientName: client.clientName,
          date: client.date,
          ...(ab.toObject?.() ?? ab),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return abonemetsForTable;
  };

  public UpdateAbonements = async (names: string[]) => {
    const allAbonements = await dataBaseService.GetAllAbonements();
    const today = dayjs();

    for (let index = 0; index < allAbonements.length; index++) {
      const abonement = allAbonements[index];

      if (!names.includes(normalizeName(abonement.name))) continue;

      if (abonement.abonementDuration <= 0) {
        console.log(
          `[Пропуск] ${abonement.name}: абонемент уже израсходован (осталось 0 занятий)`
        );
        continue;
      }

      abonement.abonementDuration -= 1;
      abonement.dateOfLastActivation = today.toDate();

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
      const oldDuration = abonement.abonementDuration + 1;
      await abonement.save();

      console.log(
        `[Обновлён] ${abonement.name}:\n` +
          ` - Старт абонемента: ${dateOfStartAbonement.format(
            "YYYY-MM-DD"
          )}\n` +
          ` - Прошло дней: ${passedDays}\n` +
          ` - Тренировок в диапазоне: ${completedWorkouts}\n` +
          ` - Было занятий: ${oldDuration}, Осталось: ${abonement.abonementDuration}`
      );
    }

    return allAbonements;
  };

  public GetAllWorkoutPlansForToday = async () => {
    return await workoutService.GetAllWorkoutPlansForToday();
  };

  public GetClientsWhoAreTrainingNow = async () => {
    return await workoutService.GetClientsWhoAreTrainingNow();
  };

  public GetAllAbonements = async () => {
    return await dataBaseService.GetAllAbonements();
  };
}

export default new AdminService();
