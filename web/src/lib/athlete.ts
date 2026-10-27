/**
 * Which exercise the 3D athlete is doing. Written by the Programs section
 * (the card in view), read by the 3D scene every frame.
 */
export type Exercise = "squat" | "jacks" | "swing" | "run" | "warrior" | "lunge" | "press" | "box";

export const athlete: { exercise: Exercise } = { exercise: "squat" };

/** Programme (class id) → the movement the athlete demonstrates. */
export const EXERCISE_FOR: Record<string, { id: Exercise; label: string }> = {
  strength: { id: "squat", label: "Goblet squat" },
  hiit: { id: "jacks", label: "Jumping jacks" },
  crossfit: { id: "swing", label: "Kettlebell swing" },
  cardio: { id: "run", label: "Running" },
  yoga: { id: "warrior", label: "Warrior II" },
  ladies: { id: "lunge", label: "Dumbbell lunges" },
  personal: { id: "press", label: "Overhead press" },
  combat: { id: "box", label: "Jab–cross" },
};
