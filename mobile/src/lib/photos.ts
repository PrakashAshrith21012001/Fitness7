import type { ImageSourcePropType } from "react-native";
import type { Trek } from "@f7/content";

/**
 * The gym's own photos, bundled with the app so every screen is photo-led
 * offline and on first open. Classes map by id; treks use the cover the
 * owner uploaded from /admin when there is one, else the ridge shot.
 * `photo(name)` resolves the string names used by shared/feed.ts.
 */

const CLASS: Record<string, ImageSourcePropType> = {
  strength: require("@/assets/photos/strength.jpg"),
  hiit: require("@/assets/photos/hiit.jpg"),
  crossfit: require("@/assets/photos/crossfit.jpg"),
  cardio: require("@/assets/photos/cardio.jpg"),
  yoga: require("@/assets/photos/yoga.jpg"),
  ladies: require("@/assets/photos/ladies.jpg"),
  personal: require("@/assets/photos/personal.jpg"),
  combat: require("@/assets/photos/combat.jpg"),
};

export const gymPhotos = {
  floor: require("@/assets/photos/gym-floor.jpg") as ImageSourcePropType,
  weights: require("@/assets/photos/gym-weights.jpg") as ImageSourcePropType,
  trek: require("@/assets/photos/trek.jpg") as ImageSourcePropType,
  hero: require("@/assets/photos/hero.jpg") as ImageSourcePropType,
};

/**
 * Campaign photos (Oct 2026 HD set) for Home, Treks, Transform and the
 * tracker. Names match the slots in the image-prompt sheet. Metro needs
 * literal requires.
 */
const CAMPAIGN: Record<string, ImageSourcePropType> = {
  "treks-hero": require("@/assets/photos/treks-hero.jpg"),
  "hero-bottle": require("@/assets/photos/home/hero-bottle.jpg"),
  "hero-trek": require("@/assets/photos/home/hero-trek.jpg"),
  "hero-pt": require("@/assets/photos/home/hero-pt.jpg"),
  "store-strip": require("@/assets/photos/home/store-strip.jpg"),
  "discover-yoga": require("@/assets/photos/discover/yoga.jpg"),
  "discover-treks": require("@/assets/photos/discover/treks.jpg"),
  "discover-ladies": require("@/assets/photos/discover/ladies.jpg"),
  "discover-pt": require("@/assets/photos/discover/pt.jpg"),
  "discover-weight-loss": require("@/assets/photos/discover/weight-loss.jpg"),
  "discover-apparel": require("@/assets/photos/discover/apparel.jpg"),
  "discover-accessories": require("@/assets/photos/discover/accessories.jpg"),
  "discover-shoes": require("@/assets/photos/discover/shoes.jpg"),
  "fitedit-strength-coach": require("@/assets/photos/fitedit/strength-coach.jpg"),
  "fitedit-iron-levels": require("@/assets/photos/fitedit/iron-levels.jpg"),
  "fitedit-ladies-hour": require("@/assets/photos/fitedit/ladies-hour.jpg"),
  "fitway-eat-better": require("@/assets/photos/fitway/eat-better.jpg"),
  "fitway-sleep": require("@/assets/photos/fitway/sleep.jpg"),
  "recipe-one-pot": require("@/assets/photos/recipes/one-pot-hero.jpg"),
  "recipe-kappi-tiramisu": require("@/assets/photos/recipes/kappi-tiramisu.jpg"),
  "recipe-oats-bibimbap": require("@/assets/photos/recipes/oats-bibimbap.jpg"),
  "recipe-ragi-dosa": require("@/assets/photos/recipes/ragi-dosa.jpg"),
  "people-trekker": require("@/assets/photos/people/trekker.jpg"),
  "people-lifter": require("@/assets/photos/people/lifter.jpg"),
  "transform-centre": require("@/assets/photos/transform/centre.jpg"),
};

const BY_NAME: Record<string, ImageSourcePropType> = {
  ...CLASS,
  ...CAMPAIGN,
  "gym-floor": gymPhotos.floor,
  "gym-weights": gymPhotos.weights,
  trek: gymPhotos.trek,
  hero: gymPhotos.hero,
};

/** True when a bundled photo exists under this name. */
export function hasPhoto(name: string): boolean {
  return name in BY_NAME;
}

export function classPhoto(id: string): ImageSourcePropType {
  return CLASS[id] ?? gymPhotos.weights;
}

/** Any photo by its short name ("strength", "trek", "gym-floor" …). */
export function photo(name: string): ImageSourcePropType {
  return BY_NAME[name] ?? gymPhotos.floor;
}

export function trekPhoto(trek: Pick<Trek, "image">): ImageSourcePropType {
  return trek.image && /^https?:/.test(trek.image) ? { uri: trek.image } : gymPhotos.trek;
}
