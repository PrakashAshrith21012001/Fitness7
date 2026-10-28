/**
 * Which exercise the 3D athlete is doing. Written by the Programs section
 * (the card in view), read by the 3D scene every frame. The scene writes the
 * live joint angle back (`angle`, degrees) so the panel can print it without
 * re-rendering React 60 times a second.
 */
export type Exercise = "squat" | "jacks" | "swing" | "run" | "warrior" | "lunge" | "row" | "box";

export const athlete: { exercise: Exercise; angle: number } = { exercise: "squat", angle: 180 };

export type Muscle = "pecs" | "abs" | "obliques" | "delts" | "biceps" | "triceps" | "forearms" | "lats" | "traps" | "glutes" | "quads" | "hams" | "calves";

/** Joints the form line can be drawn through (the side nearer the camera). */
export type Joint = "shoulder" | "elbow" | "wrist" | "hip" | "knee" | "ankle" | "neck";

export type Move = {
  id: Exercise;
  label: string;
  /** muscles that light up */
  muscles: Muscle[];
  /** short human list for the panel */
  works: string;
  /** form line: a → pivot → b; the angle is measured at the pivot */
  form: [Joint, Joint, Joint];
  /** which side's joints the form line uses: 0 = left, 1 = right (default: the leading/near side) */
  formSide?: 0 | 1;
  formLabel: string;
};

/** Programme (class id) → the movement the athlete demonstrates. */
export const EXERCISE_FOR: Record<string, Move> = {
  strength: { id: "squat", label: "Goblet squat", muscles: ["quads", "glutes", "abs"], works: "Quads · Glutes · Core", form: ["hip", "knee", "ankle"], formLabel: "Knee" },
  hiit: { id: "jacks", label: "Jumping jacks", muscles: ["delts", "calves", "quads", "abs"], works: "Shoulders · Calves · Legs", form: ["wrist", "shoulder", "hip"], formLabel: "Shoulder" },
  crossfit: { id: "swing", label: "Kettlebell swing", muscles: ["glutes", "hams", "lats", "abs"], works: "Glutes · Hamstrings · Back", form: ["neck", "hip", "knee"], formLabel: "Hip hinge" },
  cardio: { id: "run", label: "Running", muscles: ["quads", "hams", "calves", "glutes"], works: "Legs · Calves · Lungs", form: ["hip", "knee", "ankle"], formLabel: "Knee" },
  yoga: { id: "warrior", label: "Warrior II", muscles: ["quads", "delts", "obliques"], works: "Legs · Shoulders · Balance", form: ["hip", "knee", "ankle"], formLabel: "Front knee" },
  ladies: { id: "lunge", label: "Dumbbell lunges", muscles: ["quads", "glutes", "hams", "forearms"], works: "Quads · Glutes · Grip", form: ["hip", "knee", "ankle"], formLabel: "Knee" },
  personal: { id: "row", label: "One-arm dumbbell row", muscles: ["lats", "biceps", "delts"], works: "Lats · Rear delts · Biceps", form: ["shoulder", "elbow", "wrist"], formSide: 1, formLabel: "Elbow" },
  combat: { id: "box", label: "Jab–cross", muscles: ["delts", "triceps", "obliques"], works: "Shoulders · Triceps · Core", form: ["shoulder", "elbow", "wrist"], formLabel: "Elbow" },
};

export const MOVE_BY_EXERCISE = Object.fromEntries(Object.values(EXERCISE_FOR).map((m) => [m.id, m])) as Record<Exercise, Move>;
