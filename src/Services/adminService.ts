import userService from "./userService";
import dataBaseService from "./dataBaseService";
import workoutService from "./workoutService";

class AdminService {
  public GetAllClients = async () => {
    return await userService.GetAllClients();
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

    const normalizeName = (name: string): string =>
      name
        .toLowerCase()
        .trim()
        .split(/\s+/) // разбиваем по пробелам (включая лишние)
        .sort()
        .join(" ");

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
}

export default new AdminService();
