// src/data/types/index.ts
export type LoginForm = {
  email: string;
  password: string;
};

// type RegistrationForm = {
//   avatarUrl: string | null;
//   firstName: string;
//   lastName: string;
//   dob?: Date | null;
//   gender?: 'male' | 'female' | 'other' | null;
//   email: string;
//   password: string;
//   agreed: boolean;
//   language?: string | null;
// };

/** Public “clients” row */
export type ClientRow = {
  id: number;
  email: string;
  firstName: string;               // NOT NULL in your schema
  lastName: string | null;
  dob: string | null;               // ISO yyyy-mm-dd
  gender: string | null;
  avatarUrl: string | null;
  language: string | null;
  trainingDays: string[] | null;
  createdAt: string;
  metricSystem?: string;
  lastWeight?:number;
  desiredWeight?:number;
  height?:number;
  eatingHabits?:string;
  mealsPerDay?:any;
  dailyKcalIntake?:number;
  weightGoals?:any;
  performanceGoals?:any;
  sportGoals?:any;
  groupExperience?:any;
  trainingExperience?:any;
  trainingHours?:any;
  supplements?:any;
  notes?:string;
};

export type MeasurementRow = {
  clientId: number;
  date?: string;
  weight?: number | null;
  bodyfat?: number | null;
  pictureFront?: string | null;
  pictureSide?: string | null;
  pictureBack?: string | null;
  measurementType?: 'manual' | 'ai';
  checklist?: string[] | null;
};

export type ClientGoalsRow = {
  weightGoals: string[];
  performanceGoals: string[];
  sportGoals: string[];
};




/** ---------- Types returned to the app ---------- */
export type MuscleGroup = {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
};

export type Exercise = {
  id: number;
  name: string;
  description: string | null;
  type: string | null;
  level: number | null;
  tags: string[] | null;
  cover: string | null;
  video: string | null;
  muscleGroup?: MuscleGroup | null;
};

export type WorkoutItem = {
  id: number;
  dayId: number;
  position: number;
  supersetLabel: string | null;
  exerciseId: number | null;
  sets: number | null;
  reps: string | null;       // text in DB (e.g., "8–10" or "10,10,8,8")
  weight: number | null;
  restSeconds: number | null;
  notes: string | null;
  exercise?: Exercise | null;
};

export type WorkoutDay = {
  id: number;
  weekId: number;
  dayIndex: number;
  title: string | null;
  items: WorkoutItem[];
};

export type WorkoutWeek = {
  id: number;
  programId: number;
  weekIndex: number;
  createdAt: string | null;
  days: WorkoutDay[];
};

export type WorkoutProgram = {
  id: number;
  title: string;
  createdByEmail: string | null;
  createdAt: string | null;
  sourceProgramId: number | null;
  weeks: WorkoutWeek[];
};
