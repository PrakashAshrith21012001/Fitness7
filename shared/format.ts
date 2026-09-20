const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];

/**
 * Indian digit grouping, written out rather than delegated to Intl.
 *
 * `toLocaleString("en-IN")` is not guaranteed to agree between Node's ICU
 * build and a browser's, and a server/client disagreement inside prerendered
 * markup is a hydration mismatch. Doing the grouping ourselves keeps the two
 * identical everywhere.
 */
export function groupIndian(n: number): string {
  const neg = n < 0;
  const digits = Math.abs(Math.round(n)).toString();
  let out: string;

  if (digits.length <= 3) {
    out = digits;
  } else {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3);
    out = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
  }
  return neg ? `-${out}` : out;
}

export function inr(amount: number) {
  return `\u20B9${groupIndian(amount)}`;
}

/** Parses "YYYY-MM-DD" as a plain calendar date, with no timezone shift. */
function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

export function shortDate(iso: string) {
  const { m, d } = parts(iso);
  return `${d} ${MONTHS[m].slice(0, 3)}`;
}

export function longDate(iso: string) {
  const { y, m, d, weekday } = parts(iso);
  return `${DAYS[weekday]}, ${d} ${MONTHS[m]} ${y}`;
}

export function monthYear(iso: string) {
  const { y, m } = parts(iso);
  return `${MONTHS[m]} ${y}`;
}

export function daysUntil(iso: string, from: Date = new Date()) {
  const { y, m, d } = parts(iso);
  const target = Date.UTC(y, m, d);
  const today = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.max(0, Math.round((target - today) / 86_400_000));
}
