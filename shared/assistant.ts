import { brand } from "./brand";
import { contact, hours, plans, classes, trainers, faqs, trialOffer, upcomingTreks, reviews, addressLine } from "./gym";
import { inr, longDate } from "./format";
import { wa } from "./whatsapp";

/**
 * The assistant's whole world is shared/gym.ts. Both paths — the local
 * matcher and Claude — answer from the same facts the page renders, so the
 * bot can never quote a price or a timing the site does not.
 */

export type Reply = { reply: string; chips?: string[]; source: "local" | "claude" };

export const CHIPS = {
  home: ["Opening hours", "Membership prices", "Free trial", "Next trek", "Where are you?", "Talk on WhatsApp"],
  afterHours: ["Membership prices", "Free trial", "Where are you?"],
  afterPrices: ["Free trial", "What's included?", "Talk on WhatsApp"],
  afterTrial: ["Opening hours", "Where are you?", "Talk on WhatsApp"],
  afterTrek: ["Book a trek slot", "Membership prices", "Talk on WhatsApp"],
  afterLocation: ["Opening hours", "Free trial", "Talk on WhatsApp"],
} as const;

/* ------------------------------------------------------------------ */
/* Facts, as prose, for the model                                     */
/* ------------------------------------------------------------------ */

export function buildFacts(): string {
  const treks = upcomingTreks().slice(0, 3);
  return [
    `GYM: ${brand.fullName}, ${contact.address.city}. Tagline: "${brand.tagline}". Unisex, fully air-conditioned.`,
    `RATING: ${reviews.rating.toFixed(1)} from ${reviews.count} Google reviews.`,
    `ADDRESS: ${addressLine}. Maps: ${contact.mapsUrl}`,
    `PHONE / WHATSAPP: ${contact.phoneDisplay}. WhatsApp link: ${wa.general()}`,
    `INSTAGRAM: @${brand.instagram}`,
    `HOURS: ` + hours.map((h) => `${h.day}: ${h.morning ?? "closed"}${h.evening ? ` and ${h.evening}` : ""}`).join("; ") + ".",
    `MEMBERSHIP (no joining fee): ` +
      plans.map((p) => `${p.name} ${inr(p.priceINR)} ${p.period}${p.compareAtINR ? ` (usually ${inr(p.compareAtINR)})` : ""} — ${p.summary} Includes: ${p.features.join(", ")}.`).join(" ") ,
    `FREE TRIAL: ${trialOffer.body}`,
    `CLASSES: ` + classes.map((c) => `${c.name} (${c.durationMin} min, ${c.intensity}; ${c.schedule})`).join("; ") + ".",
    `TRAINERS: ` + trainers.map((t) => `${t.name}, ${t.role} — ${t.specialities.join(", ")}`).join("; ") + ".",
    `MONTHLY TREKS (third weekend): ` +
      treks.map((t) => `${t.title}, ${t.location}, ${longDate(t.date)}, ${t.difficulty}, ${t.distanceKm} km, members ${inr(t.memberPriceINR)} / guests ${inr(t.priceINR)}, ${t.slotsLeft} of ${t.slotsTotal} slots left. Includes ${t.includes.join(", ")}. Meet at ${t.meetingPoint}.`).join(" "),
    `FAQ: ` + faqs.map((f) => `Q: ${f.q} A: ${f.a}`).join(" "),
  ].join("\n");
}

export const SYSTEM_PROMPT = `You are the assistant on the website of ${brand.fullName}, a gym in ${contact.address.city}, Tamil Nadu.

Answer ONLY from the FACTS below. If the facts do not cover a question, say you are not sure and offer to connect the person on WhatsApp (${wa.general()}) — never guess a price, a timing, or a policy. Do not invent trainers, classes, offers or discounts.

Style: warm, direct, short. Under 70 words unless listing hours or plans. Plain text, no markdown headings, no bullet symbols other than a simple hyphen. Use ₹ for money. If someone wants to join, book, or ask something you cannot answer, end with the WhatsApp link. If they write in Tamil or Tanglish, reply in simple English and offer WhatsApp.

FACTS:
${buildFacts()}`;

/* ------------------------------------------------------------------ */
/* Local, deterministic answers                                        */
/* ------------------------------------------------------------------ */

type Intent = { id: string; keys: string[]; answer: () => Reply };

const hoursText = () => {
  const weekday = hours[0];
  const sunday = hours[6];
  return `We're open ${weekday.morning} and ${weekday.evening}, Monday to Saturday. Sunday it's ${sunday.morning} only.`;
};

const plansText = () => {
  const lines = plans.map((p) => `- ${p.name}: ${inr(p.priceINR)} ${p.period}${p.badge ? ` (${p.badge.toLowerCase()})` : ""}`);
  return `No joining fee. Everything below includes the full floor, all classes, lockers and showers.\n${lines.join("\n")}\nPersonal training is the only thing priced separately.`;
};

const trekText = () => {
  const t = upcomingTreks()[0];
  if (!t) return "The next trek date isn't up yet — message us on WhatsApp and we'll tell you as soon as it is.";
  return `Next up is ${t.title} in ${t.location} on ${longDate(t.date)} — ${t.difficulty.toLowerCase()}, ${t.distanceKm} km. ${inr(t.memberPriceINR)} for members, ${inr(t.priceINR)} for guests, and ${t.slotsLeft} of ${t.slotsTotal} slots are left. Transport, meals and a trek lead are included.`;
};

const intents: Intent[] = [
  {
    id: "human",
    keys: ["whatsapp", "human", "someone", "talk to", "speak to", "call you", "phone number", "contact number", "real person"],
    answer: () => ({
      reply: `Of course. The quickest way is WhatsApp — ${contact.phoneDisplay}. Tap the button below and a coach will reply, usually within the hour during open time.`,
      chips: ["Opening hours", "Free trial"],
      source: "local",
    }),
  },
  {
    id: "trial",
    keys: ["trial", "free session", "try", "first session", "demo", "test", "visit once", "one day"],
    answer: () => ({
      reply: `${trialOffer.body} Just turn up in training shoes during open hours — or send us a WhatsApp first and we'll have a coach ready.`,
      chips: [...CHIPS.afterTrial],
      source: "local",
    }),
  },
  {
    id: "hours",
    keys: ["hour", "timing", "time", "open", "close", "when", "sunday", "morning", "evening", "today"],
    answer: () => ({ reply: hoursText(), chips: [...CHIPS.afterHours], source: "local" }),
  },
  {
    id: "prices",
    keys: ["price", "cost", "fee", "membership", "plan", "monthly", "quarterly", "annual", "yearly", "rate", "how much", "₹", "rs", "rupee", "join", "admission", "charges"],
    answer: () => ({ reply: plansText(), chips: [...CHIPS.afterPrices], source: "local" }),
  },
  {
    id: "included",
    keys: ["include", "what do i get", "facilities", "locker", "shower", "parking", "equipment"],
    answer: () => ({
      reply: `Every membership covers the full free-weights and cardio floor, all group classes, lockers and hot showers, and a free induction with a coach. There's parking on site and the whole floor is air-conditioned.`,
      chips: ["Membership prices", "Free trial", "Talk on WhatsApp"],
      source: "local",
    }),
  },
  {
    id: "trek",
    keys: ["trek", "hill", "climb", "hike", "yercaud", "kolli", "sitheri", "kotagiri", "expedition", "trip", "outdoor", "mountain", "book a trek", "slot"],
    answer: () => ({ reply: trekText(), chips: [...CHIPS.afterTrek], source: "local" }),
  },
  {
    id: "location",
    keys: ["where", "location", "address", "map", "reach", "direction", "place", "near", "landmark", "bypass", "hospital", "floor"],
    answer: () => ({
      reply: `We're at ${addressLine} — opposite the Government Hospital. Open the map link below for directions, or call ${contact.phoneDisplay}.`,
      chips: [...CHIPS.afterLocation],
      source: "local",
    }),
  },
  {
    id: "trainers",
    keys: ["trainer", "coach", "karthick", "durai", "staff", "instructor", "who will"],
    answer: () => ({
      reply: `${trainers.map((t) => `${t.name} (${t.role.toLowerCase()})`).join(" and ")} run every session on the floor. Both are named in almost every one of our ${reviews.count} Google reviews — that's the part we're proudest of.`,
      chips: ["Free trial", "Personal training", "Talk on WhatsApp"],
      source: "local",
    }),
  },
  {
    id: "pt",
    keys: ["personal training", "personal trainer", " pt", "one to one", "1-1", "diet", "nutrition"],
    answer: () => {
      const pt = plans.find((p) => p.id === "personal-training");
      return {
        reply: `Personal training is ${pt ? `${inr(pt.priceINR)} ${pt.period}` : "available"} — one coach, twelve one-to-one sessions, a written programme and a custom diet plan, reviewed weekly. Membership is included in that.`,
        chips: ["Free trial", "Talk on WhatsApp"],
        source: "local",
      };
    },
  },
  {
    id: "ladies",
    keys: ["ladies", "women", "female", "girl", "unisex", "separate"],
    answer: () => {
      const l = classes.find((c) => c.id === "ladies");
      return {
        reply: `Yes — it's a unisex gym, and the full floor is reserved for women ${l ? l.schedule.replace(" · ", ", ") : "for dedicated hours"}, with a woman trainer on duty.`,
        chips: ["Free trial", "Membership prices", "Opening hours"],
        source: "local",
      };
    },
  },
  {
    id: "classes",
    keys: ["class", "hiit", "yoga", "cardio", "strength", "boxing", "functional", "crossfit", "zumba", "group"],
    answer: () => ({
      reply: `We run ${classes.length} coached classes: ${classes.map((c) => c.name).join(", ")}. All of them are included in every membership.`,
      chips: ["Membership prices", "Free trial", "Talk on WhatsApp"],
      source: "local",
    }),
  },
  {
    id: "ac",
    keys: ["ac ", "a/c", "air con", "ventilat", "fan", "hot", "crowd", "busy", "clean"],
    answer: () => ({
      reply: `Fully air-conditioned, with fans throughout — members mention the ventilation in the reviews more than anything else. Early mornings and after 8 PM are the quietest.`,
      chips: ["Opening hours", "Free trial"],
      source: "local",
    }),
  },
  {
    id: "greet",
    keys: ["hi", "hello", "hey", "vanakkam", "good morning", "good evening", "namaste"],
    answer: () => ({
      reply: `Hi! I can help with hours, membership, the free trial, or this month's trek. What would you like to know?`,
      chips: [...CHIPS.home],
      source: "local",
    }),
  },
  {
    id: "thanks",
    keys: ["thank", "thanks", "nandri", "great", "ok", "okay", "cool", "super"],
    answer: () => ({
      reply: `Anytime. If you want to come in, the free trial is the easiest first step — no card, no sign-up.`,
      chips: ["Free trial", "Talk on WhatsApp"],
      source: "local",
    }),
  },
];

export function localAnswer(question: string): Reply | null {
  const q = ` ${question.toLowerCase().replace(/[^\w₹\s/]/g, " ")} `;
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of intents) {
    const score = intent.keys.reduce((n, k) => n + (q.includes(k.toLowerCase()) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  return best ? best.intent.answer() : null;
}

export function fallbackAnswer(): Reply {
  return {
    reply: `I'm not sure about that one — but a coach will be. Send it to us on WhatsApp at ${contact.phoneDisplay} and you'll get a proper answer, usually within the hour.`,
    chips: [...CHIPS.home],
    source: "local",
  };
}

export function greeting(): Reply {
  return {
    reply: `Hi, I'm the ${brand.name} assistant. Ask me about hours, membership, the free trial, or this month's trek — or tap one below.`,
    chips: [...CHIPS.home],
    source: "local",
  };
}
