"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { wa } from "@f7/content";

/**
 * Request-a-callback. Three things to fill, one of them a tap:
 *  - Postel's Law: the phone field takes "+91 86681 61356", "086681-61356",
 *    "8668161356" — whatever people type — and we tidy it.
 *  - Error Prevention: problems are explained under the field, on blur, not
 *    after a failed submit; the button can't double-send.
 *  - Idempotency key: a retry or double tap never creates two leads.
 *  - Visibility of System Status: sending → sent, with a next step.
 */

const INTERESTS = ["Free trial", "Membership", "Personal training", "Monthly trek"] as const;
type State = "idle" | "sending" | "sent" | "error";

/** Indian mobile, any formatting → 10 digits, or null. */
export function normalisePhone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

const newKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

export function EnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ name: false, phone: false });
  const [interest, setInterest] = useState<(typeof INTERESTS)[number]>("Free trial");
  const [note, setNote] = useState<string | null>(null);
  const key = useRef<string>("");

  const nameErr = name.trim().length < 2 ? "Please tell us your name." : null;
  const phoneErr = normalisePhone(phone) ? null : "Enter a 10-digit mobile number.";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ name: true, phone: true });
    if (nameErr || phoneErr || state === "sending") return;
    if (!key.current) key.current = newKey();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key.current },
        body: JSON.stringify({
          name: name.trim(),
          phone: `+91${normalisePhone(phone)}`,
          interest,
          message: note ?? undefined,
          company: (e.currentTarget.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "",
          idempotencyKey: key.current,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-5 flex flex-col items-center rounded-[14px] border border-line bg-surface px-6 py-10 text-center" role="status">
        <span className="grid size-14 place-items-center rounded-full bg-green text-on-accent">
          <Check className="size-7" strokeWidth={3} />
        </span>
        <h4 className="mt-4 text-lg font-bold text-white">Thanks, {name.trim().split(" ")[0]}.</h4>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted">A coach will call you on {phone} within a day. In a hurry? WhatsApp is quicker.</p>
        <a href={wa.general()} target="_blank" rel="noopener noreferrer" className="press mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-line px-4 text-[13px] font-extrabold uppercase tracking-[0.06em] text-white hover:bg-surface-2">
          Open WhatsApp <ArrowUpRight className="size-4" strokeWidth={2.4} />
        </a>
      </div>
    );
  }

  const field = (bad: boolean) =>
    `h-12 w-full rounded-[12px] border bg-paper px-4 text-base text-white placeholder:text-muted transition-colors focus:outline-none ${
      bad ? "border-[#ff8a8a]" : "border-line focus:border-white"
    }`;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
      {/* honeypot — bots fill this, people never see it */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] size-0" />

      <div>
        <label htmlFor="enq-name" className="mb-1.5 block text-[13px] font-semibold text-white">Your name</label>
        <input
          id="enq-name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          aria-invalid={touched.name && !!nameErr}
          aria-describedby="enq-name-err"
          className={field(touched.name && !!nameErr)}
        />
        <p id="enq-name-err" className="mt-1 min-h-4 text-xs text-[#ff8a8a]">{touched.name ? nameErr : ""}</p>
      </div>

      <div>
        <label htmlFor="enq-phone" className="mb-1.5 block text-[13px] font-semibold text-white">Mobile number</label>
        <div className="flex">
          <span className="flex h-12 items-center rounded-l-[12px] border border-r-0 border-line bg-surface-2 px-3 text-sm text-muted">+91</span>
          <input
            id="enq-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            aria-invalid={touched.phone && !!phoneErr}
            aria-describedby="enq-phone-err"
            className={`${field(touched.phone && !!phoneErr)} tnum rounded-l-none`}
          />
        </div>
        <p id="enq-phone-err" className="mt-1 min-h-4 text-xs text-[#ff8a8a]">{touched.phone ? phoneErr : ""}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-white">I&apos;m interested in</legend>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <label
              key={i}
              className={`press flex min-h-11 items-center rounded-full border px-4 text-[13px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-pink ${
                interest === i ? "border-white bg-white text-ink" : "border-line bg-surface text-white hover:bg-surface-2"
              }`}
            >
              <input type="radio" name="interest" value={i} checked={interest === i} onChange={() => setInterest(i)} className="sr-only" />
              {i}
            </label>
          ))}
        </div>
      </fieldset>

      {note === null ? (
        <button type="button" onClick={() => setNote("")} className="text-[13px] font-semibold text-muted underline-offset-4 hover:text-white hover:underline">
          + Add a note (optional)
        </button>
      ) : (
        <div>
          <label htmlFor="enq-note" className="mb-1.5 block text-[13px] font-semibold text-white">Note</label>
          <textarea id="enq-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="w-full resize-none rounded-[12px] border border-line bg-paper px-4 py-3 text-base text-white focus:border-white focus:outline-none" />
        </div>
      )}

      {error ? (
        <p role="alert" className="rounded-lg border border-[#ff8a8a]/40 bg-[rgba(255,138,138,0.08)] px-3 py-2 text-sm text-[#ff8a8a]">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={state === "sending"} className="btn-pink press flex h-12 w-full items-center justify-center gap-2 disabled:opacity-70">
        {state === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} /> Sending…
          </>
        ) : (
          "Call me back"
        )}
      </button>
      <p className="text-center text-xs text-muted">We only use your number to call you back.</p>
    </form>
  );
}
