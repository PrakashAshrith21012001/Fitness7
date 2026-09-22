/**
 * Class formats, timetable slots, workouts of the day and the smart-plan
 * questionnaire. Everything the Fitness tab and the class page draw on.
 */

export type MuscleGroup =
  | "chest" | "shoulders" | "biceps" | "triceps" | "forearms" | "abs" | "obliques"
  | "upper-back" | "lower-back" | "lats" | "glutes" | "quads" | "hamstrings" | "calves";

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest: "Chest", shoulders: "Shoulders", biceps: "Biceps", triceps: "Triceps", forearms: "Forearms", abs: "Abs", obliques: "Obliques",
  "upper-back": "Upper back", "lower-back": "Lower back", lats: "Lats", glutes: "Glutes", quads: "Quads", hamstrings: "Hamstrings", calves: "Calves",
};

export type Exercise = {
  id: string;
  name: string;
  /** "3 × 12", "40 s" */
  volume: string;
  muscles: MuscleGroup[];
  cue: string;
};

export type WorkoutBlock = { title: string; exercises: Exercise[] };

/** A day's workout inside a class format: the "Focus for Today". */
export type Workout = {
  id: string;
  focus: string;
  muscles: MuscleGroup[];
  kcal: number;
  blocks: WorkoutBlock[];
};

const ex = (id: string, name: string, volume: string, muscles: MuscleGroup[], cue: string): Exercise => ({ id, name, volume, muscles, cue });

export const workouts: Workout[] = [
  {
    id: "back", focus: "Back", muscles: ["upper-back", "lats", "lower-back", "biceps"], kcal: 400,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("lat-pulldown", "Lat Pulldown", "3 × 12", ["lats", "biceps"], "Elbows down and back, chest up."), ex("seated-row", "Seated Cable Row", "3 × 12", ["upper-back", "lats"], "Squeeze the shoulder blades at the end.")] },
      { title: "Prime", exercises: [ex("bb-row", "Barbell Bent-over Row", "4 × 8", ["upper-back", "lats", "lower-back"], "Hinge at the hips, flat back, bar to the belly."), ex("db-pullover", "DB Pullover", "3 × 12", ["lats", "chest"], "Slight bend in the elbows, stretch at the bottom.")] },
      { title: "Pump", exercises: [ex("face-pull", "Face Pulls", "3 × 15", ["upper-back", "shoulders"], "Pull to the forehead, thumbs back."), ex("superman", "Superman Hold", "3 × 40 s", ["lower-back", "glutes"], "Lift arms and legs together, breathe.")] },
    ],
  },
  {
    id: "arms", focus: "Arms", muscles: ["biceps", "triceps", "forearms"], kcal: 350,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("bb-curl", "BB Biceps Curl", "3 × 12", ["biceps", "forearms"], "Elbows pinned, no swing."), ex("db-tricep-ext", "DB Tricep Extensions", "3 × 12", ["triceps"], "Elbows point to the ceiling.")] },
      { title: "Prime", exercises: [ex("hammer-curl", "DB Hammer Curl", "3 × 10", ["biceps", "forearms"], "Neutral grip, control the way down."), ex("kb-skull", "Lying KB Skull Crusher", "3 × 10", ["triceps"], "Lower to the forehead, press back up.")] },
      { title: "Pump", exercises: [ex("waiter-hold", "BP Waiter's Hold", "3 × 30 s", ["biceps", "forearms"], "Plate flat on the palms, elbows at 90°."), ex("sphinx", "Sphinx Pushups", "3 × 12", ["triceps", "chest"], "Forearms to palms and back.")] },
    ],
  },
  {
    id: "shoulders", focus: "Shoulders", muscles: ["shoulders", "upper-back", "triceps"], kcal: 380,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("ohp", "Overhead Press", "4 × 8", ["shoulders", "triceps"], "Brace the core, bar over the mid-foot."), ex("lateral-raise", "DB Lateral Raise", "3 × 15", ["shoulders"], "Lead with the elbows, stop at shoulder height.")] },
      { title: "Prime", exercises: [ex("arnold", "Arnold Press", "3 × 10", ["shoulders"], "Rotate the palms on the way up."), ex("rear-delt", "Rear Delt Fly", "3 × 15", ["shoulders", "upper-back"], "Hinge, slight elbow bend, squeeze.")] },
      { title: "Pump", exercises: [ex("front-raise", "Plate Front Raise", "3 × 12", ["shoulders"], "To eye level, slow down."), ex("shrug", "DB Shrugs", "3 × 15", ["upper-back"], "Straight up, hold a second.")] },
    ],
  },
  {
    id: "legs", focus: "Legs", muscles: ["quads", "hamstrings", "glutes", "calves"], kcal: 450,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("goblet-squat", "Goblet Squat", "3 × 12", ["quads", "glutes"], "Elbows inside the knees at the bottom."), ex("rdl", "DB Romanian Deadlift", "3 × 12", ["hamstrings", "glutes", "lower-back"], "Push the hips back, bar on the thighs.")] },
      { title: "Prime", exercises: [ex("back-squat", "Barbell Back Squat", "4 × 6", ["quads", "glutes", "hamstrings"], "Brace, sit between the heels, drive."), ex("walking-lunge", "Walking Lunges", "3 × 20", ["quads", "glutes"], "Long steps, torso tall.")] },
      { title: "Pump", exercises: [ex("leg-ext", "Leg Extension", "3 × 15", ["quads"], "Pause at the top."), ex("calf-raise", "Standing Calf Raise", "4 × 15", ["calves"], "Full stretch, full squeeze.")] },
    ],
  },
  {
    id: "chest", focus: "Chest", muscles: ["chest", "triceps", "shoulders"], kcal: 390,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("pushup", "Push-ups", "3 × 15", ["chest", "triceps"], "Elbows at 45°, body a plank."), ex("db-fly", "DB Chest Fly", "3 × 12", ["chest"], "Hug a tree, slight elbow bend.")] },
      { title: "Prime", exercises: [ex("bench", "Barbell Bench Press", "4 × 8", ["chest", "triceps", "shoulders"], "Feet planted, bar to the lower chest."), ex("incline-db", "Incline DB Press", "3 × 10", ["chest", "shoulders"], "30° bench, wrists over elbows.")] },
      { title: "Pump", exercises: [ex("cable-cross", "Cable Crossover", "3 × 15", ["chest"], "Squeeze at the middle."), ex("dips", "Bench Dips", "3 × 12", ["triceps", "chest"], "Shoulders down, elbows back.")] },
    ],
  },
  {
    id: "core", focus: "Core", muscles: ["abs", "obliques", "lower-back", "calves"], kcal: 420,
    blocks: [
      { title: "Dynamic Development", exercises: [ex("plank", "Plank", "3 × 45 s", ["abs", "lower-back"], "Squeeze glutes, breathe."), ex("mountain", "Mountain Climbers", "3 × 40 s", ["abs", "quads"], "Hips low, fast feet.")] },
      { title: "Prime", exercises: [ex("kb-swing", "Kettlebell Swing", "4 × 15", ["glutes", "hamstrings", "abs"], "Hinge, snap the hips."), ex("russian-twist", "Russian Twists", "3 × 30", ["obliques", "abs"], "Chest up, rotate from the ribs.")] },
      { title: "Pump", exercises: [ex("burpee", "Burpees", "3 × 12", ["quads", "chest", "abs"], "Chest to the floor, jump tall."), ex("skip", "Skipping", "3 × 60 s", ["calves"], "Light on the toes.")] },
    ],
  },
];

export const workoutById = (id: string) => workouts.find((w) => w.id === id);
export const exerciseById = (id: string) => {
  for (const w of workouts) for (const b of w.blocks) for (const e of b.exercises) if (e.id === id) return { exercise: e, workout: w, block: b };
  return undefined;
};

/** Which workout a class runs on a given weekday (0 = Sun). */
export function workoutFor(classId: string, weekday: number): Workout {
  const rota: Record<string, string[]> = {
    strength: ["core", "back", "legs", "chest", "shoulders", "arms", "legs"],
    hiit: ["core", "core", "legs", "core", "arms", "core", "legs"],
    crossfit: ["core", "legs", "back", "core", "chest", "shoulders", "core"],
    cardio: ["core", "core", "core", "core", "core", "core", "core"],
    yoga: ["core", "core", "core", "core", "core", "core", "core"],
    ladies: ["core", "legs", "arms", "back", "chest", "legs", "core"],
    personal: ["back", "chest", "legs", "shoulders", "arms", "core", "back"],
    combat: ["core", "arms", "core", "shoulders", "core", "arms", "core"],
  };
  const id = (rota[classId] ?? rota.strength)[weekday] ?? "core";
  return workoutById(id) ?? workouts[0];
}

/* ---------------- timetable ---------------- */

export type ClassSlot = { time: string; /** "06:00" 24 h */ h: number; m: number; capacity: number };
const s = (h: number, m: number, capacity = 20): ClassSlot => ({ time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`, h, m, capacity });

/** Slots per class per weekday index (0 = Sun … 6 = Sat). */
export function slotsFor(classId: string, weekday: number): ClassSlot[] {
  const sun = weekday === 0;
  switch (classId) {
    case "strength": return sun ? [s(6, 0), s(8, 0)] : [s(6, 0), s(7, 0), s(17, 0), s(18, 0), s(19, 0)];
    case "hiit": return sun ? [s(7, 0)] : [s(6, 30), s(19, 0), s(20, 0)];
    case "crossfit": return sun ? [] : [s(19, 0), s(20, 0)];
    case "cardio": return sun ? [s(6, 0), s(8, 0)] : [s(5, 30), s(9, 0), s(17, 0), s(20, 0)];
    case "yoga": return sun ? [s(6, 0)] : [s(6, 0), s(18, 0)];
    case "ladies": return sun ? [] : [s(11, 0), s(12, 0)];
    case "personal": return sun ? [s(7, 0)] : [s(6, 0), s(8, 0), s(17, 0), s(19, 0)];
    case "combat": return sun ? [] : [s(19, 30)];
    default: return [s(6, 0), s(18, 0)];
  }
}

export const CLASS_DURATION_MIN = 50;

export function fmtTime(h: number, m: number) {
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}

export function fmtRange(h: number, m: number, durationMin = CLASS_DURATION_MIN) {
  const end = h * 60 + m + durationMin;
  const eh = Math.floor(end / 60) % 24;
  const em = end % 60;
  return `${fmtTime(h, m)} – ${fmtTime(eh, em)}`;
}

/* ---------------- centre ---------------- */

export const centreFacilities = ["Bike parking", "Cafe", "Lockers", "Showers", "Steam", "AC floor", "Wi-Fi"] as const;

/* ---------------- smart plan questionnaire ---------------- */

export type PlanQuestion = {
  id: "gender" | "age" | "goal" | "experience" | "days" | "focus" | "equipment";
  title: string;
  sub?: string;
  kind: "single" | "number" | "multi";
  options?: { id: string; label: string; sub?: string }[];
  placeholder?: string;
};

export const planQuestions: PlanQuestion[] = [
  { id: "gender", title: "What describes you the best?", kind: "single", options: [{ id: "male", label: "Male" }, { id: "female", label: "Female" }] },
  { id: "age", title: "Your age", sub: "It helps us select the right exercises", kind: "number", placeholder: "Enter your age" },
  { id: "goal", title: "What is your goal?", kind: "single", options: [{ id: "fat-loss", label: "Lose weight", sub: "Burn fat, keep muscle" }, { id: "muscle", label: "Build muscle", sub: "Get stronger, add size" }, { id: "fit", label: "Stay fit", sub: "Feel good every day" }, { id: "trek", label: "Train for a trek", sub: "Legs, lungs, endurance" }] },
  { id: "experience", title: "How long have you been training?", kind: "single", options: [{ id: "new", label: "Just starting" }, { id: "some", label: "Less than a year" }, { id: "regular", label: "1–3 years" }, { id: "pro", label: "3+ years" }] },
  { id: "days", title: "How many days a week can you train?", kind: "single", options: [{ id: "3", label: "3 days" }, { id: "4", label: "4 days" }, { id: "5", label: "5 days" }, { id: "6", label: "6 days" }] },
  { id: "focus", title: "Any area you want to focus on?", sub: "Pick all that apply", kind: "multi", options: [{ id: "arms", label: "Arms" }, { id: "chest", label: "Chest" }, { id: "back", label: "Back" }, { id: "legs", label: "Legs" }, { id: "core", label: "Core" }, { id: "shoulders", label: "Shoulders" }] },
  { id: "equipment", title: "Where will you train?", kind: "single", options: [{ id: "gym", label: "At Fitness 7", sub: "Full floor" }, { id: "home", label: "At home", sub: "Bodyweight + bands" }, { id: "both", label: "Both" }] },
];

export const planCoach = {
  name: "Karthick",
  years: 8,
  creds: ["ACE Certified Personal Trainer", "Strength & Conditioning Level 2"],
  intro: "Hi, I'm here to create a smart workout plan for you. The plan will be personalised based on your preferences. Please help me by answering the following questions. I promise it won't take more than 5 mins.",
};

export type PlanAnswers = Partial<Record<PlanQuestion["id"], string | string[]>>;

/** A week of workouts from the answers — deterministic, so the plan page is stable. */
export function buildPlan(a: PlanAnswers): { title: string; sub: string; days: { day: string; workout: Workout; rest?: boolean }[] } {
  const days = Number(a.days ?? 4);
  const goal = (a.goal as string) ?? "fit";
  const focus = (Array.isArray(a.focus) ? a.focus : []) as string[];
  const order = goal === "fat-loss" ? ["core", "legs", "core", "back", "chest", "core"] : goal === "trek" ? ["legs", "core", "legs", "back", "core", "legs"] : ["chest", "back", "legs", "shoulders", "arms", "core"];
  const picked = [...focus.map((f) => (f === "core" ? "core" : f)), ...order].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, days);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const plan: { day: string; workout: Workout; rest?: boolean }[] = [];
  let k = 0;
  for (let i = 0; i < 7; i++) {
    const train = days >= 6 ? i < 6 : days === 5 ? i !== 2 && i !== 6 : days === 4 ? i % 2 === 0 && i < 7 : i === 0 || i === 2 || i === 4;
    if (train && k < picked.length) plan.push({ day: names[i], workout: workoutById(picked[k++]) ?? workouts[0] });
    else plan.push({ day: names[i], workout: workouts[0], rest: true });
  }
  const goalLabel = { "fat-loss": "Lose weight", muscle: "Build muscle", fit: "Stay fit", trek: "Trek ready" }[goal] ?? "Stay fit";
  return { title: "My Workout Plan", sub: `${goalLabel} · ${days} days`, days: plan };
}
