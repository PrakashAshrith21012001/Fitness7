import type { Metadata } from "next";
import { brand, contact, addressLine } from "@f7/content";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${brand.fullName} collects, uses and deletes your data on the website and the Fitness 7 app.`,
  alternates: { canonical: "/privacy" },
};

const UPDATED = "26 October 2026";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 font-display text-2xl font-semibold text-white">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 leading-relaxed text-muted">{children}</p>;
}

function L({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <a href="/" className="text-sm font-semibold text-lime hover:underline">
          ← {brand.fullName}
        </a>
        <h1 className="mt-8 font-display text-4xl font-semibold text-white sm:text-5xl">Privacy policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated {UPDATED}</p>

        <P>
          This policy covers the {brand.fullName} website (fitness7gym.in) and the Fitness 7 app for Android and
          iOS. {brand.fullName}, {addressLine} (“we”, “us”) is responsible for your data. If anything here is
          unclear, write to <a className="text-lime hover:underline" href={`mailto:${contact.email}`}>{contact.email}</a>{" "}
          or call {contact.phoneDisplay}.
        </P>

        <H>What we collect</H>
        <L
          items={[
            <><b className="text-white">Account:</b> your phone number, or your Google or Apple account email, used to sign you in. Your name.</>,
            <><b className="text-white">Membership:</b> plan, renewal date, preferred training slot, fitness goal, class bookings, attendance and gym check-ins, trek reservations.</>,
            <><b className="text-white">Body and activity numbers you enter:</b> height, weight, age, sex, activity level, target weight, water, workouts, steps and sleep you log.</>,
            <><b className="text-white">Food log:</b> meals and foods you add, and the calories and nutrients we calculate for them.</>,
            <><b className="text-white">Food photos:</b> only when you use “Snap a plate”. See below.</>,
            <><b className="text-white">Website enquiries:</b> name, phone and message you send through the enquiry form or chat assistant.</>,
            <><b className="text-white">Basic technical data:</b> app version, device type and error logs, used to keep the service working.</>,
          ]}
        />
        <P>
          We do not collect your precise location, contacts, or advertising ID, and we do not show ads.
        </P>

        <H>Food photos and AI analysis</H>
        <P>
          When you snap a plate or type a meal the app can’t match from its own food table, the photo or text is sent
          to our server and analysed by Anthropic’s Claude AI to estimate the foods and portions. Photos are used only
          for that analysis and are not stored by us afterwards. Progress photos you take in the weight tracker stay
          on your phone and are never uploaded. Nutrition numbers are estimates, not medical advice.
        </P>

        <H>Health information</H>
        <P>
          Weight, sleep, food and similar numbers are only used to show your own progress and targets, and so your
          coach at the gym can help you if you are a member. If you mention medical conditions during setup, that
          answer stays on your phone. We never sell health data or use it for advertising. Connecting Health Connect
          or Apple Health is optional and can be turned off at any time.
        </P>

        <H>Who processes your data</H>
        <L
          items={[
            <><b className="text-white">Supabase</b> — database, sign-in and file storage.</>,
            <><b className="text-white">Render</b> — hosts this website and the app’s server.</>,
            <><b className="text-white">Anthropic</b> — AI analysis of food photos and text, and the chat assistant.</>,
            <><b className="text-white">Google / Apple</b> — only if you choose to sign in with them.</>,
            <><b className="text-white">WhatsApp</b> — only when you tap a WhatsApp button to message the gym.</>,
          ]}
        />
        <P>
          These providers may store data outside India. They process it only to provide their service to us. We do
          not sell or rent your personal data to anyone.
        </P>

        <H>Who at the gym can see it</H>
        <P>
          Gym staff with a staff login (owner, admin, coaches) can see members’ membership, attendance, bookings and
          logged progress so they can run the gym and coach you. Staff accounts are personal and access is limited by
          role.
        </P>

        <H>How long we keep it</H>
        <P>
          We keep your account data while your account exists. Website enquiries are kept for up to 12 months. When you
          delete your account, your profile and every log tied to it are deleted from our database straight away;
          backups roll over within 30 days.
        </P>

        <H>Your choices and rights</H>
        <L
          items={[
            <>See and edit your details in the app under Settings.</>,
            <>Hide calorie tracking entirely in Settings → Training.</>,
            <>Turn off reminders and notifications in Settings or in your phone’s settings.</>,
            <>Delete your account and data at any time — <a className="text-lime hover:underline" href="/delete-account">here’s how</a>.</>,
            <>Ask us for a copy of your data or to correct it by writing to {contact.email}.</>,
          ]}
        />

        <H>Children</H>
        <P>
          The app is meant for people aged 13 and over. Diet and calorie advice is not offered to anyone under 18; if
          you are under 18, please use the app with a parent or guardian and talk to a coach at the gym.
        </P>

        <H>Security</H>
        <P>
          Data is sent over encrypted connections (HTTPS), and each member can only read their own records. No system
          is perfectly secure, so please keep your phone and sign-in protected.
        </P>

        <H>Changes</H>
        <P>
          If we change this policy we will update the date above, and tell you in the app if the change is significant.
        </P>
      </main>
      <Footer />
    </>
  );
}
