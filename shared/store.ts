/**
 * Fitness 7 Store — the catalogue behind the Store tab and the cart.
 * Prices are placeholders (CONFIRM with owner). Images are bundled
 * illustrations in mobile/assets/store/<image>.png.
 */

export type StoreCategory = {
  id: string;
  name: string;
  /** short line under the tile in "Everything Fitness 7" */
  blurb: string;
  image: string;
  /** tile background */
  tint: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceINR: number;
  mrpINR: number;
  /** "1 kg", "1 pc", "Pack of 2" */
  unit: string;
  image: string;
  rating: number;
  reviews: number;
  /** one-word merchandising tag shown as a tiny chip */
  tag?: "bestseller" | "new" | "deal" | "select";
  /** two short selling lines under the name, Zepto-style */
  notes?: string[];
  /** a "Sold by" or "sponsored" line */
  sponsored?: boolean;
};

export const storeCategories: StoreCategory[] = [
  { id: "womens", name: "Women's Wear", blurb: "Tees, tights, sports bras", image: "cat-womens", tint: "#f8d7e8" },
  { id: "mens", name: "Men's Wear", blurb: "Tees, joggers, shorts", image: "cat-mens", tint: "#cfe4ff" },
  { id: "footwear", name: "Footwear", blurb: "Training & running shoes", image: "cat-footwear", tint: "#ffe3c9" },
  { id: "recovery", name: "Recovery", blurb: "Massage guns, rollers", image: "cat-recovery", tint: "#e0d8ff" },
  { id: "cardio", name: "Cardio", blurb: "Ropes, steppers, bikes", image: "cat-cardio", tint: "#d5f5e3" },
  { id: "weights", name: "Gym Weights", blurb: "Dumbbells, plates, bars", image: "cat-weights", tint: "#e9ecf5" },
  { id: "bottles", name: "Bottles", blurb: "Shakers & steel bottles", image: "cat-bottles", tint: "#d8f0ff" },
  { id: "yoga", name: "Yoga", blurb: "Mats, blocks, straps", image: "cat-yoga", tint: "#ffd9d9" },
  { id: "nutrition", name: "Nutrition", blurb: "Whey, creatine, bars", image: "cat-nutrition", tint: "#fff2c9" },
];

export const products: Product[] = [
  // nutrition
  { id: "whey-1kg", name: "Fitness 7 Whey Protein · Chocolate", brand: "F7 Nutrition", category: "nutrition", priceINR: 2199, mrpINR: 3299, unit: "1 kg", image: "p-whey", rating: 4.6, reviews: 312, tag: "bestseller", notes: ["24 g protein per scoop", "No added sugar"] },
  { id: "whey-2kg", name: "Fitness 7 Whey Protein · Vanilla", brand: "F7 Nutrition", category: "nutrition", priceINR: 3999, mrpINR: 6199, unit: "2 kg", image: "p-whey-vanilla", rating: 4.5, reviews: 148, notes: ["24 g protein per scoop", "Lab tested"] },
  { id: "creatine", name: "Micronised Creatine Monohydrate", brand: "F7 Nutrition", category: "nutrition", priceINR: 749, mrpINR: 1199, unit: "250 g", image: "p-creatine", rating: 4.7, reviews: 521, tag: "select", notes: ["Unflavoured", "83 servings"] },
  { id: "peanut-butter", name: "High Protein Peanut Butter · Crunchy", brand: "F7 Nutrition", category: "nutrition", priceINR: 349, mrpINR: 499, unit: "1 kg", image: "p-peanut", rating: 4.4, reviews: 908, notes: ["30 g protein per 100 g", "No palm oil"] },
  { id: "protein-bar", name: "Protein Bar · Choco Almond", brand: "F7 Nutrition", category: "nutrition", priceINR: 99, mrpINR: 149, unit: "1 pc (60 g)", image: "p-bar", rating: 4.2, reviews: 1204, tag: "deal", notes: ["20 g protein", "Gluten free"] },
  { id: "electrolyte", name: "Electrolyte Sachets · Lemon", brand: "F7 Nutrition", category: "nutrition", priceINR: 199, mrpINR: 299, unit: "Pack of 10", image: "p-electrolyte", rating: 4.3, reviews: 233, notes: ["Zero sugar", "Trek-day essential"] },
  { id: "oats", name: "Rolled Oats", brand: "Daily Good", category: "nutrition", priceINR: 189, mrpINR: 249, unit: "1 kg", image: "p-oats", rating: 4.5, reviews: 640, notes: ["100% whole grain"] },
  { id: "bcaa", name: "BCAA 2:1:1 · Watermelon", brand: "F7 Nutrition", category: "nutrition", priceINR: 899, mrpINR: 1499, unit: "250 g", image: "p-bcaa", rating: 4.1, reviews: 77, notes: ["Intra-workout"] },
  // bottles
  { id: "shaker", name: "F7 Shaker Bottle", brand: "Fitness 7", category: "bottles", priceINR: 249, mrpINR: 499, unit: "700 ml", image: "p-shaker", rating: 4.6, reviews: 2210, tag: "bestseller", notes: ["Leak-proof", "BPA free"] },
  { id: "steel-bottle", name: "Insulated Steel Bottle · Black", brand: "Fitness 7", category: "bottles", priceINR: 799, mrpINR: 1299, unit: "1 L", image: "p-bottle", rating: 4.7, reviews: 389, tag: "new", notes: ["Cold for 24 h", "Stainless steel"] },
  { id: "sipper", name: "Gym Sipper · Pink", brand: "Fitness 7", category: "bottles", priceINR: 349, mrpINR: 599, unit: "1.5 L", image: "p-sipper", rating: 4.3, reviews: 156 },
  // recovery
  { id: "massage-gun", name: "Deep Tissue Massage Gun", brand: "F7 Recover", category: "recovery", priceINR: 3499, mrpINR: 8999, unit: "1 pc", image: "p-massagegun", rating: 4.5, reviews: 412, tag: "deal", notes: ["6 heads", "5 speeds"] },
  { id: "foam-roller", name: "Foam Roller · Textured", brand: "F7 Recover", category: "recovery", priceINR: 699, mrpINR: 1299, unit: "45 cm", image: "p-roller", rating: 4.4, reviews: 233 },
  { id: "posture", name: "Align Flex Posture Corrector", brand: "F7 Recover", category: "recovery", priceINR: 649, mrpINR: 2399, unit: "1 pc", image: "p-posture", rating: 4.9, reviews: 9, notes: ["Adjustable"] },
  { id: "knee-sleeve", name: "Knee Sleeves · Pair", brand: "F7 Recover", category: "recovery", priceINR: 899, mrpINR: 1499, unit: "Pair", image: "p-knee", rating: 4.6, reviews: 120 },
  // yoga
  { id: "yoga-mat", name: "TPE Yoga Mat 6 mm · Rose", brand: "Fitness 7", category: "yoga", priceINR: 1099, mrpINR: 3699, unit: "1 pc", image: "p-mat", rating: 4.7, reviews: 20, tag: "bestseller", notes: ["Non-slip", "Carry strap"] },
  { id: "yoga-block", name: "Cork Yoga Blocks · Pair", brand: "Fitness 7", category: "yoga", priceINR: 549, mrpINR: 899, unit: "Pair", image: "p-block", rating: 4.5, reviews: 64 },
  { id: "yoga-strap", name: "Stretch Strap", brand: "Fitness 7", category: "yoga", priceINR: 249, mrpINR: 399, unit: "1 pc", image: "p-strap", rating: 4.3, reviews: 41 },
  // weights
  { id: "db-5", name: "Hex Dumbbells · Pair", brand: "F7 Iron", category: "weights", priceINR: 1899, mrpINR: 2599, unit: "5 kg × 2", image: "p-dumbbell", rating: 4.8, reviews: 88 },
  { id: "kettlebell-12", name: "Cast Iron Kettlebell", brand: "F7 Iron", category: "weights", priceINR: 2299, mrpINR: 2999, unit: "12 kg", image: "p-kettlebell", rating: 4.7, reviews: 52 },
  { id: "adj-db", name: "Adjustable Dumbbell 2–24 kg", brand: "F7 Iron", category: "weights", priceINR: 12999, mrpINR: 19999, unit: "1 pc", image: "p-adjdb", rating: 4.6, reviews: 31, tag: "new" },
  { id: "wrist-wraps", name: "Wrist Wraps · Pair", brand: "F7 Iron", category: "weights", priceINR: 399, mrpINR: 699, unit: "Pair", image: "p-wraps", rating: 4.5, reviews: 210 },
  { id: "lifting-belt", name: "Leather Lifting Belt", brand: "F7 Iron", category: "weights", priceINR: 1499, mrpINR: 2499, unit: "1 pc", image: "p-belt", rating: 4.8, reviews: 143, tag: "select" },
  // cardio
  { id: "jump-rope", name: "Speed Jump Rope", brand: "Fitness 7", category: "cardio", priceINR: 349, mrpINR: 699, unit: "1 pc", image: "p-rope", rating: 4.4, reviews: 511, tag: "deal" },
  { id: "walkpad", name: "F7 Vibe 3-in-1 Walking Pad", brand: "F7 Cardio", category: "cardio", priceINR: 13999, mrpINR: 25999, unit: "1 pc", image: "p-walkpad", rating: 4.5, reviews: 76, notes: ["Foldable", "Up to 6 km/h"] },
  { id: "resistance-bands", name: "Resistance Bands · Set of 5", brand: "Fitness 7", category: "cardio", priceINR: 499, mrpINR: 999, unit: "Set", image: "p-bands", rating: 4.6, reviews: 803 },
  // apparel
  { id: "tee-black", name: "Fitness 7 Training Tee · Black", brand: "Fitness 7", category: "mens", priceINR: 599, mrpINR: 999, unit: "1 pc", image: "p-tee", rating: 4.5, reviews: 340, tag: "bestseller" },
  { id: "joggers", name: "Men's Tapered Joggers", brand: "Fitness 7", category: "mens", priceINR: 1199, mrpINR: 1999, unit: "1 pc", image: "p-joggers", rating: 4.4, reviews: 122 },
  { id: "shorts", name: "Men's 7\" Training Shorts", brand: "Fitness 7", category: "mens", priceINR: 749, mrpINR: 1299, unit: "1 pc", image: "p-shorts", rating: 4.3, reviews: 98 },
  { id: "sports-bra", name: "High Support Sports Bra", brand: "Fitness 7", category: "womens", priceINR: 899, mrpINR: 1499, unit: "1 pc", image: "p-bra", rating: 4.6, reviews: 267, tag: "new" },
  { id: "tights", name: "Women's Sculpt Tights", brand: "Fitness 7", category: "womens", priceINR: 1299, mrpINR: 2199, unit: "1 pc", image: "p-tights", rating: 4.7, reviews: 188 },
  { id: "tank", name: "Women's Racerback Tank", brand: "Fitness 7", category: "womens", priceINR: 549, mrpINR: 899, unit: "1 pc", image: "p-tank", rating: 4.4, reviews: 91 },
  { id: "trainer-shoe", name: "F7 Flex Trainer", brand: "Fitness 7", category: "footwear", priceINR: 2999, mrpINR: 4999, unit: "1 pair", image: "p-shoe", rating: 4.5, reviews: 210, tag: "select" },
  { id: "runner-shoe", name: "F7 Glide Runner", brand: "Fitness 7", category: "footwear", priceINR: 3499, mrpINR: 5999, unit: "1 pair", image: "p-runner", rating: 4.6, reviews: 163 },
  { id: "socks", name: "Cushioned Ankle Socks · 3 pack", brand: "Fitness 7", category: "footwear", priceINR: 299, mrpINR: 499, unit: "Pack of 3", image: "p-socks", rating: 4.5, reviews: 720, tag: "deal" },
  { id: "gym-bag", name: "F7 Duffle Bag · 35 L", brand: "Fitness 7", category: "mens", priceINR: 1499, mrpINR: 2499, unit: "1 pc", image: "p-bag", rating: 4.7, reviews: 94 },
  { id: "gloves", name: "Lifting Gloves", brand: "Fitness 7", category: "weights", priceINR: 449, mrpINR: 799, unit: "Pair", image: "p-gloves", rating: 4.3, reviews: 156 },
];

export const productById = (id: string) => products.find((p) => p.id === id);
export const productsIn = (category: string) => products.filter((p) => p.category === category);
export const dealProducts = () => products.filter((p) => p.mrpINR / p.priceINR >= 1.6);
export const bestsellers = () => products.filter((p) => p.tag === "bestseller" || p.reviews > 500);
export const offPct = (p: Pick<Product, "priceINR" | "mrpINR">) => Math.round((1 - p.priceINR / p.mrpINR) * 100);

/* ---------------- offers ---------------- */

export type Coupon = { code: string; title: string; detail: string; minOrderINR: number; offINR: number; kind: "coupon" | "payment" };
export const coupons: Coupon[] = [
  { code: "F7SAVE50", title: "Save ₹50 with F7SAVE50", detail: "Shop for ₹899 more to apply", minOrderINR: 1200, offINR: 50, kind: "coupon" },
  { code: "F7CRED", title: "Get flat ₹15 off with CRED UPI", detail: "Shop for ₹206 more to apply", minOrderINR: 500, offINR: 15, kind: "payment" },
  { code: "F7100", title: "₹100 off on your first order", detail: "Orders above ₹1,499", minOrderINR: 1499, offINR: 100, kind: "coupon" },
];

/** Free delivery is unlocked above this; the fee under it. */
export const delivery = { freeAboveINR: 999, feeINR: 40, handlingINR: 10, etaMinutes: 45, storeLine: "Fitness 7 Gym, TS Square · Dharmapuri" } as const;

/** Milestones on the cart's progress strip: free delivery, then coupons. */
export const cartMilestones = [
  { atINR: 999, label: "Free Delivery", sub: `Save ₹${delivery.feeINR}` },
  { atINR: 1200, label: "₹50 OFF", sub: "Coupon" },
  { atINR: 1999, label: "₹100 OFF", sub: "Coupon" },
  { atINR: 2999, label: "₹150 OFF", sub: "Coupon" },
] as const;

export const tipOptions = [10, 35, 50] as const;
export const deliveryInstructions = [
  { id: "security", label: "Leave with security", icon: "shield-checkmark-outline" },
  { id: "door", label: "Leave at the door", icon: "home-outline" },
  { id: "bell", label: "Do not ring bell", icon: "notifications-off-outline" },
  { id: "pets", label: "Beware of pets", icon: "paw-outline" },
] as const;

/* ---------------- store front ---------------- */

export const storeBanners = [
  { id: "price-drop", eyebrow: "PRICE DROP SALE", title: "Lowest prices", sub: "Extra ₹500 off on orders above ₹3,999", cta: "Shop now", tint: "#f5e6c8", image: "banner-price-drop", categoryId: "recovery" },
  { id: "walkpad", eyebrow: "NEW", title: "Shop F7 Vibe 3-in-1 Walking Pad", sub: "Only at ₹13,999  ₹25,999", cta: "Shop now", tint: "#e0eaff", image: "banner-walkpad", categoryId: "cardio" },
  { id: "whey", eyebrow: "MEMBERS ONLY", title: "Whey at member price", sub: "₹2,199 for 1 kg · pick up at the gym", cta: "Shop now", tint: "#fde4ec", image: "banner-whey", categoryId: "nutrition" },
];

export const storeMenu: { title: string; items: string[] }[] = [
  { title: "Men's Sportswear", items: ["Men's Footwear", "Men's T-shirts", "Men's Shorts", "Men's Joggers & Track Pants", "Men's Jackets & Sweatshirts", "Men's Tank Tops", "Men's Co-ords"] },
  { title: "Women's Sportswear", items: ["Women's Footwear", "Women's Sport T-shirts", "Women's Tank Tops", "Tights", "Sports Bra", "Women's Shorts", "Women's Joggers & Track Pants"] },
  { title: "Gym Equipment", items: ["Treadmill", "Walkpad", "Exercise Bike", "Gym Weights", "Workout Bench", "Dumbbells", "Kettlebells"] },
  { title: "Gym Accessories", items: ["Gym Bottles", "Bags", "Boxing Accessories", "Sports Socks", "Yoga Accessories", "Weighing Scale", "Lifting Belts"] },
  { title: "Nutrition", items: ["Whey Protein", "Creatine", "Peanut Butter", "Protein Bars", "Electrolytes"] },
];
