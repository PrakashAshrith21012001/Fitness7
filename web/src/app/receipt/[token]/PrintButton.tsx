"use client";

/** Print / Save as PDF — hidden on the printed page itself. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary h-11 px-5 text-sm print:hidden">
      Print / save PDF
    </button>
  );
}
