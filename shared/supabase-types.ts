/**
 * Row shapes for the Supabase tables in supabase/schema.sql.
 * Hand-written on purpose (no codegen step) — keep in step with the SQL.
 */

export type MemberRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  provider: "phone" | "google" | "apple" | "email";
  goal: "strength" | "fat-loss" | "trek" | "general" | null;
  slot: "early" | "morning" | "ladies" | "evening" | null;
  plan_id: string | null;
  plan_name: string | null;
  renews_on: string | null;
  joined_on: string;
  onboarded: boolean;
  treks_done: number;
  height_cm: number | null;
  age: number | null;
  sex: "male" | "female" | null;
  activity: "gym3" | "gym5" | "trek" | null;
  hide_calories: boolean;
  water_goal_ml: number | null;
  glass_ml: number;
  created_at: string;
  updated_at: string;
};

export type NotificationPrefsRow = {
  member_id: string;
  classes: boolean;
  treks: boolean;
  renewals: boolean;
  meals: boolean;
  water: boolean;
};

export type CheckinRow = { member_id: string; date: string; created_at?: string };
export type WeightRow = { member_id: string; date: string; kg: number };
export type ClassFollowRow = { member_id: string; class_id: string };
export type TrekReservationRow = { member_id: string; trek_id: string; status: "held" | "confirmed" | "cancelled" };

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  interest: string | null;
  message: string | null;
  source: "website" | "app";
  created_at: string;
};

export type MealSlot = "breakfast" | "lunch" | "snacks" | "dinner";
export type FoodSource = "table" | "model" | "photo";

export type FoodLogRow = {
  id: string;
  member_id: string;
  date: string;
  meal: MealSlot;
  name: string;
  food_id: string | null;
  grams: number;
  portion_label: string | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: number;
  source: FoodSource;
  logged_at: string;
  deleted_at: string | null;
};

export type ApiUsageRow = {
  member_id: string;
  date: string;
  kind: "food_text" | "food_photo";
  count: number;
  input_tokens: number;
  output_tokens: number;
};

export type WaterLogRow = { member_id: string; date: string; ml: number; updated_at?: string };

export type ActivityLogRow = {
  id: string;
  member_id: string;
  date: string;
  activity_id: string;
  name: string;
  minutes: number;
  kcal: number;
  logged_at: string;
  deleted_at: string | null;
};

/* ---------------- admin (migration 003) ---------------- */

export type StaffRole = "owner" | "admin" | "coach";
export type StaffRow = { user_id: string; name: string; email: string; role: StaffRole; active: boolean; created_at: string };

export type TrekStatus = "draft" | "published" | "cancelled";
export type TrekRow = {
  id: string;
  title: string;
  location: string;
  date: string;
  duration_text: string;
  meeting_point: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  distance_km: number;
  altitude_m: number;
  price_inr: number;
  member_price_inr: number;
  slots_total: number;
  summary: string;
  highlights: string[];
  includes: string[];
  cover_url: string | null;
  gallery: string[];
  status: TrekStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  starts_on: string;
  ends_on: string;
  audience: "app" | "site" | "both";
  link_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type LeadStatus = "new" | "contacted" | "joined" | "lost";
export type MemberNoteRow = { id: string; member_id: string; author: string | null; author_name: string; body: string; created_at: string };

export type AdminMemberSummary = {
  id: string; name: string; phone: string | null; email: string | null; goal: string | null; slot: string | null;
  plan_id: string | null; plan_name: string | null; renews_on: string | null; joined_on: string; onboarded: boolean;
  last_checkin: string | null; checkin_count: number; checkins_30d: number; latest_kg: number | null; last_food: string | null;
};
