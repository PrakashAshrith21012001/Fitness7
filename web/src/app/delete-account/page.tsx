import type { Metadata } from "next";
import { brand, contact, wa } from "@f7/content";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Delete your account",
  description: `How to delete your Fitness 7 app account and the data linked to it.`,
  alternates: { canonical: "/delete-account" },
};

export default function DeleteAccountPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <a href="/" className="text-sm font-semibold text-lime hover:underline">
          ← {brand.fullName}
        </a>
        <h1 className="mt-8 font-display text-4xl font-semibold text-white sm:text-5xl">Delete your Fitness 7 account</h1>
        <p className="mt-4 leading-relaxed text-muted">
          This page is for the Fitness 7 app by {brand.fullName}. You can delete your account and its data at any time,
          whether or not you are still a gym member.
        </p>

        <h2 className="mt-12 font-display text-2xl font-semibold text-white">In the app (fastest)</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-relaxed text-muted">
          <li>Open the Fitness 7 app and sign in.</li>
          <li>Go to <b className="text-white">Settings</b> → <b className="text-white">Privacy</b> → <b className="text-white">Delete my data</b>.</li>
          <li>Tap <b className="text-white">Delete</b> to confirm. Your account is deleted straight away and you are signed out.</li>
        </ol>

        <h2 className="mt-12 font-display text-2xl font-semibold text-white">Without the app</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Send us a request from the phone number or email you signed in with, saying “Delete my Fitness 7 account”.
          We’ll confirm it’s you and delete it within 7 days.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={wa.general()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-ink"
          >
            WhatsApp {contact.phoneDisplay}
          </a>
          <a
            href={`mailto:${contact.email}?subject=Delete%20my%20Fitness%207%20account`}
            className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-white"
          >
            Email {contact.email}
          </a>
        </div>

        <h2 className="mt-12 font-display text-2xl font-semibold text-white">What gets deleted</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
          <li>Your sign-in (phone number, Google or Apple link) and profile: name, goal, slot, height, age, weight.</li>
          <li>Check-ins, class bookings, trek reservations and notification settings.</li>
          <li>Weight, food, water, workout, sleep and step logs.</li>
          <li>Anything stored only on your phone is removed when you sign out or uninstall the app.</li>
        </ul>

        <h2 className="mt-12 font-display text-2xl font-semibold text-white">What we keep</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Nothing from the app. If you are a gym member, the gym’s own membership and payment records at the front
          desk are kept as long as the law requires for accounts and tax. Database backups roll over within 30 days.
        </p>

        <p className="mt-12 text-sm text-muted">
          See also our <a href="/privacy" className="text-lime hover:underline">privacy policy</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
