"use client";

import { useState } from "react";
import { plans } from "@f7/content";
import { dayMonthYear, endFor, inr, isIso, PAY_METHODS, planMonths } from "@/lib/billing";
import { Button, Field, inputCls } from "@/components/admin/ui";

/**
 * Plan + amount + method, with the new end date worked out as you type.
 * Used on a member's page (renew) and inside "Add member" (first payment).
 * Field names match billing-actions.ts.
 */
export function PaymentFields({ defaultPlan, defaultStart, today, optional = false }: { defaultPlan: string; defaultStart: string; today: string; optional?: boolean }) {
  const [planId, setPlanId] = useState(optional ? "" : defaultPlan);
  const plan = plans.find((p) => p.id === planId);
  const [amount, setAmount] = useState(String(plan?.priceINR ?? ""));
  const [start, setStart] = useState(defaultStart);
  const end = plan && isIso(start) ? endFor(start, planMonths(plan.id)) : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Plan">
        <select
          name="plan_id"
          value={planId}
          onChange={(e) => {
            setPlanId(e.target.value);
            const p = plans.find((x) => x.id === e.target.value);
            setAmount(p ? String(p.priceINR) : "");
          }}
          className={inputCls}
        >
          {optional ? <option value="">No payment yet (trial / pay later)</option> : null}
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {inr(p.priceINR)} {p.period}
            </option>
          ))}
        </select>
      </Field>
      {plan ? (
        <>
          <Field label="Amount paid (₹)" hint={Number(amount) !== plan.priceINR && amount ? `Plan price is ${inr(plan.priceINR)}` : undefined}>
            <input name="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} className={inputCls} required />
          </Field>
          <Field label="Starts on" hint={end ? `Valid till ${dayMonthYear(end)}` : undefined}>
            <input name="starts_on" type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Paid by">
            <select name="method" defaultValue="upi_desk" className={inputCls}>
              {PAY_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="UPI ref / note (optional)">
            <input name="reference" maxLength={80} placeholder="Last 4 of UTR, cheque no…" className={inputCls} />
          </Field>
          <Field label="Paid on">
            <input name="paid_on" type="date" defaultValue={today} max={today} className={inputCls} />
          </Field>
        </>
      ) : null}
    </div>
  );
}

export function PaymentSubmit({ label = "Save payment" }: { label?: string }) {
  return (
    <Button type="submit" className="mt-4 w-full sm:w-auto">
      {label}
    </Button>
  );
}
