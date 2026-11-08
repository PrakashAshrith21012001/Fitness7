/**
 * Photos for the hero stage, shown in order and cross-faded every 7 s.
 * Add more by dropping a 4:5 JPG in public/hero/ and a line here
 * (blur = a 16×20 WebP data URL, made with: python3 web/scripts/blur.py).
 */
export type HeroPhoto = {
  src: string;
  alt: string;
  programme: string;
  move: string;
  works: string[];
  /** CSS object-position, so the person stays in frame on phones */
  focus: string;
  blur: string;
};

export const HERO_PHOTOS: HeroPhoto[] = [
  {
    src: "/hero/1-ropes.jpg",
    alt: "A member doing battle-rope waves at Fitness 7",
    programme: "HIIT",
    move: "Battle ropes",
    works: ["Shoulders", "Core", "Conditioning"],
    focus: "42% 30%",
    blur: "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAADQBACdASoQABQAPtFUo0uoJKMhsAgBABoJZQBTBmfxUgRfApWqPuK2kM5i4Bf8IAD7ZfoLRYf6jNz27UbKmLukQtQGOTRSn2eDEW4IxIiSAbBkJWDCNpwyqk30b2fVZ2YW4ZR7QWgq50aBkJJRmOxkL3fyB0fGsDTKwzIB+LnOBeHEdX8rIId/XmN2YPsFRIYUEIQEslDeATn9hG0rcJSAx4IAAA==",
  },
];
