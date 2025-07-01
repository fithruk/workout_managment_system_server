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
}

export default new AdminService();
