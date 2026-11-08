/* Run: npx tsx web/scripts/billing.test.ts — checks the date maths and stages behind renewals. */
import assert from "node:assert/strict";
import { endFor, renewalStart, stageOf, stepFor, normalizePhone, daysBetween, reminderText, receiptText } from "../src/lib/billing";

let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; };

t("end dates", () => {
  assert.equal(endFor("2026-11-08", 1), "2026-12-07");
  assert.equal(endFor("2026-11-08", 3), "2027-02-07");
  assert.equal(endFor("2026-11-08", 12), "2027-11-07");
  assert.equal(endFor("2027-01-31", 1), "2027-02-28"); // shorter month → its last day
  assert.equal(endFor("2027-01-28", 1), "2027-02-27");
  assert.equal(endFor("2028-01-31", 1), "2028-02-29"); // leap year
  assert.equal(endFor("2026-11-30", 3), "2027-02-28");
  assert.equal(endFor("2026-12-01", 1), "2026-12-31");
});
t("renewal start", () => {
  assert.equal(renewalStart("2026-11-20", "2026-11-08"), "2026-11-21"); // still active → continue
  assert.equal(renewalStart("2026-11-04", "2026-11-08"), "2026-11-05"); // in grace → no gap
  assert.equal(renewalStart("2026-11-01", "2026-11-08"), "2026-11-08"); // lapsed → today
  assert.equal(renewalStart(null, "2026-11-08"), "2026-11-08");
});
t("stages", () => {
  const today = "2026-11-08";
  assert.deepEqual(stageOf("2026-11-30", today), { stage: "active", days: 22 });
  assert.equal(stageOf("2026-11-15", today).stage, "due_soon");
  assert.equal(stageOf("2026-11-09", today).stage, "due_soon");
  assert.equal(stageOf("2026-11-08", today).stage, "due_today");
  assert.equal(stageOf("2026-11-07", today).stage, "grace");
  assert.equal(stageOf("2026-11-03", today).stage, "grace");
  assert.equal(stageOf("2026-11-02", today).stage, "lapsed");
  assert.equal(stageOf("2026-10-09", today).stage, "lapsed");
  assert.equal(stageOf("2026-10-08", today).stage, "winback");
  assert.equal(stageOf("2026-08-10", today).stage, "winback");
  assert.equal(stageOf("2026-08-09", today).stage, "gone");
  assert.equal(stageOf(null, today).stage, "none");
  assert.equal(daysBetween("2026-11-08", "2026-11-15"), 7);
});
t("steps", () => {
  assert.equal(stepFor("due_soon", 7), "t-7");
  assert.equal(stepFor("due_soon", 4), "t-7");
  assert.equal(stepFor("due_soon", 3), "t-3");
  assert.equal(stepFor("active", 20), null);
});
t("phones", () => {
  assert.equal(normalizePhone("98765 43210"), "919876543210");
  assert.equal(normalizePhone("+91 98765-43210"), "919876543210");
  assert.equal(normalizePhone("09876543210"), "919876543210");
  assert.equal(normalizePhone("919876543210"), "919876543210");
  assert.equal(normalizePhone("12345"), null);
  assert.equal(normalizePhone("5876543210"), null);
});
t("messages", () => {
  const m = reminderText("t-3", { name: "Arun Kumar", plan: "Monthly", end: "2026-11-15", amount: 1200, upi: null });
  assert.match(m, /Hi Arun!/);
  assert.match(m, /3 days left/);
  assert.match(m, /₹1,200/);
  assert.match(m, /15 Nov/);
  const g = reminderText("grace", { name: "Priya", plan: "Monthly", end: "2026-11-05", upi: "fitness7@okaxis" });
  assert.match(g, /till 10 Nov/);
  assert.match(g, /fitness7@okaxis/);
  const r = receiptText({ name: "Priya", plan: "Quarterly", amount: 3000, starts: "2026-11-08", ends: "2027-02-07", receiptNo: "F7/2026-27/0001", url: "https://fitness7gym.in/receipt/abc" });
  assert.match(r, /₹3,000/);
  assert.match(r, /7 Feb 2027/);
});
console.log(`billing: ${n}/6 groups passed`);
