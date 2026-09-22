import { useRef, useState } from "react";
import { Dimensions, FlatList, Image, Linking, Platform, Pressable, ScrollView, Share, Text, View, type ImageSourcePropType, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { brand, classes, contact, fitEdit, peopleOf, testimonials, wa, type Video } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { CultButton, Dots, H, Label, LinkRow, P, Pane, SectionHead, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { classPhoto, photo } from "@/lib/photos";

/**
 * Sections that the cult.fit Home, Fitness and Sports tabs share: the
 * FIT.EDIT video card, People of cult, the Testimonials pager, Explore all
 * formats, and the Quick Links list. Built once so the three tabs read
 * as one app.
 */

export const SCREEN_W = Dimensions.get("window").width;
export const GAP = 28;

/** Native share sheet, guarded for web (no navigator.share → WhatsApp). */
export async function shareText(message: string) {
  try {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && !(navigator as { share?: unknown }).share) {
      await Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
      return;
    }
    await Share.share({ message });
  } catch {
    /* dismissed */
  }
}

export const referText = (name?: string) =>
  `Come train with me at ${brand.fullName}, ${brand.city}. First session is free — walk in and say ${name?.split(" ")[0] || "a friend"} sent you. ${contact.mapsUrl}`;

/** Photo with the cult dark bottom scrim. */
export function Scrim({ strength = 0.75 }: { strength?: number }) {
  return <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", `rgba(6,8,20,${strength})`]} locations={[0.3, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />;
}

/** Small icon + label ghost button ("⛶ EXPLORE", "⛶ KNOW MORE"). */
export function GhostSmall({ label, onPress, icon = "scan-outline", style }: { label: string; onPress?: () => void; icon?: keyof typeof Ionicons.glyphMap; style?: object }) {
  const colors = useColors();
  return (
    <PressScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[{ flexDirection: "row", alignItems: "center", gap: 8, minHeight: 36, paddingHorizontal: 16, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignSelf: "flex-start" }, style]}>
      <Ionicons name={icon} size={13} color={colors.white} />
      <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }}>{label}</Text>
    </PressScale>
  );
}

/* ---------------- FIT.EDIT ---------------- */

export function VideoCard({ v, onPress, width }: { v: Video; onPress: () => void; width?: number }) {
  const colors = useColors();
  return (
    <PressScale onPress={onPress} scale={0.985} accessibilityRole="button" accessibilityLabel={`Watch ${v.title}`} style={{ width: width ?? SCREEN_W - 32 }}>
      <View style={{ height: 300, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
        <Image source={photo(v.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <Scrim strength={0.85} />
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 18 }}>
          <P style={{ color: "rgba(255,255,255,0.8)" }}>
            {v.author} <Text style={{ color: colors.muted }}>• {v.role}</Text>
          </P>
          <H size={20} style={{ marginTop: 4 }}>{v.title}</H>
          <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginTop: 14 }}>WATCH NOW</Text>
        </View>
      </View>
    </PressScale>
  );
}

export function FitEditSection({ compact }: { compact?: boolean }) {
  const [i, setI] = useState(0);
  const w = SCREEN_W - 32;
  const open = (v: Video) => Linking.openURL(contact.instagram).catch(() => {});
  return (
    <View style={{ marginTop: GAP }}>
      <View style={{ alignItems: "center", paddingHorizontal: 16, marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900", letterSpacing: 1 }}>FIT.EDIT</Text>
        <P style={{ textAlign: "center", marginTop: 4, color: "rgba(255,255,255,0.75)" }}>Everything you need to stay inspired{"\n"}& stay on top of your game</P>
      </View>
      <FlatList
        data={compact ? fitEdit.slice(0, 2) : fitEdit}
        keyExtractor={(v) => v.id}
        horizontal
        pagingEnabled
        snapToInterval={w + 12}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / (w + 12)))}
        renderItem={({ item }) => <VideoCard v={item} onPress={() => open(item)} width={w} />}
      />
      <Dots count={compact ? 2 : fitEdit.length} index={i} style={{ marginTop: 12 }} />
    </View>
  );
}

/* ---------------- People of Fitness 7 ---------------- */

export function PeopleOfSection() {
  const colors = useColors();
  return (
    <View style={{ marginTop: GAP }}>
      <SectionHead title={`People Of ${brand.name}`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {peopleOf.map((p) => (
          <PressScale key={p.id} onPress={() => Linking.openURL(contact.instagram).catch(() => {})} accessibilityRole="button" accessibilityLabel={p.name} style={{ width: SCREEN_W - 64, height: 240, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
            <Image source={photo(p.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <Scrim />
            <View style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
              <H size={20}>{p.name}</H>
              <P style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{p.line}</P>
            </View>
          </PressScale>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- Testimonials ---------------- */

export function TestimonialsSection() {
  const colors = useColors();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const w = SCREEN_W;
  return (
    <View style={{ marginTop: GAP }}>
      <H size={20} style={{ textAlign: "center", marginBottom: 10 }}>Testimonials</H>
      <FlatList
        data={testimonials}
        keyExtractor={(t) => t.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => setI(Math.round(e.nativeEvent.contentOffset.x / w))}
        renderItem={({ item }) => {
          const full = open === item.id;
          return (
            <Pressable onPress={() => setOpen(full ? null : item.id)} accessibilityRole="button" accessibilityLabel={`${item.name}: ${item.quote}`} style={{ width: w, paddingHorizontal: 32, alignItems: "center" }}>
              <P style={{ color: colors.white, textAlign: "center" }}>{item.name}</P>
              <P style={{ textAlign: "center", marginTop: 6, fontStyle: "italic", color: "rgba(255,255,255,0.8)" }} numberOfLines={full ? undefined : 3}>
                {item.quote}
                {!full ? <Text style={{ color: colors.white, fontStyle: "normal" }}>… more</Text> : null}
              </P>
              <P style={{ textAlign: "center", marginTop: 6 }}>{item.detail} · {item.since}</P>
            </Pressable>
          );
        }}
      />
      <Dots count={testimonials.length} index={i} style={{ marginTop: 16 }} />
    </View>
  );
}

/* ---------------- Explore all formats ---------------- */

export function ExploreFormats({ title = "Explore all formats" }: { title?: string }) {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={{ marginTop: GAP }}>
      <SectionHead title={title} onMore={() => router.push("/classes")} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {classes.map((c) => (
          <PressScale key={c.id} onPress={() => router.push(`/class/${c.id}`)} accessibilityRole="button" accessibilityLabel={c.name} style={{ width: 200, height: 300, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
            <Image source={classPhoto(c.id)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <Scrim strength={0.85} />
            <View style={{ position: "absolute", left: 0, right: 0, bottom: 18, alignItems: "center", paddingHorizontal: 12 }}>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }} numberOfLines={2}>{c.name}</Text>
              <Label style={{ marginTop: 6, color: "rgba(255,255,255,0.75)" }}>{c.intensity} • {c.durationMin} min</Label>
              <GhostSmall label="Explore" onPress={() => router.push(`/class/${c.id}`)} style={{ marginTop: 14 }} />
            </View>
          </PressScale>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------------- Quick Links ---------------- */

export function QuickLinks() {
  const router = useRouter();
  return (
    <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
      <H size={20} style={{ marginBottom: 4 }}>Quick Links</H>
      <LinkRow label="Help & Support" first onPress={() => Linking.openURL(wa.general()).catch(() => {})} />
      <LinkRow label="Terms and Conditions" onPress={() => router.push("/visit")} />
    </View>
  );
}

/* ---------------- Round icon row (Explore F7 store) ---------------- */

export function RoundIconRow({ title, items, onMore }: { title: string; items: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; photo?: ImageSourcePropType; onPress: () => void }[]; onMore?: () => void }) {
  const colors = useColors();
  return (
    <View style={{ marginTop: GAP }}>
      <SectionHead title={title} onMore={onMore} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 18 }}>
        {items.map((it) => (
          <PressScale key={it.id} onPress={it.onPress} scale={0.92} accessibilityRole="button" accessibilityLabel={it.label} style={{ width: 76, alignItems: "center", gap: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line }}>
              {it.photo ? <Image source={it.photo} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors /> : <Ionicons name={it.icon} size={26} color={colors.white} />}
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 14, textAlign: "center" }} numberOfLines={2}>{it.label}</Text>
          </PressScale>
        ))}
      </ScrollView>
    </View>
  );
}

/** "Centers near You ⌄ →" style head with an inline picker word. */
export function PickerHead({ prefix, word, onWord, onMore }: { prefix: string; word: string; onWord?: () => void; onMore?: () => void }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <H size={20}>{prefix}</H>
        <Pressable onPress={onWord} accessibilityRole="button" accessibilityLabel={`${prefix} ${word}`} style={{ flexDirection: "row", alignItems: "center", gap: 2, borderBottomWidth: 1, borderBottomColor: colors.white }}>
          <Text style={{ color: colors.white, fontSize: 18, fontWeight: "700" }}>{word}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.white} />
        </Pressable>
      </View>
      {onMore ? (
        <Pressable onPress={onMore} accessibilityRole="button" accessibilityLabel="See all" hitSlop={10}>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** "More centres · Click below to expand your search · SEE MORE" end card. */
export function MoreCard({ title, onPress, width = 220, height = 260 }: { title: string; onPress: () => void; width?: number; height?: number }) {
  const colors = useColors();
  return (
    <Pane onPress={onPress} accessibilityLabel={title} style={{ width, height, alignItems: "center", justifyContent: "center", gap: 10 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="location-outline" size={26} color={colors.white} />
      </View>
      <T style={{ marginTop: 6 }}>{title}</T>
      <P style={{ textAlign: "center" }}>Click below to expand your search</P>
      <CultButton label="See more" variant="ghost" small full={false} onPress={onPress} style={{ marginTop: 8 }} />
    </Pane>
  );
}

export function useHorizontalIndex(itemW: number) {
  const idx = useRef(0);
  const [i, setI] = useState(0);
  return {
    index: i,
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const n = Math.round(e.nativeEvent.contentOffset.x / itemW);
      if (n !== idx.current) {
        idx.current = n;
        setI(n);
      }
    },
  };
}
