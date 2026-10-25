/**
 * The app's HD photo set, copied 1:1 from mobile/assets/photos into
 * web/public/photos so the site and the app show the same pictures.
 * `photo(name)` takes the same short names shared/feed.ts uses
 * ("hero-trek", "discover-yoga", "strength" …) and mirrors
 * mobile/src/lib/photos.ts — add a photo in both places.
 */

const CLASS: Record<string, string> = {
  strength: "/photos/strength.jpg",
  hiit: "/photos/hiit.jpg",
  crossfit: "/photos/crossfit.jpg",
  cardio: "/photos/cardio.jpg",
  yoga: "/photos/yoga.jpg",
  ladies: "/photos/ladies.jpg",
  personal: "/photos/personal.jpg",
  combat: "/photos/combat.jpg",
};

const CAMPAIGN: Record<string, string> = {
  hero: "/photos/hero.jpg",
  trek: "/photos/trek.jpg",
  "gym-floor": "/photos/gym-floor.jpg",
  "gym-weights": "/photos/gym-weights.jpg",
  "treks-hero": "/photos/treks-hero.jpg",
  "hero-bottle": "/photos/home/hero-bottle.jpg",
  "hero-trek": "/photos/home/hero-trek.jpg",
  "hero-pt": "/photos/home/hero-pt.jpg",
  "store-strip": "/photos/home/store-strip.jpg",
  "discover-yoga": "/photos/discover/yoga.jpg",
  "discover-treks": "/photos/discover/treks.jpg",
  "discover-ladies": "/photos/discover/ladies.jpg",
  "discover-pt": "/photos/discover/pt.jpg",
  "discover-weight-loss": "/photos/discover/weight-loss.jpg",
  "discover-apparel": "/photos/discover/apparel.jpg",
  "discover-accessories": "/photos/discover/accessories.jpg",
  "discover-shoes": "/photos/discover/shoes.jpg",
  "fitedit-strength-coach": "/photos/fitedit/strength-coach.jpg",
  "fitedit-iron-levels": "/photos/fitedit/iron-levels.jpg",
  "fitedit-ladies-hour": "/photos/fitedit/ladies-hour.jpg",
  "fitway-eat-better": "/photos/fitway/eat-better.jpg",
  "fitway-sleep": "/photos/fitway/sleep.jpg",
  "recipe-one-pot": "/photos/recipes/one-pot-hero.jpg",
  "recipe-kappi-tiramisu": "/photos/recipes/kappi-tiramisu.jpg",
  "recipe-oats-bibimbap": "/photos/recipes/oats-bibimbap.jpg",
  "recipe-ragi-dosa": "/photos/recipes/ragi-dosa.jpg",
  "people-trekker": "/photos/people/trekker.jpg",
  "people-lifter": "/photos/people/lifter.jpg",
  "transform-centre": "/photos/transform/centre.jpg",
};

const BY_NAME: Record<string, string> = { ...CLASS, ...CAMPAIGN };

export function photo(name: string): string {
  return BY_NAME[name] ?? CAMPAIGN["gym-floor"];
}

export function classPhoto(id: string): string {
  return CLASS[id] ?? CAMPAIGN["gym-weights"];
}

/** A trek's own cover when the owner uploaded one from /admin, else the ridge shot. */
export function trekPhoto(image: string | undefined): string {
  return image && /^https?:/.test(image) ? image : CAMPAIGN.trek;
}

/**
 * The app's routes, as places on this page. Feed content in shared/ links to
 * app routes ("/store", "/class/yoga"); the site turns them into anchors.
 */
export function routeToAnchor(route: string): string {
  if (route.startsWith("/treks") || route.startsWith("/trek")) return "#treks";
  if (route.startsWith("/class/personal")) return "#coaches";
  if (route.startsWith("/class") || route.startsWith("/fitness") || route.startsWith("/classes")) return "#classes";
  if (route.startsWith("/transform")) return "#transform";
  if (route.startsWith("/store")) return "#shop";
  if (route.startsWith("/membership") || route.startsWith("/upgrade")) return "#plans";
  if (route.startsWith("/food")) return "#eat-well";
  if (route.startsWith("/visit")) return "#visit";
  return "#top";
}
