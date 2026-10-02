import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, Defs, G, Line, Path, Rect, Stop, LinearGradient as SvgGradient, Text as SvgText, Ellipse } from "react-native-svg";
import * as Haptics from "expo-haptics";

/**
 * The calorie tracker's own look — a carbon copy of HealthifyMe's tracker:
 * a white app on a soft mint-and-blush wash, deep teal buttons, orange "+"
 * buttons for food, purple for weight, deep navy for sleep. Like the Store,
 * it keeps this palette in both app themes.
 */
export const hm = {
  bg: "#f5f6f8",
  card: "#ffffff",
  ink: "#1d1d1f",
  ink2: "#3a3a3c",
  sub: "#6e6e73",
  faint: "#a1a1a6",
  line: "#ececf0",
  chip: "#f1f2f4",
  teal: "#1e5a50",
  tealSoft: "#e6f0ed",
  tealLine: "#c9dfd8",
  mint: "#25b67f",
  orange: "#f2711c",
  orangeSoft: "#fff1e6",
  amber: "#f5b301",
  yellowCard: "#fbe39a",
  yellowInk: "#7a5200",
  red: "#e8453c",
  redSoft: "#fdeceb",
  green: "#3aa655",
  purple: "#5b2a86",
  purpleSoft: "#efe7f7",
  navy: "#1a2147",
  navy2: "#232b57",
  navyLine: "#2e3768",
  sleepBlue: "#3d7bfd",
  blue: "#0a84ff",
  rust: "#b3561d",
} as const;

export const hmShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;

export function tap() {
  Haptics.selectionAsync().catch(() => {});
}

/* ------------------------------------------------------------------ */
/* Type                                                               */
/* ------------------------------------------------------------------ */

export function HT({ children, size = 14, weight = "400", color = hm.ink, style, numberOfLines, center }: { children: ReactNode; size?: number; weight?: TextStyle["fontWeight"]; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number; center?: boolean }) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: size, lineHeight: Math.round(size * 1.35), fontWeight: weight, color, textAlign: center ? "center" : undefined }, style]}>
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Page chrome                                                        */
/* ------------------------------------------------------------------ */

/** The tracker's soft mint→blush wash behind Home / Diet. */
export function Wash({ children, style }: { children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flex: 1, backgroundColor: "#f4f7f8" }, style]}>
      <LinearGradient pointerEvents="none" colors={["#e9f5f2", "#f6f3f8", "#fbeef3", "#eef6f7"]} locations={[0, 0.35, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

export function HMHeader({ title, onBack, right, dark, center = true, children }: { title?: ReactNode; onBack?: () => void; right?: ReactNode; dark?: boolean; center?: boolean; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const ink = dark ? "#fff" : hm.ink;
  return (
    <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, paddingBottom: 8, flexDirection: "row", alignItems: "center", minHeight: insets.top + 52 }}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={ink} />
        </Pressable>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <View style={{ flex: 1, alignItems: center ? "center" : "flex-start" }}>
        {typeof title === "string" ? <HT size={17} weight="600" color={ink} numberOfLines={1}>{title}</HT> : title}
        {children}
      </View>
      <View style={{ minWidth: 44, alignItems: "flex-end", flexDirection: "row", justifyContent: "flex-end" }}>{right}</View>
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel, padding = 16 }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string; padding?: number }) {
  const base: StyleProp<ViewStyle> = [{ backgroundColor: hm.card, borderRadius: 16, padding }, hmShadow, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [base, pressed && { opacity: 0.92 }]}>
      {children}
    </Pressable>
  );
}

/** Full-width deep-teal button — "Next", "Add", "Track For Breakfast". */
export function Btn({ label, onPress, disabled, tone = "teal", style, icon, small, busy }: { label: string; onPress: () => void; disabled?: boolean; tone?: "teal" | "black" | "white" | "orange" | "red" | "purple" | "navy"; style?: StyleProp<ViewStyle>; icon?: keyof typeof Ionicons.glyphMap; small?: boolean; busy?: boolean }) {
  const bg = disabled ? "#e3e4e8" : { teal: hm.teal, black: "#111", white: "#fff", orange: hm.rust, red: hm.red, purple: hm.purple, navy: hm.navy }[tone];
  const fg = disabled ? "#a9abb2" : tone === "white" ? hm.ink : "#fff";
  return (
    <Pressable
      onPress={() => {
        if (disabled || busy) return;
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!!disabled}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      style={({ pressed }) => [{ backgroundColor: bg, borderRadius: 10, minHeight: small ? 38 : 50, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }, pressed && !disabled && { opacity: 0.85 }, style]}
    >
      {icon ? <Ionicons name={icon} size={small ? 15 : 18} color={fg} /> : null}
      <HT size={small ? 13 : 15} weight="600" color={fg}>{busy ? "Please wait…" : label}</HT>
    </Pressable>
  );
}

/** Pinned footer for a primary action. */
export function Footer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return <View style={[{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12), backgroundColor: hm.card, borderTopWidth: 1, borderTopColor: hm.line }, style]}>{children}</View>;
}

/** The orange outlined "+" next to every meal and food. */
export function PlusBtn({ onPress, label, color = hm.orange, filled, size = 22 }: { onPress: () => void; label: string; color?: string; filled?: boolean; size?: number }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel={label} hitSlop={10} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
      <View style={{ width: size, height: size, borderRadius: filled ? size / 2 : 6, borderWidth: filled ? 0 : 1.5, borderColor: color, backgroundColor: filled ? color : "transparent", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="add" size={size - 6} color={filled ? "#fff" : color} />
      </View>
    </Pressable>
  );
}

/** Round icon bubble used in tracker rows. */
export function IconBubble({ name, color = hm.ink2, bg = "#f2f3f5", size = 40 }: { name: keyof typeof Ionicons.glyphMap; color?: string; bg?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#eceef2" }}>
      <Ionicons name={name} size={size * 0.45} color={color} />
    </View>
  );
}

/** Thin progress line under macro labels. */
export function Line2({ progress, color = hm.teal, track = "#e9ebef", height = 3, style }: { progress: number; color?: string; track?: string; height?: number; style?: StyleProp<ViewStyle> }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={[{ height, borderRadius: height, backgroundColor: track, overflow: "hidden" }, style]}>
      <View style={{ width: `${p * 100}%`, height, backgroundColor: color, borderRadius: height }} />
    </View>
  );
}

export function Divider({ style, color = hm.line }: { style?: StyleProp<ViewStyle>; color?: string }) {
  return <View style={[{ height: 1, backgroundColor: color }, style]} />;
}

/** Floating mint sparkle — "ask the coach" on every tracker page. */
export function SparkleFab({ onPress, bottom = 24 }: { onPress: () => void; bottom?: number }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole="button" accessibilityLabel="Ask F7 Coach" style={({ pressed }) => [{ position: "absolute", right: 16, bottom, width: 54, height: 54, borderRadius: 14, backgroundColor: hm.mint, alignItems: "center", justifyContent: "center" }, hmShadow, { shadowOpacity: 0.2 }, pressed && { transform: [{ scale: 0.96 }] }]}>
      <Ionicons name="sparkles" size={24} color="#fff" />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet                                                              */
/* ------------------------------------------------------------------ */

/** White bottom sheet with a close ×, grab handle and drag-to-close. */
export function HMSheet({ open, onClose, children, title, scroll, maxHeight = 0.86, dark }: { open: boolean; onClose: () => void; children: ReactNode; title?: string; scroll?: boolean; maxHeight?: number; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  const drag = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60) onClose();
      },
    }),
  ).current;
  const bg = dark ? hm.navy2 : hm.card;
  const ink = dark ? "#fff" : hm.ink;
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.45)" }]} />
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 14, maxHeight: `${maxHeight * 100}%` }}>
          <View {...drag.panHandlers} style={{ height: 22, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: dark ? "rgba(255,255,255,0.3)" : "#d9dade" }} />
          </View>
          {title ? (
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingBottom: 10 }}>
              <HT size={17} weight="600" color={ink} style={{ flex: 1 }}>{title}</HT>
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
                <Ionicons name="close" size={22} color={ink} />
              </Pressable>
            </View>
          ) : null}
          {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18 }}>{children}</ScrollView> : <View style={{ paddingHorizontal: 18 }}>{children}</View>}
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Green "added · Undo" bar above a footer button                     */
/* ------------------------------------------------------------------ */

export function AddedBar({ text, onUndo }: { text: string; onUndo?: () => void }) {
  const y = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
  }, [y, text]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }], backgroundColor: "#dff1ea", paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center" }} accessibilityLiveRegion="polite">
      <HT size={13} weight="500" color={hm.teal} style={{ flex: 1 }} numberOfLines={1}>{text}</HT>
      {onUndo ? (
        <Pressable onPress={onUndo} accessibilityRole="button" accessibilityLabel="Undo" hitSlop={10}>
          <HT size={13} weight="600" color={hm.teal}>Undo</HT>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/* ------------------------------------------------------------------ */
/* SVG pieces                                                         */
/* ------------------------------------------------------------------ */

/** The thin arc around the fork-and-knife on "Track Food" and the Diet day ring. */
export function ArcRing({ size = 46, stroke = 3, progress, color = hm.orange, track = "#f0f0f2", children, over }: { size?: number; stroke?: number; progress: number; color?: string; track?: string; children?: ReactNode; over?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {p > 0 ? (
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={over ? hm.red : color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * p} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        ) : null}
      </Svg>
      {children}
    </View>
  );
}

/** The calorie-budget face: yellow and glum, green and smiling, or red. */
export function BudgetFace({ mood, size = 78 }: { mood: "empty" | "low" | "balanced" | "over"; size?: number }) {
  const fill = mood === "balanced" ? "#57b947" : mood === "over" ? "#ef5350" : mood === "empty" ? "#e6e6ea" : "#f6c33d";
  const top = mood === "low" || mood === "empty" ? "#f4f4f6" : fill;
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100" accessibilityLabel={`Calorie budget: ${mood}`}>
      <Defs>
        <SvgGradient id="face" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset={mood === "low" ? "0.55" : "0.01"} stopColor={top} />
          <Stop offset={mood === "low" ? "0.56" : "0.02"} stopColor={fill} />
          <Stop offset="1" stopColor={fill} />
        </SvgGradient>
      </Defs>
      <Circle cx={50} cy={52} r={44} fill="url(#face)" />
      {mood === "low" ? <Path d="M22 12 C18 20 14 26 14 30 a8 8 0 0 0 16 0 c0-4-4-10-8-18z" fill="#5aa9f0" /> : null}
      {mood === "balanced" ? (
        <>
          <Path d="M30 46 q6 -7 12 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M58 46 q6 -7 12 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M32 62 q18 16 36 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : mood === "over" ? (
        <>
          <Line x1={30} y1={42} x2={42} y2={48} stroke="#2f2f2f" strokeWidth={4} strokeLinecap="round" />
          <Line x1={70} y1={42} x2={58} y2={48} stroke="#2f2f2f" strokeWidth={4} strokeLinecap="round" />
          <Ellipse cx={50} cy={68} rx={9} ry={6} fill="#2f2f2f" />
        </>
      ) : (
        <>
          <Path d="M30 46 q6 6 12 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M58 46 q6 6 12 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M38 70 q12 -9 24 0" stroke="#2f2f2f" strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export type ChartPoint = { x: string; y: number };

/**
 * Line chart for the weight tracker: purple line + dots, the last point
 * ringed and labelled, a dashed goal line and the ideal band shaded.
 */
export function WeightChart({ points, goal, band, width, height = 250, unit }: { points: ChartPoint[]; goal?: number; band?: { min: number; max: number }; width: number; height?: number; unit: string }) {
  const padL = 30;
  const padR = 14;
  const padT = 12;
  const padB = 26;
  const ys = points.map((p) => p.y).concat(goal !== undefined ? [goal] : []);
  if (!ys.length) return null;
  let lo = Math.floor(Math.min(...ys) - 3);
  let hi = Math.ceil(Math.max(...ys) + 3);
  if (hi - lo < 10) {
    const mid = (hi + lo) / 2;
    lo = Math.floor(mid - 5);
    hi = Math.ceil(mid + 5);
  }
  const w = width - padL - padR;
  const h = height - padT - padB;
  const X = (i: number) => padL + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const Y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * h;
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round(lo + ((hi - lo) * i) / 5));
  const d = points.map((p, i) => `${i ? "L" : "M"}${X(i)} ${Y(p.y)}`).join(" ");
  const last = points[points.length - 1];
  const lx = X(points.length - 1);
  const ly = Y(last.y);
  const bandTop = band ? Y(Math.min(hi, band.max)) : 0;
  const bandBot = band ? Y(Math.max(lo, band.min)) : 0;
  const labels = points.length <= 6 ? points.map((p, i) => ({ i, x: p.x })) : [0, 1, 2, 3, 4, 5].map((k) => { const i = Math.round((k / 5) * (points.length - 1)); return { i, x: points[i].x }; });
  return (
    <Svg width={width} height={height} accessibilityLabel={`Weight chart, latest ${last.y} ${unit}`}>
      {band && bandBot > bandTop ? <Rect x={padL} y={bandTop} width={w} height={bandBot - bandTop} fill="#eaf4f1" /> : null}
      {ticks.map((t) => (
        <SvgText key={t} x={padL - 6} y={Y(t) + 3} fontSize={8} fill={hm.faint} textAnchor="end">{t}</SvgText>
      ))}
      {goal !== undefined && goal >= lo && goal <= hi ? <Line x1={padL} x2={padL + w} y1={Y(goal)} y2={Y(goal)} stroke="#9aa0a6" strokeWidth={1} strokeDasharray="4 4" /> : null}
      <Path d={d} stroke={hm.purple} strokeWidth={2} fill="none" />
      {points.map((p, i) => (
        <Circle key={i} cx={X(i)} cy={Y(p.y)} r={i === points.length - 1 ? 5 : 3.5} fill={i === points.length - 1 ? "#1d1d1f" : hm.purple} stroke="#fff" strokeWidth={i === points.length - 1 ? 2 : 0} />
      ))}
      <Rect x={Math.min(lx - 36, width - 80)} y={ly + 12} width={72} height={34} rx={6} fill="#fff" stroke="#e5e5ea" />
      <SvgText x={Math.min(lx - 36, width - 80) + 36} y={ly + 27} fontSize={11} fontWeight="700" fill={hm.ink} textAnchor="middle">{`${last.y} ${unit}`}</SvgText>
      <SvgText x={Math.min(lx - 36, width - 80) + 36} y={ly + 40} fontSize={8} fill={hm.sub} textAnchor="middle">{last.x}</SvgText>
      {labels.map((l) => (
        <SvgText key={l.i} x={X(l.i)} y={height - 8} fontSize={8} fill={hm.faint} textAnchor="middle">{l.x}</SvgText>
      ))}
    </Svg>
  );
}

/** 7-day bars with a dashed goal line (sleep analysis, weekly trends). */
export function WeekBars({ values, labels, goal, width, height = 170, color = hm.amber, track, ink = hm.faint, goalLabel, valueLabel }: { values: number[]; labels: string[]; goal?: number; width: number; height?: number; color?: string; track?: string; ink?: string; goalLabel?: string; valueLabel?: (v: number) => string }) {
  const padT = goalLabel ? 22 : 10;
  const padB = 22;
  const top = Math.max(goal ?? 0, ...values, 1) * 1.1;
  const h = height - padT - padB;
  const step = width / values.length;
  const bw = Math.min(16, step * 0.4);
  const Y = (v: number) => padT + (1 - v / top) * h;
  return (
    <Svg width={width} height={height}>
      {goal !== undefined ? (
        <>
          <Line x1={0} x2={width} y1={Y(goal)} y2={Y(goal)} stroke={ink} strokeDasharray="3 4" strokeWidth={1} />
          {goalLabel ? <SvgText x={2} y={Y(goal) - 6} fontSize={10} fill={ink}>{goalLabel}</SvgText> : null}
        </>
      ) : null}
      {values.map((v, i) => {
        const x = i * step + step / 2;
        const y = Y(v);
        return (
          <G key={i}>
            {track ? <Rect x={x - bw / 2} y={padT} width={bw} height={h} rx={bw / 2} fill={track} /> : null}
            {v > 0 ? <Rect x={x - bw / 2} y={y} width={bw} height={Math.max(2, padT + h - y)} rx={Math.min(4, bw / 2)} fill={color} /> : null}
            <SvgText x={x} y={padT + h - 4 - (v > 0 ? padT + h - y : 0)} fontSize={9} fill={ink} textAnchor="middle">{v > 0 ? (valueLabel ? valueLabel(v) : String(Math.round(v))) : "0"}</SvgText>
            <SvgText x={x} y={height - 6} fontSize={10} fill={ink} textAnchor="middle">{labels[i]}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

/** Little purple sparkline for the weight log card on Home. */
export function Sparkline({ values, width = 120, height = 34, color = hm.purple }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const X = (i: number) => 4 + (i / (values.length - 1)) * (width - 8);
  const Y = (v: number) => 4 + (hi === lo ? 0.5 : 1 - (v - lo) / (hi - lo)) * (height - 8);
  return (
    <Svg width={width} height={height}>
      <Path d={values.map((v, i) => `${i ? "L" : "M"}${X(i)} ${Y(v)}`).join(" ")} stroke={color} strokeWidth={1.5} fill="none" />
      {values.map((v, i) => (
        <Circle key={i} cx={X(i)} cy={Y(v)} r={2.5} fill={color} />
      ))}
    </Svg>
  );
}

/** Blurred placeholder rows + a lock, for sections that have no data yet. */
export function LockedRows({ title, line, rows = 4 }: { title: string; line?: string; rows?: number }) {
  return (
    <View style={{ paddingVertical: 10 }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 }}>
          <View style={{ width: 70 + ((i * 37) % 60), height: 10, borderRadius: 5, backgroundColor: "#eef0f3" }} />
          <View style={{ width: 28, height: 10, borderRadius: 5, backgroundColor: "#eef0f3" }} />
        </View>
      ))}
      <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.55)" }]}>
        <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: hm.ink, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
          <Ionicons name="lock-closed" size={16} color={hm.ink} />
        </View>
        <HT size={15} weight="500" style={{ marginTop: 8 }} center>{title}</HT>
        {line ? <HT size={12} color={hm.sub} style={{ marginTop: 4, paddingHorizontal: 24 }} center>{line}</HT> : null}
      </View>
    </View>
  );
}

/** Tabs under a header: All Meals · Breakfast · … with a red underline. */
export function UnderlineTabs<T extends string>({ items, value, onChange, color = hm.red }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; color?: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: hm.line, backgroundColor: hm.card }} contentContainerStyle={{ paddingHorizontal: 8 }}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable key={it.id} onPress={() => { tap(); onChange(it.id); }} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on} accessibilityLabel={it.label} style={{ paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 3, borderBottomColor: on ? color : "transparent" }}>
            <HT size={14} weight={on ? "600" : "400"} color={on ? hm.ink : hm.sub}>{it.label}</HT>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Small rounded chip ("Kg | Lb", "Today ⌄"). */
export function Toggle<T extends string>({ items, value, onChange, tint = hm.teal }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; tint?: string }) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: "#eef0f2", borderRadius: 8, padding: 2, alignSelf: "center" }}>
      {items.map((it) => {
        const on = it.id === value;
        return (
          <Pressable key={it.id} onPress={() => { tap(); onChange(it.id); }} accessibilityRole="button" accessibilityState={{ selected: on }} aria-selected={on} accessibilityLabel={it.label} style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 7, backgroundColor: on ? tint : "transparent", minWidth: 48, alignItems: "center" }}>
            <HT size={12} weight="600" color={on ? "#fff" : hm.sub}>{it.label}</HT>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Single-select radio row or multi-select pill. */
export function OptionPill({ label, on, onPress, square }: { label: string; on: boolean; onPress: () => void; square?: boolean }) {
  return (
    <Pressable onPress={() => { tap(); onPress(); }} accessibilityRole={square ? "checkbox" : "radio"} accessibilityState={{ checked: on }} aria-checked={on} accessibilityLabel={label} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: on ? 1.5 : 1, borderColor: on ? hm.teal : "#e3e5ea", backgroundColor: on ? hm.tealSoft : "#fff" }}>
      <View style={{ width: 18, height: 18, borderRadius: square ? 4 : 9, borderWidth: 1.5, borderColor: on ? hm.teal : "#9aa0a6", alignItems: "center", justifyContent: "center" }}>
        {on ? <Ionicons name="checkmark" size={12} color={hm.teal} /> : null}
      </View>
      <HT size={13} weight="500" color={hm.ink}>{label}</HT>
    </Pressable>
  );
}

/** Letter circle used when a recipe has no photo — the reference app does the same. */
export function LetterCircle({ letter, color, size = 84 }: { letter: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <HT size={size * 0.34} weight="500" color="#fff">{letter.toUpperCase()}</HT>
    </View>
  );
}

export const CIRCLE_TINTS = ["#4fc3a1", "#a259c9", "#4fb3e8", "#9b5de5", "#f07167", "#f9a03f", "#43aa8b", "#577590"];
