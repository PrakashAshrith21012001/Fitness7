/**
 * Fitness 7 Gym Unisex — single source of content for the website and the app.
 *
 * Everything marked CONFIRM is a placeholder standing in until the owner
 * signs off. Change it here once and both the site and the app update.
 */

export const CONFIRM = "⚠️ confirm with owner";

/**
 * Open questions for the owner that are not a single field above.
 * Answer these before launch; each one changes a setting, not a screen.
 */
export const confirmWithOwner = [
  "SMS provider for phone sign-in codes (Twilio, MSG91, or whatever the gym already pays for) — supabase/README.md §2. Until then test numbers with fixed codes.",
  "Is calorie / food tracking part of every plan, or only Personal Training? (Today every signed-in member sees Food. Gating is one check in mobile/src/app/food/index.tsx.)",
  "Evening closing time: 9:30 PM (the creative) or 10:00 PM (the listing)?",
  "Second branch on Palacode Main Road — list it on the site or not?",
] as const;

/* ------------------------------------------------------------------ */
/* Contact                                                            */
/* ------------------------------------------------------------------ */

export const contact = {
  /** Verified from the gym's Google Business listing. */
  phone: "+918668161356",
  phoneDisplay: "+91 86681 61356",
  /** CONFIRM */
  email: "hello@fitness7gym.in",
  address: {
    line1: "TS Square, 3rd Floor",
    line2: "Nethaji Bypass, opp. Govt Hospital",
    city: "Dharmapuri",
    state: "Tamil Nadu",
    pincode: "636701",
  },
  geo: { lat: 12.1237307, lng: 78.1586037 },
  placeId: "ChIJ00-kbgwXrDsRyR-mS8ugPK8",
  mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJ00-kbgwXrDsRyR-mS8ugPK8",
  instagram: "https://instagram.com/f7gym_dpi",
  /** CONFIRM — a second branch was seen on Palacode Main Road */
  secondBranch: { area: "Palacode Main Road", phone: "+918754360157" },
} as const;

export const reviews = {
  rating: 5.0,
  count: 119,
  source: "Google",
} as const;

export const addressLine = [
  contact.address.line1,
  contact.address.line2,
  `${contact.address.city}, ${contact.address.state} ${contact.address.pincode}`,
].join(", ");

/* ------------------------------------------------------------------ */
/* Opening hours                                                      */
/* ------------------------------------------------------------------ */

export type Hours = {
  day: string;
  morning: string | null;
  evening: string | null;
};

/**
 * From the Google listing. NOTE: the gym's own creative on that listing says
 * evenings close at 9:30 PM, while the listing itself says 10:00 PM —
 * CONFIRM which is right and fix both.
 */
export const hours: Hours[] = [
  { day: "Monday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Tuesday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Wednesday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Thursday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Friday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Saturday", morning: "5:00 AM – 12:00 PM", evening: "4:00 – 10:00 PM" },
  { day: "Sunday", morning: "5:00 – 10:00 AM", evening: null },
];

/* ------------------------------------------------------------------ */
/* Stats strip                                                        */
/* ------------------------------------------------------------------ */

export type Stat = { value: string; label: string };

/** CONFIRM — all numbers */
export const stats: Stat[] = [
  { value: "5.0", label: "Google rating · 119 reviews" },
  { value: "1200+", label: "Members trained" }, // CONFIRM
  { value: "12", label: "Treks a year" },
  { value: "6", label: "Days a week, 5 AM – 10 PM" },
];

/* ------------------------------------------------------------------ */
/* Classes                                                            */
/* ------------------------------------------------------------------ */

export type GymClass = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  durationMin: number;
  intensity: "Low" | "Moderate" | "High" | "All levels";
  schedule: string;
  /** Lucide icon name, rendered on web; mapped to an emoji on mobile. */
  icon: string;
  /** Photo of the floor for the class card on the site — web/public/classes/<id>.jpg */
  image?: string;
};

export const classes: GymClass[] = [
  {
    id: "strength",
    name: "Strength & Conditioning",
    tagline: "Build the base everything else stands on",
    description:
      "Progressive barbell work — squat, bench, deadlift, press — programmed in blocks so you can actually see the numbers move. Coached technique from day one, whether it's your first rep or your thousandth.",
    durationMin: 60,
    intensity: "All levels",
    schedule: "Mon / Wed / Fri · 6:00 AM & 6:00 PM",
    icon: "Dumbbell",
    image: "/classes/strength.jpg",
  },
  {
    id: "hiit",
    name: "HIIT Burn",
    tagline: "Forty minutes, nothing wasted",
    description:
      "Short intervals at full effort with strict rest. Bodyweight, kettlebell and rower circuits that push conditioning up fast without eating your whole evening.",
    durationMin: 40,
    intensity: "High",
    schedule: "Tue / Thu · 6:30 AM & 7:00 PM",
    icon: "Flame",
    image: "/classes/hiit.jpg",
  },
  {
    id: "crossfit",
    name: "Functional Training",
    tagline: "Move well under load",
    description:
      "Olympic lift variations, gymnastic skills and metabolic conditioning in one session. Scaled to whatever you walk in with — nobody sits out.",
    durationMin: 60,
    intensity: "High",
    schedule: "Mon – Sat · 7:00 PM",
    icon: "Zap",
    image: "/classes/crossfit.jpg",
  },
  {
    id: "cardio",
    name: "Cardio Floor",
    tagline: "Open floor, your pace",
    description:
      "Treadmills, cycles, cross-trainers and rowers with a trainer on the floor to set your zones and keep you honest about them.",
    durationMin: 45,
    intensity: "Moderate",
    schedule: "All open hours",
    icon: "HeartPulse",
    image: "/classes/cardio.jpg",
  },
  {
    id: "yoga",
    name: "Yoga & Mobility",
    tagline: "The work that keeps you training",
    description:
      "Hatha-led flow with a mobility block for hips, shoulders and spine. The session that stops the other five from breaking you.",
    durationMin: 50,
    intensity: "Low",
    schedule: "Tue / Thu / Sat · 6:00 AM",
    icon: "Wind",
    image: "/classes/yoga.jpg",
  },
  {
    id: "ladies",
    name: "Ladies-Only Hours",
    tagline: "The full floor, reserved",
    description:
      "Dedicated hours with a woman trainer on duty and the entire floor — weights, cardio and studio — reserved. Unisex gym, separate space when you want it.",
    durationMin: 90,
    intensity: "All levels",
    schedule: "Mon – Sat · 11:00 AM – 1:00 PM",
    icon: "Sparkles",
    image: "/classes/ladies.jpg",
  },
  {
    id: "personal",
    name: "Personal Training",
    tagline: "One coach, one plan, your name on it",
    description:
      "Assessment, a written programme and a coach in the room for every session. Diet guidance included, reviewed every four weeks.",
    durationMin: 60,
    intensity: "All levels",
    schedule: "By appointment",
    icon: "Target",
    image: "/classes/personal.jpg",
  },
  {
    id: "combat",
    name: "Boxing & Combat Fit",
    tagline: "Hit something. Feel better.",
    description:
      "Bag work, pad rounds and footwork drills built into a conditioning session. No sparring required, all the release.",
    durationMin: 45,
    intensity: "High",
    schedule: "Wed / Sat · 7:30 PM",
    icon: "Swords",
    image: "/classes/combat.jpg",
  },
];

/* ------------------------------------------------------------------ */
/* Trainers                                                           */
/* ------------------------------------------------------------------ */

export type Trainer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  specialities: string[];
  /** CONFIRM — drop real photos into /public/trainers (web) and use the same names. */
  photo: string;
  experienceYears: number;
};

/** CONFIRM — every name, photo and credential on this list */
export const trainers: Trainer[] = [
  {
    id: "karthick",
    name: "Karthick",
    role: "Head Trainer", // CONFIRM role
    bio: "Runs the floor and writes the programmes. First one in at five, and the reason regulars call it their second home.", // CONFIRM
    specialities: ["Strength", "Fat loss", "Programme design"], // CONFIRM
    photo: "/trainers/karthick.jpg",
    experienceYears: 8, // CONFIRM
  },
  {
    id: "durai",
    name: "Durai",
    role: "Trainer", // CONFIRM role
    bio: "Conditioning and functional work. Scales any session to whoever walks in, and has never let a first-timer sit out.", // CONFIRM
    specialities: ["Conditioning", "Functional training", "Mobility"], // CONFIRM
    photo: "/trainers/durai.jpg",
    experienceYears: 5, // CONFIRM
  },
];

/* ------------------------------------------------------------------ */
/* Membership                                                         */
/* ------------------------------------------------------------------ */

export type Plan = {
  id: string;
  name: string;
  priceINR: number;
  period: string;
  /** Shown struck-through next to the price */
  compareAtINR?: number;
  summary: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

/** CONFIRM — every price on this page */
export const plans: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    priceINR: 1200,
    period: "per month",
    summary: "Full floor access, month to month. Walk away whenever.",
    features: [
      "Full gym & cardio floor",
      "All group classes",
      "Locker + shower access",
      "Free induction session",
    ],
  },
  {
    id: "quarterly",
    name: "Quarterly",
    priceINR: 3000,
    compareAtINR: 3600,
    period: "for 3 months",
    summary: "The plan most members settle on once the habit sticks.",
    features: [
      "Everything in Monthly",
      "One body composition check",
      "Diet guidance from a coach",
      "Guest pass for a friend",
    ],
    highlight: true,
    badge: "Most popular",
  },
  {
    id: "annual",
    name: "Annual",
    priceINR: 9600,
    compareAtINR: 14400,
    period: "for 12 months",
    summary: "Four months free, and the lowest per-day cost we offer.",
    features: [
      "Everything in Quarterly",
      "Quarterly body composition checks",
      "One free trek slot",
      "Priority personal-training booking",
      "Fitness 7 training tee",
    ],
    badge: "Best value",
  },
  {
    id: "personal-training",
    name: "Personal Training",
    priceINR: 5000,
    period: "per month",
    summary: "One coach, twelve sessions, a programme with your name on it.",
    features: [
      "12 one-to-one sessions",
      "Written training programme",
      "Custom diet plan",
      "Weekly progress review",
      "Full membership included",
    ],
  },
];

/** CONFIRM */
export const trialOffer = {
  title: "First session is on us",
  body: "Walk in, train a full session with a coach on the floor, decide after. No card, no sign-up.",
  cta: "Book a free trial",
};

/* ------------------------------------------------------------------ */
/* Trekking — one expedition a month                                  */
/* ------------------------------------------------------------------ */

export type TrekDifficulty = "Easy" | "Moderate" | "Challenging";

export type Trek = {
  id: string;
  title: string;
  location: string;
  /** ISO date — used for sorting and the countdown */
  date: string;
  month: string;
  distanceKm: number;
  altitudeM: number;
  difficulty: TrekDifficulty;
  durationText: string;
  priceINR: number;
  memberPriceINR: number;
  slotsTotal: number;
  slotsLeft: number;
  summary: string;
  highlights: string[];
  includes: string[];
  meetingPoint: string;
  /** CONFIRM — photos into /public/treks */
  image: string;
};

/** CONFIRM — dates, prices, slot counts and photos for every trek */
export const treks: Trek[] = [
  {
    id: "yercaud-oct-2026",
    title: "Yercaud Sunrise Climb",
    location: "Yercaud, Salem",
    date: "2026-10-18",
    month: "October 2026",
    distanceKm: 9,
    altitudeM: 1515,
    difficulty: "Easy",
    durationText: "Day trip · 4:00 AM – 6:00 PM",
    priceINR: 1400,
    memberPriceINR: 1000,
    slotsTotal: 30,
    slotsLeft: 11,
    summary:
      "The one we open the season with. A gentle climb through coffee estates to catch first light over the Shevaroy range, back in Dharmapuri by evening.",
    highlights: [
      "Sunrise from Pagoda Point",
      "Coffee estate trail",
      "Lake breakfast stop",
      "Beginner friendly — bring a first-timer",
    ],
    includes: ["Transport from the gym", "Breakfast & lunch", "Trek lead + first aid", "Entry fees"],
    meetingPoint: "Fitness 7 Gym, 4:00 AM sharp",
    image: "/treks/yercaud.jpg",
  },
  {
    id: "kolli-hills-nov-2026",
    title: "Kolli Hills & Agaya Gangai",
    location: "Namakkal",
    date: "2026-11-15",
    month: "November 2026",
    distanceKm: 14,
    altitudeM: 1300,
    difficulty: "Moderate",
    durationText: "Day trip · 3:30 AM – 9:00 PM",
    priceINR: 1800,
    memberPriceINR: 1300,
    slotsTotal: 25,
    slotsLeft: 25,
    summary:
      "Seventy hairpin bends to the top, then a thousand steps down to the Agaya Gangai falls — and every one of them back up again. Bring the legs you've been building.",
    highlights: [
      "1,200 steps to the falls",
      "Swim under Agaya Gangai",
      "Hill-top herb gardens",
      "Proper leg day, outdoors",
    ],
    includes: ["Transport from the gym", "All meals", "Trek lead + first aid", "Entry fees"],
    meetingPoint: "Fitness 7 Gym, 3:30 AM sharp",
    image: "/treks/kolli-hills.jpg",
  },
  {
    id: "sitheri-dec-2026",
    title: "Sitheri Hills Night Trek",
    location: "Dharmapuri",
    date: "2026-12-20",
    month: "December 2026",
    distanceKm: 11,
    altitudeM: 1100,
    difficulty: "Moderate",
    durationText: "Overnight · 6:00 PM – 10:00 AM",
    priceINR: 2200,
    memberPriceINR: 1600,
    slotsTotal: 20,
    slotsLeft: 20,
    summary:
      "Our own hills, walked under a December sky. Head torches on at dusk, camp at the top, and watch the valley come up out of the mist at six.",
    highlights: [
      "Night ascent with head torches",
      "Camp & bonfire at the summit",
      "Sunrise over the Kaveri valley",
      "Tents and sleeping bags provided",
    ],
    includes: ["Transport", "Dinner, breakfast & camp", "Tents + sleeping bags", "Trek lead + first aid"],
    meetingPoint: "Fitness 7 Gym, 6:00 PM",
    image: "/treks/sitheri.jpg",
  },
  {
    id: "kotagiri-jan-2027",
    title: "Kotagiri Ridge Walk",
    location: "The Nilgiris",
    date: "2027-01-24",
    month: "January 2027",
    distanceKm: 18,
    altitudeM: 1980,
    difficulty: "Challenging",
    durationText: "2 days · Sat 4:00 AM – Sun 8:00 PM",
    priceINR: 4500,
    memberPriceINR: 3500,
    slotsTotal: 16,
    slotsLeft: 16,
    summary:
      "The hardest thing on our calendar. Two days along the Nilgiri ridgeline at altitude, shola forest to grassland, with a homestay at the halfway mark.",
    highlights: [
      "18 km across two days",
      "Shola forest & grassland trails",
      "Homestay night in Kotagiri",
      "Six weeks of conditioning first — we'll programme it",
    ],
    includes: ["Transport", "Homestay + all meals", "Trek lead + first aid", "Forest permits"],
    meetingPoint: "Fitness 7 Gym, 4:00 AM Saturday",
    image: "/treks/kotagiri.jpg",
  },
];

export const trekIntro = {
  eyebrow: "One expedition, every month",
  title: "The training has somewhere to go",
  body: "Everything you build on the floor is for something. On the third weekend of each month we take it into the hills — Yercaud, Kolli, Sitheri, the Nilgiris. Members get first slots and a lower rate, first-timers get a lead who has walked it before, and nobody gets left on the trail.",
};

export function upcomingTreks(from: Date = new Date()): Trek[] {
  const cutoff = from.getTime();
  return treks
    .filter((t) => new Date(t.date).getTime() >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function nextTrek(from: Date = new Date()): Trek | undefined {
  return upcomingTreks(from)[0] ?? treks[0];
}

/* ------------------------------------------------------------------ */
/* Facilities                                                         */
/* ------------------------------------------------------------------ */

export type Facility = { name: string; detail: string; icon: string };

/** Ventilation, AC and equipment upkeep are all named repeatedly in the reviews. CONFIRM the rest. */
export const facilities: Facility[] = [
  { name: "Free weights floor", detail: "Racks, platforms and dumbbells to 50 kg", icon: "Dumbbell" },
  { name: "Cardio deck", detail: "Treadmills, cycles, rowers, cross-trainers", icon: "HeartPulse" },
  { name: "Functional zone", detail: "Rig, kettlebells, ropes, sleds, turf strip", icon: "Zap" },
  { name: "Group studio", detail: "Mirrored floor for yoga, HIIT and combat fit", icon: "Users" },
  { name: "Ladies-only hours", detail: "Full floor reserved, woman trainer on duty", icon: "Sparkles" },
  { name: "Changing rooms", detail: "Lockers and hot showers, both sides", icon: "DoorOpen" },
  { name: "Parking", detail: "Two-wheeler and car parking on site", icon: "Car" },
  { name: "Fully air conditioned", detail: "AC and fans throughout — members rate the ventilation", icon: "Snowflake" },
];

/* ------------------------------------------------------------------ */
/* Testimonials                                                       */
/* ------------------------------------------------------------------ */

export type Testimonial = {
  id: string;
  name: string;
  detail: string;
  quote: string;
  since: string;
};

/** PLACEHOLDER — replace with real Google reviews (119 available) and get permission before publishing */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Karthik R.",
    detail: "Lost 18 kg in 11 months",
    quote:
      "I had tried three gyms before this one and quit all three by the second month. The difference here is somebody notices when you don't turn up.",
    since: "Member since 2024",
  },
  {
    id: "t2",
    name: "Meena S.",
    detail: "Trains in the ladies-only hours",
    quote:
      "The eleven-to-one slot is the reason I started at all. Full floor, a woman coach, and after six months I stopped caring who else was in the room.",
    since: "Member since 2025",
  },
  {
    id: "t3",
    name: "Sathish K.",
    detail: "First deadlift 60 kg, now 160 kg",
    quote:
      "Karthick wrote me a programme on day one and made me stick to it when I wanted to max out every week. The numbers came because of that, not in spite of it.",
    since: "Member since 2023",
  },
  {
    id: "t4",
    name: "Deepa V.",
    detail: "Four treks and counting",
    quote:
      "I joined to lose weight and ended up on top of Kolli Hills at sunrise with twenty people from the gym. That was not on my list when I signed up.",
    since: "Member since 2025",
  },
];

/* ------------------------------------------------------------------ */
/* Gallery                                                            */
/* ------------------------------------------------------------------ */

/** CONFIRM — replace with real photos of the floor, in /public/gallery */
export const gallery = [
  { src: "/gallery/floor-01.jpg", alt: "Free weights floor at Fitness 7" },
  { src: "/gallery/floor-02.jpg", alt: "Members on the cardio deck" },
  { src: "/gallery/floor-03.jpg", alt: "Functional training rig" },
  { src: "/gallery/floor-04.jpg", alt: "Group class in the studio" },
  { src: "/gallery/floor-05.jpg", alt: "Coach spotting a squat" },
  { src: "/gallery/floor-06.jpg", alt: "Trek group at the summit" },
];

/* ------------------------------------------------------------------ */
/* FAQ                                                                */
/* ------------------------------------------------------------------ */

export type Faq = { q: string; a: string };

/** CONFIRM — the answers, especially fees and joining terms */
export const faqs: Faq[] = [
  {
    q: "Can I try before I join?",
    a: "Yes. Walk in during open hours and train a full session with a coach on the floor. No card and no sign-up — decide afterwards.",
  },
  {
    q: "I have never trained before. Will I be out of place?",
    a: "About a third of the people on the floor started in the last year. Every membership includes an induction session where a coach takes you through the machines, the free weights and a starting programme.",
  },
  {
    q: "Is there a separate time for women?",
    a: "The full floor is reserved for women from 11:00 AM to 1:00 PM, Monday to Saturday, with a woman trainer on duty. Outside those hours it is a unisex floor.",
  },
  {
    q: "Is there a joining or admission fee?",
    a: "No joining fee. The price on the membership card is what you pay.",
  },
  {
    q: "Do I need to be fit to come on a trek?",
    a: "Not for the easy ones — Yercaud is walkable by anyone who can manage a few hours on their feet. For the challenging treks we put you on a six-week conditioning block first, and that is included in your membership.",
  },
  {
    q: "Can I freeze my membership?",
    a: "Quarterly and annual members can freeze for up to 30 days a year for travel, illness or work. Tell us before the break starts.",
  },
  {
    q: "What should I bring on day one?",
    a: "Training shoes, a towel and a water bottle. Lockers and showers are on site, both sides.",
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                         */
/* ------------------------------------------------------------------ */

export const navLinks = [
  { href: "#classes", label: "Classes" },
  { href: "#trek", label: "Trekking" },
  { href: "#trainers", label: "Trainers" },
  { href: "#pricing", label: "Membership" },
  { href: "#contact", label: "Visit" },
] as const;
