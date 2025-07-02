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
        const lastDateRaw = client.workoutDates[client.workoutDates.length - 1];
        const lastDate = new Date(lastDateRaw as unknown as Date);

        return dayjs(lastDate).isSame(dayjs(date), "day");
      })
      .map((client) => ({
        clientName: client.name,
        date: dayjs(
          new Date(
            client.workoutDates[
              client.workoutDates.length - 1
            ] as unknown as Date
          )
        ).toDate(),
      }));
  };
}

export default new DataBaseService();
