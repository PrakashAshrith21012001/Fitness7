import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import type { MuscleGroup } from "@f7/content";

/**
 * The cult.fit muscle map: two stylised silhouettes (front and back), every
 * muscle region its own path. Regions in `muscles` light up green with a
 * soft outer glow; the rest stay a dark translucent grey so the body still
 * reads. `MuscleMapMini` is the single front figure the class page uses for
 * "Focus for Today", lit in blue-cyan.
 *
 * Every figure lives in a 200 × 400 viewBox. Left-side regions are authored
 * once and mirrored with a transform, so the two halves always match.
 */

const GREEN = "#3ddc84";
const BODY_FILL = "rgba(255,255,255,0.10)";
const BODY_STROKE = "rgba(255,255,255,0.28)";
const DARK_REGION = "rgba(255,255,255,0.06)";
const DARK_EDGE = "rgba(255,255,255,0.18)";

/** whole-body outline, front and back share it */
const BODY =
  "M100,10 C112,10 118,20 118,32 C118,42 113,52 106,56 L106,64 C120,66 136,70 146,76 C158,84 162,100 164,118 L172,172 L178,218 C180,226 168,230 164,224 L154,176 L146,130 L144,160 L140,208 C138,214 132,218 126,222 L130,260 L128,320 L126,392 L110,392 L106,330 L102,250 L100,236 L98,250 L94,330 L90,392 L74,392 L72,320 L70,260 L74,222 C68,218 62,214 60,208 L56,160 L54,130 L46,176 L36,224 C32,230 20,226 22,218 L28,172 L36,118 C38,100 42,84 54,76 C64,70 80,66 94,64 L94,56 C87,52 82,42 82,32 C82,20 88,10 100,10 Z";

/** left-half regions (mirrored for the right side) and centre regions */
type Region = { d: string; side: "left" | "centre" };
const FRONT: Partial<Record<MuscleGroup, Region[]>> = {
  chest: [{ side: "left", d: "M72,80 C82,76 96,78 98,82 L98,108 C90,114 74,112 68,104 C64,96 66,86 72,80 Z" }],
  shoulders: [{ side: "left", d: "M58,72 C64,68 72,70 72,78 C70,90 64,98 56,100 C46,98 44,86 48,78 Z" }],
  biceps: [{ side: "left", d: "M46,104 C54,101 60,106 58,118 L52,144 C46,148 40,144 40,136 L42,114 Z" }],
  forearms: [{ side: "left", d: "M40,150 C46,147 52,151 51,160 L42,204 C38,208 30,206 30,198 L35,158 Z" }],
  abs: [
    { side: "centre", d: "M85,114 L98,114 L98,132 L85,132 Z M102,114 L115,114 L115,132 L102,132 Z" },
    { side: "centre", d: "M85,136 L98,136 L98,154 L85,154 Z M102,136 L115,136 L115,154 L102,154 Z" },
    { side: "centre", d: "M85,158 L98,158 L98,178 C94,184 88,184 85,178 Z M102,158 L115,158 L115,178 C112,184 106,184 102,178 Z" },
  ],
  obliques: [{ side: "left", d: "M70,118 L81,120 L81,182 C76,186 68,178 66,160 Z" }],
  quads: [{ side: "left", d: "M64,222 C76,216 92,220 96,228 L92,300 C86,312 70,314 64,302 L58,244 Z" }],
  calves: [{ side: "left", d: "M64,320 C72,316 84,318 86,326 L82,376 C78,382 68,382 64,376 Z" }],
};

const BACK: Partial<Record<MuscleGroup, Region[]>> = {
  shoulders: [{ side: "left", d: "M58,72 C64,68 72,70 72,78 C70,90 64,98 56,100 C46,98 44,86 48,78 Z" }],
  "upper-back": [{ side: "centre", d: "M76,68 L124,68 L134,80 L120,118 L100,124 L80,118 L66,80 Z" }],
  lats: [{ side: "left", d: "M66,96 L82,122 L88,162 C80,168 68,164 62,146 Z" }],
  "lower-back": [{ side: "centre", d: "M88,152 L112,152 L112,192 C108,198 92,198 88,192 Z" }],
  triceps: [{ side: "left", d: "M46,104 C54,101 60,106 58,118 L52,144 C46,148 40,144 40,136 L42,114 Z" }],
  forearms: [{ side: "left", d: "M40,150 C46,147 52,151 51,160 L42,204 C38,208 30,206 30,198 L35,158 Z" }],
  glutes: [{ side: "left", d: "M64,198 C78,192 96,196 98,206 L96,238 C88,246 68,244 62,230 Z" }],
  hamstrings: [{ side: "left", d: "M62,248 C74,242 92,246 94,254 L90,318 C84,324 68,324 62,314 Z" }],
  calves: [{ side: "left", d: "M62,328 C72,322 84,326 86,334 L82,378 C76,384 66,384 62,378 Z" }],
};

function Figure({ regions, lit, tint, glow, width }: { regions: Partial<Record<MuscleGroup, Region[]>>; lit: Set<MuscleGroup>; tint: string; glow: boolean; width: number }) {
  const entries = Object.entries(regions) as [MuscleGroup, Region[]][];
  const draw = (r: Region, key: string, on: boolean) => {
    const el = (mirror: boolean) => (
      <G key={`${key}-${mirror ? "r" : "l"}`} transform={mirror ? "translate(200,0) scale(-1,1)" : undefined}>
        {on && glow ? <Path d={r.d} fill="none" stroke={tint} strokeWidth={8} strokeOpacity={0.28} strokeLinejoin="round" /> : null}
        <Path d={r.d} fill={on ? tint : DARK_REGION} fillOpacity={on ? 0.95 : 1} stroke={on ? tint : DARK_EDGE} strokeWidth={on ? 0.8 : 0.6} strokeLinejoin="round" />
      </G>
    );
    if (r.side === "centre") return el(false);
    return [el(false), el(true)];
  };
  return (
    <Svg width={width} height={width * 2} viewBox="0 0 200 400">
      <Path d={BODY} fill={BODY_FILL} stroke={BODY_STROKE} strokeWidth={1.2} strokeLinejoin="round" />
      {entries.map(([m, list]) => list.map((r, i) => draw(r, `${m}-${i}`, lit.has(m))))}
    </Svg>
  );
}

export function MuscleMap({ muscles, width = 220, glow = true, tint = GREEN }: { muscles: MuscleGroup[]; width?: number; glow?: boolean; tint?: string }) {
  const lit = new Set(muscles);
  const gap = 12;
  const w = Math.floor((width - gap) / 2);
  return (
    <View accessibilityRole="image" accessibilityLabel={muscles.length ? `Muscles trained: ${muscles.join(", ")}` : "No muscles trained yet"} style={{ width, flexDirection: "row", gap, justifyContent: "center" }}>
      <Figure regions={FRONT} lit={lit} tint={tint} glow={glow} width={w} />
      <Figure regions={BACK} lit={lit} tint={tint} glow={glow} width={w} />
    </View>
  );
}

/** Single front figure for "Focus for Today" — lit blue-cyan by default. */
export function MuscleMapMini({ muscles, width = 120, tint = "#4cc9ff", glow = true }: { muscles: MuscleGroup[]; width?: number; tint?: string; glow?: boolean }) {
  const lit = new Set(muscles);
  // muscles that only show from the back are lit on the front's neighbours so the figure never looks empty
  if (lit.has("lats") || lit.has("upper-back")) lit.add("shoulders");
  if (lit.has("triceps")) lit.add("biceps");
  if (lit.has("hamstrings") || lit.has("glutes")) lit.add("quads");
  if (lit.has("lower-back")) lit.add("obliques");
  return (
    <View accessibilityRole="image" accessibilityLabel={`Focus: ${muscles.join(", ")}`} style={{ width, alignSelf: "center" }}>
      <Figure regions={FRONT} lit={lit} tint={tint} glow={glow} width={width} />
    </View>
  );
}
