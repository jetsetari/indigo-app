// src/data/types/index.ts

/** Auth / registration */
export type RegisterInput = {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  dob?: Date | null;
  language?: string | null;          // 'nl' | 'en' etc.
  gender?: 'male' | 'female' | 'other' | null;
  avatar_url?: string | null;
};

/** DB enums (what the database expects) */
export type MetricSystemDB = 'metric' | 'imperial';   // map from UI values
export type MeasuredBy = 'manual' | 'ai';

/** UI enums (what the app shows) */
export type MetricSystemUI = 'kg/cm' | 'lbs/inches';

/** Public “clients” row */
export type ClientRow = {
  id: number;
  email: string;
  first_name: string;               // NOT NULL in your schema
  last_name: string | null;
  dob: string | null;               // ISO yyyy-mm-dd
  gender: string | null;
  avatar_url: string | null;
  language: string | null;
};

/** Metrics (client_metrics) */
export type ClientMetricsRow = {
  id: number;
  client_id: number;
  metric_system: MetricSystemDB;
  weight: number;
  weight_goal: number;
  height: number;
  fat_percentage: number | null;
  measured_by: MeasuredBy;
  image_front: string | null;
  image_side: string | null;
  image_back: string | null;
};

/** Goals (client_goals) — one row per client */
export type ClientGoalsRow = {
  id: number;
  client_id: number;
  weight_goal: string | null;
  sessions_per_week?: number | null;
  training_days?: string[] | null;  // _text
  training_history?: string | null;
  notes?: string | null;
  training_hours?: number | null;
  competitive?: boolean | null;
  body_analysis?: string | null;
};

export type ClientUpsertInput = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  dob?: Date | null;          // JS Date coming in
  gender?: string | null;
  avatar_url?: string | null;
  language?: string | null;
};