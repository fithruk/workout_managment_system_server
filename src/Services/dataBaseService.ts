import { WorkoutsByPersoneTypes } from "../Types/types";
import WorkoutsByPersoneModel from "../Models/workoutsByPersoneModel";
import ApiError from "../Exeptions/apiExeption";
import AbonementModel from "../Models/abonementModel";
import { normalizeToUTCMinute } from "../Helpers/DataNormilize/dataNormilize";
import workoutsByPersoneModel from "../Models/workoutsByPersoneModel";
import dayjs from "dayjs";

class DataBaseService {
  public FeedWorkoutsByPersone = async (clients: WorkoutsByPersoneTypes) => {
    await WorkoutsByPersoneModel.deleteMany({});
    const newData = Object.entries(clients).map(([name, workoutDates]) => ({
      name,
      workoutDates,
    }));

    await WorkoutsByPersoneModel.insertMany(newData);
  };

  public GetAllTimeClients = async () => {
    return await WorkoutsByPersoneModel.find();
  };

  public GetWorkoutesDatesByName = async (name: string) => {
    const sortedName = name
      .split(" ")
      .sort((a, b) => a.localeCompare(b))
      .join(" ");

    const candidate = await WorkoutsByPersoneModel.findOne({
      name: sortedName,
    });

    if (!candidate)
      throw ApiError.BadRequest(
        `That name ${sortedName} does not exist in database`
      );
    return candidate.workoutDates;
  };

  public CreateNewAbonement = async (
    name: string,
    abonementDuration: number,
    dateOfStart: Date
  ) => {
    const normalizedDate = normalizeToUTCMinute(dateOfStart);

    const currentAbonement = await AbonementModel.findOne({ name });
    if (currentAbonement) {
      currentAbonement.abonementDuration =
        +currentAbonement.abonementDuration + +abonementDuration;
      currentAbonement.dateOfCreation = dateOfStart;
      await currentAbonement.save();
      return currentAbonement;
    } else {
      const newAbonement = await AbonementModel.create({
        name,
        abonementDuration,
        dateOfCreation: new Date(normalizedDate),
      });
      return newAbonement;
    }
  };

  public GetAllAbonements = async () => {
    return await AbonementModel.find();
  };

  public GetApartAbonementByName = async (name: string) => {
    return (await this.GetAllAbonements()).find((abon) => abon.name == name);
  };

  public GetClientsByDate = async (date: Date) => {
    const allClients = await workoutsByPersoneModel.find().lean();

    return allClients
      .filter((client) => {
        return client.workoutDates.some((day) =>
          dayjs((day as any)?.toString()).isSame(dayjs(date), "day")
        );
      })
      .map((client) => ({
        clientName: client.name,
        date: dayjs(
          client.workoutDates
            .find((day) =>
              dayjs((day as any)?.toString()).isSame(dayjs(date), "day")
            )
            ?.toString()
        ).toDate(),
      }));
  };
}

export default new DataBaseService();
