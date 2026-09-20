"use client";

import { useState } from "react";
import { Loader2, Check, ArrowUpRight } from "lucide-react";
import { classes, wa } from "@f7/content";

type State = "idle" | "sending" | "sent" | "error";

const field =
  "w-full rounded-xl border border-line bg-ink px-4 py-3.5 text-sm text-white placeholder:text-white/30 transition-colors focus:border-lime focus:outline-none";

export function EnquiryForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong");
      setState("sent");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-7 flex flex-col items-center rounded-2xl border border-lime/30 bg-green/5 px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full btn-green">
          <Check className="size-7" strokeWidth={3} />
        </span>
        <h4 className="mt-5 text-lg font-semibold text-white">Got it.</h4>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
          A coach will call you back within a day. If you would rather not wait,
          message us directly.
        </p>
        <a
          href={wa.general()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-green px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white"
        >
          Open WhatsApp
          <ArrowUpRight className="size-4" strokeWidth={2.4} />
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      {/* honeypot — bots fill this, humans never see it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] size-0"
      />

      <div>
        <label htmlFor="name" className="sr-only">Your name</label>
        <input id="name" name="name" required placeholder="Your name" className={field} />
      </div>

      <div>
        <label htmlFor="phone" className="sr-only">Phone number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          pattern="[0-9+\s-]{10,15}"
          placeholder="Phone number"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="interest" className="sr-only">What are you interested in?</label>
        <select id="interest" name="interest" className={field} defaultValue="">
          <option value="" disabled>What are you interested in?</option>
          <option value="Membership">Membership</option>
          <option value="Free trial">Free trial session</option>
          <option value="Personal training">Personal training</option>
          <option value="Trekking">Monthly trek</option>
          {classes.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">Anything else?</label>
        <textarea
          id="message"
          name="message"
          rows={3}
          placeholder="Anything else we should know? (optional)"
          className={`${field} resize-none`}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-400">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-green px-6 py-4 font-semibold text-ink transition-all hover:bg-white disabled:opacity-60"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={2.4} />
            Sending
          </>
        ) : (
          "Request a call back"
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-white/35">
        We only use your number to reply. No marketing lists.
      </p>
    </form>
  );
}
