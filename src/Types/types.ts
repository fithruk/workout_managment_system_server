export type RegistrationDataTypes = {
  contactInfo: {
    email: string;
    name: string;
    password: string;
    phone: string;
  };
  healthData: {
    chronicDiseases?: string;
    injuries?: string;
    workoutExperience?: string;
  };
};

export type WorkoutsByPersoneTypes = {
  name: string;
  workoutsDates: Date[];
};

export type ExerciseType = {
  musclesGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
};

export type WorkoutPlanType = {
  dateOfWorkout: Date;
  clientName: string;
  workoutPlan: ExerciseType[];
};

export type OneSet = Partial<{
  numberOfSet: number;
  numberOfreps: number;
  weightValue: number;
}>;

export type SetsAndValuesResults = {
  [exerciseName: string]: OneSet[];
};
