"use client";

import { useState } from "react";

/** The gym's UPI ID with a copy button — for people who'd rather type it into their app. */
export function CopyUpi({ vpa }: { vpa: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(vpa).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        });
      }}
      className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line px-4 text-sm font-bold"
    >
      <span className="font-mono">{vpa}</span>
      <span className="text-muted">{done ? "Copied" : "Copy"}</span>
    </button>
  );
}
