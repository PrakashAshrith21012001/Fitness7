import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlanAnswers } from "@f7/content";

/** The smart-plan answers live in AsyncStorage under one key; the result page reads them back. */
export const PLAN_KEY = "f7-plan-answers";

export async function loadPlanAnswers(): Promise<PlanAnswers | null> {
  try {
    const v = await AsyncStorage.getItem(PLAN_KEY);
    return v ? (JSON.parse(v) as PlanAnswers) : null;
  } catch {
    return null;
  }
}

export async function savePlanAnswers(a: PlanAnswers) {
  await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(a)).catch(() => {});
}

export async function clearPlanAnswers() {
  await AsyncStorage.removeItem(PLAN_KEY).catch(() => {});
}

/** every question answered? */
export function planComplete(a: PlanAnswers | null, ids: string[]) {
  if (!a) return false;
  return ids.every((id) => {
    const v = a[id as keyof PlanAnswers];
    return Array.isArray(v) ? v.length > 0 : !!v;
  });
}
