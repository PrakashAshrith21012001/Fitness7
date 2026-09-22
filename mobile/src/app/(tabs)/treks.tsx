import { useMemo, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { inr, memberPlansCopy, telLink, wa, type Trek, type TrekDifficulty } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useContent } from "@/state/content";
import { Chip, CultButton, H, NavyPage, P, Pane, SectionHead, T } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { GAP, GhostSmall, PickerHead, QuickLinks, SCREEN_W, Scrim } from "@/components/FitnessShared";
import { gymPhotos, photo, trekPhoto } from "@/lib/photos";

/**
 * Treks — laid out like cult's Sports tab: hero offer, Try for Free icons,
 * Need help?, plan rows, "Centers near You" (here: treks) with filter
 * chips + search + one tall card per trek, "Slightly far from your place",
 * Explore all treks, Quick Links.
 */

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const opensOn = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()} ${MON[d.getMonth()]}`;
};
/** Rough road distance from Dharmapuri — the "slightly far" split. */
const farKm = (t: Trek) => {
  const l = t.location.toLowerCase();
  if (l.includes("dharmapuri")) return 25;
  if (l.includes("salem") || l.includes("yercaud")) return 70;
  if (l.includes("namakkal") || l.includes("kolli")) return 115;
  if (l.includes("nilgiri") || l.includes("kotagiri")) return 260;
  return 80;
};
type Kind = "day" | "night" | "ridge";
const kindOf = (t: Trek): Kind => (/night/i.test(t.title + t.durationText) ? "night" : /ridge|2 days/i.test(t.title + t.durationText) ? "ridge" : "day");

export default function Treks() {
  const colors = useColors();
  const router = useRouter();
  const { upcoming } = useContent();
  const [diff, setDiff] = useState<TrekDifficulty | null>(null);
  const [kind, setKind] = useState<Kind | null>(null);
  const [q, setQ] = useState("");

  const list = useMemo(
    () => upcoming.filter((t) => (!diff || t.difficulty === diff) && (!kind || kindOf(t) === kind) && (!q.trim() || `${t.title} ${t.location}`.toLowerCase().includes(q.trim().toLowerCase()))),
    [upcoming, diff, kind, q],
  );
  const near = list.filter((t) => farKm(t) <= 100);
  const far = list.filter((t) => farKm(t) > 100);

  const header = (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 48 }}>
      <H size={20}>Treks</H>
      <Pressable onPress={() => router.push("/visit")} accessibilityRole="button" accessibilityLabel="Meeting point" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="location-outline" size={22} color={colors.white} />
      </Pressable>
    </View>
  );

  return (
    <NavyPage header={header}>
      {/* ---------- hero ---------- */}
      <View style={{ height: 380 }}>
        <Image source={gymPhotos.trek} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.15)", "rgba(9,12,28,0.55)", colors.black]} locations={[0, 0.6, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 20, alignItems: "center" }}>
          <T style={{ fontSize: 16, textAlign: "center" }}>Members save up to ₹1,000 per trek{"\n"}+ one free trek on F7 pass ELITE</T>
          <CultButton label="Buy now" variant="dark" small full={false} onPress={() => router.push("/membership")} style={{ marginTop: 14, backgroundColor: "rgba(255,255,255,0.18)" }} />
        </View>
      </View>

      {/* ---------- Try for Free ---------- */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <H size={20}>Try for Free</H>
        <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
          {([
            ["day", "sunny-outline", "day\ntrek", colors.gold],
            ["night", "moon-outline", "night\ntrek", "#7aa2ff"],
            ["ridge", "trail-sign-outline", "ridge\nwalk", colors.success],
          ] as const).map(([k, icon, label, tint]) => (
            <Pressable key={k} onPress={() => setKind((v) => (v === k ? null : k))} accessibilityRole="button" accessibilityState={{ selected: kind === k }} accessibilityLabel={label.replace("\n", " ")} style={{ width: 90, alignItems: "center", gap: 8 }}>
              <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: kind === k ? "rgba(255,255,255,0.2)" : colors.surface, borderWidth: 1, borderColor: kind === k ? colors.white : colors.line, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={icon} size={26} color={tint} />
              </View>
              <Text style={{ color: kind === k ? colors.white : colors.muted, fontSize: 11, lineHeight: 14, textAlign: "center" }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ---------- Need help ---------- */}
      <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
        <Pane onPress={() => Linking.openURL(telLink()).catch(() => {})} accessibilityLabel="Request a callback" style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "rgba(255,255,255,0.1)" }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="call-outline" size={20} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <P>Need help?</P>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Text style={{ color: colors.white, fontWeight: "800", fontSize: 12, letterSpacing: 1 }}>REQUEST A CALLBACK</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.white} />
            </View>
          </View>
        </Pane>
      </View>

      {/* ---------- plan rows ---------- */}
      <View style={{ paddingHorizontal: 16, marginTop: GAP }}>
        <H size={20} style={{ marginBottom: 12 }}>All treks · every month</H>
        <View style={{ gap: 10 }}>
          {memberPlansCopy.items.slice(0, 2).map((p) => (
            <PlanRow key={p.id} id={p.id} name={p.name} sub={p.id === "annual" ? "One free trek a year, member price on every other trek" : "Member price on every trek, transport from the gym"} price={p.price} note={p.note} photoName="trek" />
          ))}
        </View>
        <H size={20} style={{ marginTop: GAP, marginBottom: 12 }}>One trek at a time</H>
        <View style={{ gap: 10 }}>
          <PlanRow id="monthly" name="F7 pass PLAY" sub="Monthly members join any trek at the member price" price="₹1,200 / month*" note="onwards" photoName="gym-floor" />
          <PlanRow id="home" name="Guest trekker" sub="Not a member yet? Book a single trek at the guest price" price={`${inr(upcoming[0]?.priceINR ?? 1400)}*`} note="per trek" photoName="cardio" />
        </View>
      </View>

      {/* ---------- Centers near You → treks ---------- */}
      <View style={{ marginTop: GAP }}>
        <PickerHead prefix="Treks near" word="You" onWord={() => router.push("/visit")} onMore={() => router.push(`/trek/${upcoming[0]?.id ?? ""}`)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {(["Easy", "Moderate", "Challenging"] as TrekDifficulty[]).map((d) => (
            <Chip key={d} label={d} on={diff === d} onPress={() => setDiff((v) => (v === d ? null : d))} />
          ))}
        </ScrollView>
        <View style={{ marginHorizontal: 16, marginTop: 12, height: 46, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 }}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search for a trek near you" placeholderTextColor={colors.muted} accessibilityLabel="Search treks" style={{ flex: 1, color: colors.white, fontSize: 14, height: 44 }} />
          {q ? (
            <Pressable onPress={() => setQ("")} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 14 }}>
          {near.map((t) => <TrekCard key={t.id} trek={t} />)}
          {near.length === 0 && far.length === 0 ? (
            <Pane>
              <T>No treks match</T>
              <P style={{ marginTop: 2 }}>Clear the filters or ask us on WhatsApp for the next date.</P>
              <CultButton label="Ask on WhatsApp" variant="ghost" small full={false} onPress={() => Linking.openURL(wa.general()).catch(() => {})} style={{ marginTop: 12 }} />
            </Pane>
          ) : null}
        </View>
        {far.length ? (
          <View style={{ paddingHorizontal: 16, marginTop: GAP, gap: 14 }}>
            <H size={20} style={{ textAlign: "center" }}>Slightly far from your place</H>
            {far.map((t) => <TrekCard key={t.id} trek={t} />)}
          </View>
        ) : null}
      </View>

      {/* ---------- Explore all treks ---------- */}
      <View style={{ marginTop: GAP }}>
        <SectionHead title="Explore all treks" onMore={() => Linking.openURL(wa.general()).catch(() => {})} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {upcoming.map((t) => (
            <PressScale key={t.id} onPress={() => router.push(`/trek/${t.id}`)} accessibilityRole="button" accessibilityLabel={t.title} style={{ width: 210, height: 300, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
              <Image source={trekPhoto(t)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
              <Scrim strength={0.85} />
              <View style={{ position: "absolute", left: 0, right: 0, bottom: 18, alignItems: "center", paddingHorizontal: 12 }}>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", textAlign: "center" }} numberOfLines={2}>{t.title.split(" ").slice(0, 2).join(" ")}</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 6 }}>{t.difficulty.toUpperCase()} • {t.distanceKm} KM</Text>
                <GhostSmall label="Explore" onPress={() => router.push(`/trek/${t.id}`)} style={{ marginTop: 14 }} />
              </View>
            </PressScale>
          ))}
        </ScrollView>
      </View>

      <QuickLinks />
    </NavyPage>
  );
}

function PlanRow({ id, name, sub, price, note, photoName }: { id: string; name: string; sub: string; price: string; note: string; photoName: string }) {
  const colors = useColors();
  const router = useRouter();
  return (
    <Pane onPress={() => router.push(`/upgrade/${id}`)} accessibilityLabel={`${name}, ${price}`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <View style={{ width: 62, height: 62, borderRadius: 31, overflow: "hidden", backgroundColor: colors.surface2 }}>
        <Image source={photo(photoName)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
      </View>
      <View style={{ flex: 1 }}>
        <T>{name}</T>
        <P numberOfLines={2} style={{ marginTop: 2 }}>{sub}</P>
        <Text style={{ color: colors.white, fontWeight: "800", fontSize: 13, marginTop: 6 }}>
          {price} <Text style={{ color: colors.muted, fontWeight: "400", fontSize: 10 }}>{note}</Text>
        </Text>
      </View>
    </Pane>
  );
}

function TrekCard({ trek }: { trek: Trek }) {
  const colors = useColors();
  const router = useRouter();
  const open = () => router.push(`/trek/${trek.id}`);
  return (
    <Pane padding={0} style={{ overflow: "hidden", width: SCREEN_W - 32 }}>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={trek.title} style={{ height: 210 }}>
        <Image source={trekPhoto(trek)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={{ position: "absolute", top: 10, left: 10, backgroundColor: "rgba(9,12,28,0.85)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{trek.difficulty}</Text>
        </View>
        <View style={{ position: "absolute", top: 0, right: 18, alignItems: "center" }}>
          <View style={{ width: 2, height: 16, backgroundColor: "rgba(255,255,255,0.7)" }} />
          <View style={{ backgroundColor: colors.gold, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4, alignItems: "center", transform: [{ rotate: "8deg" }] }}>
            <Text style={{ color: "#1a1400", fontSize: 7, fontWeight: "800", letterSpacing: 0.8 }}>OPENS ON</Text>
            <Text style={{ color: "#1a1400", fontSize: 13, fontWeight: "900" }}>{opensOn(trek.date)}</Text>
          </View>
        </View>
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(9,12,28,0.85)", paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: "700" }} numberOfLines={1}>Members {inr(trek.memberPriceINR)} · Guests {inr(trek.priceINR)} · {trek.slotsLeft} slots left</Text>
        </View>
      </Pressable>
      <View style={{ padding: 14 }}>
        <T numberOfLines={1}>{trek.title}</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Ionicons name="location-outline" size={12} color={colors.muted} />
          <P>{trek.distanceKm} KM • {trek.location}</P>
        </View>
      </View>
      <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Pressable onPress={() => Linking.openURL(wa.trek(trek)).catch(() => {})} accessibilityRole="button" accessibilityLabel={`Try ${trek.title} for free`} style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderRightColor: colors.line }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 1 }}>TRY FOR FREE</Text>
        </Pressable>
        <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`More details about ${trek.title}`} style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 1 }}>MORE DETAILS</Text>
        </Pressable>
      </View>
    </Pane>
  );
}
