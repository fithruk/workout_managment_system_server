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

type WorkoutResultType = Map<string, OneSet[]>;

export type WorkoutData = {
  clientName: string;
  dateOfWorkout: Date;
  workoutResult: WorkoutResultType;
};

interface ExerciseStepDescription {
  PhaseKey: number;
  PhaseName: "prepearing" | "processing" | "technicalTips";
  Instructions: string[];
}

interface ExerciseStep {
  StepNameEng: string;
  StepNameRu: string;
  StepNameUa: string;
  DescriptionsRu: ExerciseStepDescription[];
  DescriptionsUa: ExerciseStepDescription[];
}

export interface Exercise {
  ExerciseName: string;
  ExerciseMuscleGroup: string;
  Equipment: string;
  Difficulty: "easy" | "medium" | "hard";
  ImageUrl: string;
  Steps: ExerciseStep[];
}

export type SocketMessageType = { name: string; msg: string };

export enum SocketEventsEnum {
  getClientWhoAreTrainingNow = "getClientWhoAreTrainingNow",
  clientDisconnected = "clientDisconnected",
  newClientConnected = "newClientConnected",
  updateWorkout = "updateWorkout",
  sendUpdatedWorkoutToAdmin = "sendUpdatedWorkoutToAdmin",
}

export type SoketUpdateWorkoutType = {
  name: string;
  date: string;
  workoutResult: SetsAndValuesResults;
};
