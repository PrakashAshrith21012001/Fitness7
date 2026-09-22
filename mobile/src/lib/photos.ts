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

const BY_NAME: Record<string, ImageSourcePropType> = {
  ...CLASS,
  "gym-floor": gymPhotos.floor,
  "gym-weights": gymPhotos.weights,
  trek: gymPhotos.trek,
  hero: gymPhotos.hero,
};

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
