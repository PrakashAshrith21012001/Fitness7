import { type ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { store as sc } from "@/theme/ThemeProvider";
import { useCart } from "@/state/cart";
import { PressScale } from "@/components/motion";

/**
 * Store primitives — the white web-shop look (cult store / Zepto). Black
 * text, pink for the one action, green for savings.
 *
 *   ST            text with a size + weight shorthand
 *   StorePane     white card with a hairline, radius 12 (Zepto panes)
 *   StoreHeader   ☰ 🔍 wordmark 🛒 (cult store) or ‹ title (Zepto pages)
 *   StoreButton   pink filled / outlined / black
 *   StoreBar      cult's in-page footer: Back · Home · Deals · Account · F7 Express
 *   FreeDelivery  the black "🚚 FREE DELIVERY ON ALL THE ORDERS" strip
 */

export function ST({ children, size = 14, weight = "500", color = sc.ink, style, numberOfLines, muted, center, strike }: { children: ReactNode; size?: number; weight?: TextStyle["fontWeight"]; color?: string; style?: StyleProp<TextStyle>; numberOfLines?: number; muted?: boolean; center?: boolean; strike?: boolean }) {
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontSize: size, lineHeight: Math.round(size * 1.35), fontWeight: weight, color: muted ? sc.muted : color, textAlign: center ? "center" : undefined, textDecorationLine: strike ? "line-through" : undefined }, style]}>
      {children}
    </Text>
  );
}

export function StorePane({ children, style, padding = 14 }: { children: ReactNode; style?: StyleProp<ViewStyle>; padding?: number }) {
  return <View style={[{ backgroundColor: sc.bg, borderRadius: 12, borderWidth: 1, borderColor: sc.line, padding, marginHorizontal: 12 }, style]}>{children}</View>;
}

export function IconButton({ icon, onPress, label, badge, size = 22, color = sc.ink }: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void; label: string; badge?: number; size?: number; color?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => [{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={size} color={color} />
      {badge ? (
        <View style={{ position: "absolute", top: 6, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: sc.pink, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}>
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function FreeDeliveryStrip() {
  return (
    <View style={{ backgroundColor: "#111", paddingVertical: 6, alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.4 }}>🚚 FREE DELIVERY ON ALL THE ORDERS</Text>
    </View>
  );
}

/** cult store header: ☰ 🔍 · wordmark · 🛒 */
export function StoreHeader({ onMenu, onSearch, top = true }: { onMenu?: () => void; onSearch?: () => void; top?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bill } = useCart();
  return (
    <View style={{ backgroundColor: sc.bg, paddingTop: top ? insets.top : 0 }}>
      <FreeDeliveryStrip />
      <View style={{ height: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: sc.line }}>
        <IconButton icon="menu-outline" size={26} label="Menu" onPress={onMenu ?? (() => router.push("/store/menu"))} />
        <IconButton icon="search-outline" label="Search" onPress={onSearch ?? (() => router.push("/(tabs)/store"))} />
        <Pressable style={{ flex: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 }} onPress={() => router.push("/(tabs)/store")} accessibilityRole="button" accessibilityLabel="Fitness 7 store home">
          <Image source={require("@/assets/brand/logo-light.png")} style={{ width: 46, height: 22 }} resizeMode="contain" />
          <Text style={{ fontSize: 17, fontWeight: "800", color: sc.ink, letterSpacing: -0.3 }}>store</Text>
        </Pressable>
        <View style={{ width: 44 }} />
        <IconButton icon="cart-outline" label="Cart" badge={bill.count} onPress={() => router.push("/store/cart")} />
      </View>
    </View>
  );
}

/** Zepto-style stack header: ‹ title … right */
export function BackHeader({ title, right, dark, children }: { title?: ReactNode; right?: ReactNode; dark?: boolean; children?: ReactNode }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const ink = dark ? "#fff" : sc.ink;
  return (
    <View style={{ paddingTop: insets.top, backgroundColor: dark ? "transparent" : sc.bg }}>
      <View style={{ height: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
        <IconButton icon="chevron-back" size={24} label="Back" color={ink} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/store"))} />
        <View style={{ flex: 1, justifyContent: "center" }}>{typeof title === "string" ? <ST size={16} weight="700" color={ink} center>{title}</ST> : title ?? children}</View>
        {right ?? <View style={{ width: 44 }} />}
      </View>
    </View>
  );
}

export function StoreButton({ label, onPress, tone = "pink", style, small, disabled, icon }: { label: string; onPress: () => void; tone?: "pink" | "outline" | "black" | "grey"; style?: StyleProp<ViewStyle>; small?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap }) {
  const bg = { pink: sc.pink, outline: sc.bg, black: "#111", grey: "#b9bcc6" }[tone];
  const fg = tone === "outline" ? sc.pink : "#fff";
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} style={[{ backgroundColor: bg, borderRadius: 8, minHeight: small ? 36 : 48, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6, borderWidth: tone === "outline" ? 1 : 0, borderColor: sc.pink }, style]}>
      {icon ? <Ionicons name={icon} size={16} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: small ? 13 : 15, fontWeight: "700" }}>{label}</Text>
    </PressScale>
  );
}

export function SectionTitle({ title, style, right }: { title: string; style?: StyleProp<ViewStyle>; right?: ReactNode }) {
  return (
    <View style={[{ paddingHorizontal: 12, marginTop: 22, marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, style]}>
      <ST size={20} weight="700">{title}</ST>
      {right}
    </View>
  );
}

/** cult store's own in-page footer. Fixed at the bottom of the screen (above the app tab bar on the tab). */
export function StoreBar({ active, onDeals, tab }: { active?: "home" | "deals" | "account" | "express"; onDeals?: () => void; tab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const go = (path: string) => router.push(path as never);
  const items: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; pink?: boolean }[] = [
    { id: "back", label: "Back", icon: "chevron-back", onPress: () => (router.canGoBack() ? router.back() : router.replace("/(tabs)")) },
    { id: "home", label: "Home", icon: "home-outline", onPress: () => (tab ? router.replace("/(tabs)") : go("/(tabs)/store")) },
    { id: "deals", label: "Deals", icon: "pricetag-outline", onPress: onDeals ?? (() => go("/(tabs)/store")), pink: true },
    { id: "account", label: "Account", icon: "person-outline", onPress: () => go("/store/account") },
    { id: "express", label: "F7 Express", icon: "flash-outline", onPress: () => go("/store/express") },
  ];
  return (
    <View style={{ flexDirection: "row", backgroundColor: sc.bg, borderTopWidth: 1, borderTopColor: sc.line, paddingBottom: tab ? 4 : Math.max(insets.bottom, 8), paddingTop: 6 }}>
      {items.map((it) => {
        const on = active === it.id;
        return (
          <Pressable key={it.id} onPress={it.onPress} accessibilityRole="button" accessibilityLabel={it.label} style={({ pressed }) => [{ flex: 1, alignItems: "center", minHeight: 44, justifyContent: "center" }, pressed && { opacity: 0.6 }]}>
            {it.id === "deals" ? <Text style={{ color: sc.pink, fontSize: 20, fontWeight: "800", lineHeight: 24 }}>%</Text> : <Ionicons name={it.icon} size={22} color={it.pink ? sc.pink : sc.ink} />}
            <Text style={{ fontSize: 10, color: sc.ink, marginTop: 2, fontWeight: on ? "700" : "500" }}>{it.label}</Text>
            <View style={{ height: 2, width: 22, marginTop: 3, borderRadius: 1, backgroundColor: on ? sc.ink : "transparent" }} />
          </Pressable>
        );
      })}
    </View>
  );
}

export const shadow = StyleSheet.create({
  card: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
});
