import Svg, { Path, Polygon } from "react-native-svg";

/**
 * The cult.fit landscape strips: layered ridges with a pine line in front.
 * `sunset` sits under the squad leaderboard bar in the weekly-activity sheet;
 * `forest` heads and closes the green squad leaderboard page.
 * Shapes are fixed (no randomness) so the strip never jumps between renders.
 */

const PALETTES = {
  sunset: { far: "#e7a3ad", mid: "#c98a9f", near: "#4b5b7c", trees: "#2c3a58", base: "#283152" },
  forest: { far: "#4f8f7a", mid: "#3f7c66", near: "#2d634e", trees: "#1f4a39", base: "#1d4636" },
  footer: { far: "#456f8f", mid: "#3c5f80", near: "#5f9a8a", trees: "#2a3f5a", base: "#5a9884" },
} as const;

// pine positions (x in 0–100) and heights; two rows
const TREES: [number, number][] = [
  [2, 16], [5, 22], [8, 14], [14, 10], [22, 18], [27, 12], [33, 9], [41, 15], [47, 11], [55, 8], [61, 13], [68, 9], [74, 16], [79, 12], [86, 20], [90, 14], [96, 10],
];

export function Ridges({ width, height = 110, variant = "sunset" }: { width: number; height?: number; variant?: keyof typeof PALETTES }) {
  const c = PALETTES[variant];
  const h = height;
  const x = (p: number) => (p / 100) * width;
  const y = (p: number) => (p / 100) * h;
  const far = `M0,${y(38)} L${x(14)},${y(26)} L${x(30)},${y(34)} L${x(48)},${y(20)} L${x(64)},${y(30)} L${x(80)},${y(18)} L${x(100)},${y(30)} L${x(100)},${h} L0,${h} Z`;
  const mid = `M0,${y(52)} L${x(18)},${y(40)} L${x(36)},${y(50)} L${x(56)},${y(36)} L${x(76)},${y(48)} L${x(100)},${y(40)} L${x(100)},${h} L0,${h} Z`;
  const near = `M0,${y(70)} C${x(20)},${y(62)} ${x(40)},${y(66)} ${x(60)},${y(70)} C${x(76)},${y(73)} ${x(90)},${y(64)} ${x(100)},${y(66)} L${x(100)},${h} L0,${h} Z`;
  return (
    <Svg width={width} height={h} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Path d={far} fill={c.far} />
      <Path d={mid} fill={c.mid} />
      <Path d={near} fill={c.near} />
      {TREES.map(([px, th], i) => {
        const bx = x(px);
        const by = y(i % 2 ? 84 : 78);
        const t = (th / 100) * h * 1.6;
        return <Polygon key={i} points={`${bx},${by - t} ${bx - t * 0.32},${by} ${bx + t * 0.32},${by}`} fill={c.trees} />;
      })}
      <Path d={`M0,${y(82)} L${width},${y(80)} L${width},${h} L0,${h} Z`} fill={c.base} />
    </Svg>
  );
}
