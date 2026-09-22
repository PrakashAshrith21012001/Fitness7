/**
 * Home-feed content: the hero cards, Discover tiles, FIT.EDIT videos,
 * ".fit Way" articles, recipes, quotes and testimonials. Placeholder copy
 * until the owner supplies real posts (CONFIRM).
 */

export type HeroSlide = { id: string; title: string; cta: string; photo: string; route: string };
export const heroSlides: HeroSlide[] = [
  { id: "bottle", title: "Pick your stainless steel hydration warrior.", cta: "Shop now", photo: "gym-weights", route: "/store" },
  { id: "trek", title: "One expedition, every month. Yercaud opens the season.", cta: "Reserve a slot", photo: "trek", route: "/treks" },
  { id: "pt", title: "One coach, one plan, your name on it.", cta: "Try for free", photo: "personal", route: "/fitness" },
];

export type DiscoverTile = { id: string; title: string; sub: string; photo: string; route: string };
export const discover: DiscoverTile[] = [
  { id: "yoga", title: "Yoga circle by Fitness 7", sub: "Daily yoga for everyone", photo: "yoga", route: "/class/yoga" },
  { id: "treks", title: "Treks at Fitness 7", sub: "Explore hills near you", photo: "trek", route: "/treks" },
  { id: "ladies", title: "Ladies-only hours", sub: "Full floor, reserved", photo: "ladies", route: "/class/ladies" },
  { id: "pt", title: "1:1 Personal Training", sub: "Try first session free", photo: "personal", route: "/class/personal" },
  { id: "transform", title: "Weight Loss", sub: "Coaching", photo: "hiit", route: "/transform" },
  { id: "apparel", title: "Apparel", sub: "Starting at ₹499", photo: "gym-floor", route: "/store" },
  { id: "accessories", title: "Accessories", sub: "Starting at ₹199", photo: "gym-weights", route: "/store" },
  { id: "shoes", title: "Sport Shoes", sub: "Starting at ₹1,599", photo: "cardio", route: "/store" },
];

export type Video = { id: string; author: string; role: string; title: string; photo: string; minutes: number };
export const fitEdit: Video[] = [
  { id: "v1", author: "Karthick", role: "trainer", title: "Stepping into my role as a strength coach", photo: "strength", minutes: 4 },
  { id: "v2", author: "Durai", role: "trainer", title: "Boost your iron levels today", photo: "combat", minutes: 3 },
  { id: "v3", author: "Meena S.", role: "member", title: "How the ladies-only hour changed my mornings", photo: "ladies", minutes: 5 },
];

export type Article = { id: string; title: string; sub: string; photo: string; cta: string };
export const fitWay: Article[] = [
  { id: "a1", title: "8 swaps to eat better.", sub: "Sandwiches, chips, wraps, olives", photo: "cardio", cta: "Know more" },
  { id: "a2", title: "Sleep is the missing rep.", sub: "Why 7 hours moves the bar", photo: "yoga", cta: "Know more" },
];

export type Recipe = { id: string; title: string; kcal: number; photo: string };
export const recipes: Recipe[] = [
  { id: "r1", title: "Filter Kappi Tiramisu Cups", kcal: 172, photo: "cardio" },
  { id: "r2", title: "Korean Bibimbap-Style Oats Bowl", kcal: 85, photo: "yoga" },
  { id: "r3", title: "Ragi Dosa with Coconut Chutney", kcal: 210, photo: "hiit" },
];
export const recipeHero = { title: "One pot is all you need!", sub: "Feel-good recipes with oats", cta: "Surprise recipe" };

export type Quote = { id: string; headline: string; body: string; by: string; photo: string };
export const quotes: Quote[] = [
  { id: "q1", headline: "“A JEDI'S STRENGTH FLOWS FROM THE FORCE.”", body: "They say discipline and dedication are the key factors, but patience is a virtue that is absolutely essential!", by: "Ria Ramnarine", photo: "gym-floor" },
  { id: "q2", headline: "“I AM YOUR TRAINER.”", body: "The floor doesn't care how you feel today. It only counts what you did.", by: "Karthick", photo: "strength" },
  { id: "q3", headline: "“IT'S AGAINST MY PROGRAMMING TO LET YOU GIVE UP.”", body: "Every set you don't want to do is the one that counts.", by: "Durai", photo: "crossfit" },
];

export const peopleOf = [
  { id: "p1", name: "Deepa V.", line: "Four treks and counting", photo: "trek" },
  { id: "p2", name: "Sathish K.", line: "60 kg to 160 kg deadlift", photo: "strength" },
];

export type Buddy = { id: string; name: string; initials: string; workouts: number };
export const squad: Buddy[] = [
  { id: "hari", name: "Hari", initials: "HA", workouts: 4 },
  { id: "archu", name: "Archu", initials: "AR", workouts: 6 },
  { id: "gokul", name: "Gokul Mechan", initials: "GM", workouts: 2 },
  { id: "arun", name: "Arun", initials: "AN", workouts: 5 },
];

export const memberPlansCopy = {
  title: "Explore Fitness 7 plans",
  items: [
    { id: "annual", name: "F7 pass ELITE", sub: "Unlimited access to all classes, the floor and one free trek", price: "₹800 / month*", note: "onwards", photo: "strength" },
    { id: "quarterly", name: "F7 pass PRO", sub: "Unlimited access to the floor and all group classes", price: "₹1,000 / month*", note: "onwards", photo: "gym-weights" },
    { id: "monthly", name: "F7 pass PLAY", sub: "Full floor access, month to month", price: "₹1,200 / month*", note: "onwards", photo: "cardio" },
    { id: "personal-training", name: "F7 LUX", sub: "Personal training — one coach, one plan", price: "₹5,000 / month*", note: "onwards", photo: "personal" },
    { id: "home", name: "F7 pass HOME", sub: "At-home workouts with calorie tracking", price: "₹167 / month*", note: "onwards", photo: "yoga" },
  ],
};

export const transformCopy = {
  tabs: [
    { id: "home", label: "At-home" },
    { id: "centre", label: "At-centre" },
    { id: "online", label: "Online PT" },
  ],
  offer: "₹800 gift card + free 1-month extension",
  cta: "Explore Fitness 7 Transform",
  whatYouGet: [
    { title: "Simple & effective weight loss", sub: "A coach checks in every week; the plan changes when you do." },
    { title: "Customised fitness plan", sub: "Built from your numbers, your slot and your goal." },
    { title: "Nutritional guidance", sub: "Indian food, real portions, logged in the app." },
    { title: "Weekly progress review", sub: "Weight, check-ins, food and water in one place." },
  ],
  priceFrom: "₹580 / month",
};
