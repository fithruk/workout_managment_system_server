import exerciseModel from "../Models/exerciseModel";

class ExerciseService {
  public GetAllExercises = async () => {
    return await exerciseModel.find();
  };

  public GetExercisesByPlan = async (exercises: string[]) => {
    return await exerciseModel.find({
      ExerciseName: {
        $in: exercises.map((ex) => new RegExp(`^${ex}$`, "i")),
      },
    });
  };
}

export default new ExerciseService();
