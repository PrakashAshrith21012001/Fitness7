import { today } from "@/state/session";
import { addDays } from "@/state/bookings";

/** Small date helpers shared by the booking, activities, memories and week-progress screens. */

export const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const toDate = (iso: string) => new Date(iso + "T12:00:00");

/** "Tue 22 Sep" */
export const shortDay = (iso: string) => {
  const d = toDate(iso);
  return `${DAY[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
};

/** "22 Sep" */
export const dayMonth = (iso: string) => {
  const d = toDate(iso);
  return `${d.getDate()} ${MON[d.getMonth()]}`;
};

/** "21 SEP" */
export const dayMonthCaps = (iso: string) => dayMonth(iso).toUpperCase();

/** "Sep 2026" */
export const monthYear = (iso: string) => {
  const d = toDate(iso);
  return `${MON[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Today" / "Yesterday" / "20 Sep" */
export const relativeLabel = (iso: string) => {
  const t = today();
  if (iso === t) return "Today";
  if (iso === addDays(t, -1)) return "Yesterday";
  return dayMonth(iso);
};

/** "8:00 PM" from "20:00" */
export const clock = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
};

/** "8 PM" from "20:00" */
export const clockShort = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${ap}` : `${hh} ${ap}`;
};

export const CENTRE = "Fitness 7 TS Square";
