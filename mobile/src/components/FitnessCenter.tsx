import { useMemo, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { brand, classes, contact, fmtTime, memberPlansCopy, slotsFor, trainers, transformCopy, wa, workoutFor } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { addDays, useBookings } from "@/state/bookings";
import { ActionTile, CultButton, H, P, Pane, T, Tag } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { ExploreFormats, FitEditSection, GAP, GhostSmall, MoreCard, PeopleOfSection, PickerHead, QuickLinks, RoundIconRow, SCREEN_W, Scrim, TestimonialsSection, referText, shareText } from "@/components/FitnessShared";
import { classPhoto, gymPhotos, photo } from "@/lib/photos";

/** Fitness → AT CENTER: the cult.fit centre tab with Fitness 7 content. */

const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function FitnessCenter() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { book, isBooked } = useBookings();
  const scrollRef = useRef<ScrollView>(null);
  const [classesY, setClassesY] = useState(0);
  const t0 = todayIso();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(t0, i)), [t0]);
  const [day, setDay] = useState(t0);
  const weekday = new Date(day + "T12:00:00").getDay();
  const now = new Date();

  const onSlot = async (classId: string, time: string) => {
    const b = await book(classId, day, time);
    router.push(`/booking/${b.id}`);
  };

  return (
    <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* ---------- promo hero ---------- */}
      <View style={{ height: 380, marginHorizontal: 0, overflow: "hidden" }}>
        <Image source={gymPhotos.floor} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.2)", "rgba(9,12,28,0.55)", colors.black]} locations={[0, 0.55, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: "absolute", left: 16, right: 16, bottom: 22, alignItems: "center" }}>
          <Text style={{ color: colors.gold, fontSize: 18, fontWeight: "900", letterSpacing: 3 }}>♥ LOWEST PRICES ♥</Text>
          <T style={{ marginTop: 8, fontSize: 16 }}>Get 30 Days Extension FREE</T>
          <CultButton label="Refer a friend" variant="dark" small full={false} onPress={() => shareText(referText(member?.name))} style={{ marginTop: 16, backgroundColor: "rgba(255,255,255,0.18)" }} />
        </View>
      </View>

      {/* ---------- quick actions ---------- */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 24, marginTop: 8 }}>
        <ActionTile icon="calendar-outline" label={"Book\nclass"} width={90} onPress={() => scrollRef.current?.scrollTo({ y: classesY - 8, animated: true })} />
        <ActionTile icon="qr-code-outline" label={"Gym\nCheck-in"} width={90} tint={colors.pink} onPress={() => router.push("/checkin")} />
        <ActionTile icon="list-outline" label={"Workout\nPlan"} width={90} tint="#7aa2ff" onPress={() => router.push("/plan")} />
      </View>

      {/* ---------- Classes at Fitness 7 ---------- */}
      <View style={{ marginTop: GAP }} onLayout={(e) => setClassesY(e.nativeEvent.layout.y)}>
        <PickerHead prefix="Classes at" word={brand.name} onWord={() => router.push("/visit")} onMore={() => router.push("/classes")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {days.map((d) => {
            const dt = new Date(d + "T12:00:00");
            const on = d === day;
            return (
              <Pressable key={d} onPress={() => setDay(d)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${dt.getDate()} ${WD[dt.getDay()]}`} style={{ width: 44, height: 52, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: on ? "#fff" : "transparent" }}>
                <Text style={{ color: on ? colors.black : colors.white, fontSize: 16, fontWeight: "800" }}>{dt.getDate()}</Text>
                <Text style={{ color: on ? colors.black : colors.muted, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 }}>{WD[dt.getDay()]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, marginTop: 14, gap: 14 }}>
          {classes.map((c) => {
            const slots = slotsFor(c.id, weekday);
            if (!slots.length) return null;
            const w = workoutFor(c.id, weekday);
            return (
              <View key={c.id} style={{ height: 300, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
                <Pressable onPress={() => router.push(`/class/${c.id}`)} accessibilityRole="button" accessibilityLabel={c.name} style={{ flex: 1 }}>
                  <Image source={classPhoto(c.id)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  <Scrim strength={0.9} />
                </Pressable>
                <View pointerEvents="box-none" style={{ position: "absolute", left: 14, right: 14, bottom: 14 }}>
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" }} numberOfLines={1}>{c.name}</Text>
                  <Text style={{ color: "#fff", fontSize: 34, lineHeight: 38, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{w.focus}</Text>
                  <P style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{c.intensity === "High" ? "High Intensity" : `${c.intensity} Intensity`} • {w.kcal} kcal</P>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
                    {slots.map((s) => {
                      const booked = isBooked(c.id, day, s.time);
                      const past = day === t0 && (s.h < now.getHours() || (s.h === now.getHours() && s.m <= now.getMinutes()));
                      const full = !booked && !past && (s.h + weekday) % 7 === 5;
                      const wait = past || full;
                      return (
                        <Pressable
                          key={s.time}
                          disabled={past}
                          onPress={() => (booked ? router.push(`/booking/${booked.id}`) : onSlot(c.id, s.time))}
                          accessibilityRole="button"
                          accessibilityLabel={`${fmtTime(s.h, s.m)}${booked ? ", booked" : wait ? ", waitlist" : ""}`}
                          style={{ minHeight: 40, paddingHorizontal: 12, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: booked ? colors.success : wait ? "rgba(255,255,255,0.12)" : "transparent", borderWidth: booked || wait ? 0 : 1, borderColor: "rgba(255,255,255,0.7)" }}
                        >
                          {booked ? <Ionicons name="checkmark" size={14} color="#0f1428" /> : wait ? <Ionicons name="time-outline" size={14} color={colors.muted} /> : null}
                          <View>
                            <Text style={{ color: booked ? "#0f1428" : wait ? colors.muted : "#fff", fontWeight: "800", fontSize: 13 }}>{fmtTime(s.h, s.m).replace(" ", "")}</Text>
                            {wait ? <Text style={{ color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 }}>WAITLIST</Text> : null}
                          </View>
                        </Pressable>
                      );
                    })}
                    <Pressable onPress={() => router.push(`/class/${c.id}`)} accessibilityRole="button" accessibilityLabel={`All ${c.name} slots`} style={{ width: 40, minHeight: 40, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" }}>
                      <Ionicons name="chevron-forward" size={16} color="#fff" />
                    </Pressable>
                  </ScrollView>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ---------- Centers near You ---------- */}
      <View style={{ marginTop: GAP }}>
        <PickerHead prefix="Centers near" word="You" onWord={() => router.push("/visit")} onMore={() => router.push("/visit")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          <CentreCard tag="Pro gym" photo={gymPhotos.floor} name={`${brand.name} TS Square`} sub="0.3 KM • Nethaji Bypass" cta="Check in" onPress={() => router.push("/checkin")} onOpen={() => router.push("/visit")} />
          <CentreCard tag="Elite gym + F7 classes" photo={gymPhotos.weights} name={`${brand.name} Palacode Road`} sub={`4.2 KM • ${contact.secondBranch.area}`} cta="Book now" onPress={() => Linking.openURL(wa.general()).catch(() => {})} onOpen={() => router.push("/visit")} />
          <MoreCard title="More centres" onPress={() => router.push("/visit")} height={300} />
        </ScrollView>
      </View>

      {/* ---------- Your smart workout plan ---------- */}
      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <H size={20} style={{ marginBottom: 12 }}>Your smart workout plan</H>
        <Pane padding={0} style={{ overflow: "hidden", backgroundColor: "#0c1a3a" }}>
          <LinearGradient colors={["#0b1d46", "#0c1a3a", "#0f1428"]} style={{ alignItems: "center", paddingTop: 22, paddingBottom: 24, paddingHorizontal: 20 }}>
            <PhoneMock />
            <Text style={{ color: "#fff", fontSize: 20, lineHeight: 24, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase", textAlign: "center", marginTop: 18 }}>You focus on your goals.{"\n"}We'll workout a plan for you.</Text>
            <P style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>Trainer certified workouts at the gym</P>
            <GhostSmall label="Unlock your plan" onPress={() => router.push("/plan")} style={{ marginTop: 18 }} />
          </LinearGradient>
        </Pane>
      </View>

      {/* ---------- Personal Training @ Gym ---------- */}
      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <H size={22} style={{ textAlign: "center" }}>Personal Training @ Gym</H>
        <View style={{ flexDirection: "row", marginTop: 18 }}>
          {([
            ["time-outline", "50 mins", "dedicated sessions"],
            ["clipboard-outline", "Goal", "based workouts"],
            ["play-forward-outline", "Faster", "& better results"],
            ["medkit-outline", "Reduced", "risk of injury"],
          ] as const).map(([icon, a, b]) => (
            <View key={a} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Ionicons name={icon} size={24} color={colors.gold} />
              <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", textAlign: "center" }}>{a}</Text>
              <P size={11} style={{ textAlign: "center" }}>{b}</P>
            </View>
          ))}
        </View>
      </View>

      {/* ---------- Trainers ---------- */}
      <View style={{ marginTop: GAP }}>
        <PickerHead prefix="Trainers at" word={brand.name} onWord={() => router.push("/visit")} onMore={() => Linking.openURL(wa.personalTraining()).catch(() => {})} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {trainers.map((tr, i) => (
            <View key={tr.id} style={{ width: SCREEN_W - 64, height: 320, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
              <Image source={i === 0 ? classPhoto("personal") : classPhoto("strength")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
              <Scrim strength={0.92} />
              <View style={{ position: "absolute", top: 12, left: 12 }}>
                <Tag label={`★ Level ${3 - i}`} tone="gold" />
              </View>
              <View style={{ position: "absolute", left: 14, right: 14, bottom: 16, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" }}>{tr.name}</Text>
                <P style={{ color: "rgba(255,255,255,0.8)", marginTop: 4 }}>Packs starting at ₹800/session</P>
                <CultButton label="Try for free" variant="white" small full={false} onPress={() => Linking.openURL(wa.trial()).catch(() => {})} style={{ marginTop: 14 }} />
              </View>
            </View>
          ))}
          <MoreCard title="More trainers" onPress={() => Linking.openURL(wa.personalTraining()).catch(() => {})} height={320} />
        </ScrollView>
      </View>

      {/* ---------- Transform card ---------- */}
      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <PressScale onPress={() => router.push("/transform")} scale={0.985} accessibilityRole="button" accessibilityLabel={`${brand.name} Transform, starting at ${transformCopy.priceFrom}`} style={{ borderRadius: 14, overflow: "hidden" }}>
          <View style={{ height: 150 }}>
            <Image source={photo("hiit")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <LinearGradient pointerEvents="none" colors={["rgba(61,220,132,0.25)", "rgba(61,220,132,0.35)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          </View>
          <LinearGradient colors={["#1d5a3d", "#0f2a24", colors.black]} locations={[0, 0.5, 1]} style={{ padding: 18 }}>
            <Text style={{ color: "#fff", fontSize: 16 }}>{brand.name.toLowerCase()}</Text>
            <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900", marginTop: -2 }}>Transform</Text>
            <View style={{ gap: 6, marginTop: 10 }}>
              {transformCopy.whatYouGet.slice(0, 3).map((x) => (
                <View key={x.title} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.gold} />
                  <P style={{ color: "rgba(255,255,255,0.85)" }}>{x.title}</P>
                </View>
              ))}
            </View>
            <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 14 }} />
            <P size={11}>Starting at</P>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>{transformCopy.priceFrom.split(" ")[0]}<Text style={{ fontSize: 13, fontWeight: "600" }}> / month</Text></Text>
          </LinearGradient>
        </PressScale>
      </View>

      <ExploreFormats />

      <RoundIconRow
        title={`Explore ${brand.name} store`}
        onMore={() => router.push("/store")}
        items={[
          { id: "belt", label: "Weightlifting Belt", icon: "ellipse-outline", photo: photo("gym-weights"), onPress: () => router.push("/store") },
          { id: "posture", label: "Posture Corrector", icon: "body-outline", photo: photo("strength"), onPress: () => router.push("/store") },
          { id: "gloves", label: "Gym Gloves", icon: "hand-left-outline", photo: photo("combat"), onPress: () => router.push("/store") },
          { id: "shaker", label: "Shaker Bottle", icon: "water-outline", photo: photo("cardio"), onPress: () => router.push("/store") },
          { id: "mat", label: "Yoga Mat", icon: "layers-outline", photo: photo("yoga"), onPress: () => router.push("/store") },
        ]}
      />

      {/* ---------- Explore F7 pass ---------- */}
      <View style={{ marginTop: GAP, paddingHorizontal: 16 }}>
        <H size={20} style={{ marginBottom: 12 }}>Explore F7 pass</H>
        <View style={{ gap: 10 }}>
          {memberPlansCopy.items.map((p) => (
            <Pane key={p.id} onPress={() => router.push(`/upgrade/${p.id}`)} accessibilityLabel={`${p.name}, ${p.price}`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ width: 62, height: 62, borderRadius: 31, overflow: "hidden", backgroundColor: colors.surface2 }}>
                <Image source={photo(p.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
              </View>
              <View style={{ flex: 1 }}>
                <T>{p.name}</T>
                <P numberOfLines={2} style={{ marginTop: 2 }}>{p.sub}</P>
                <Text style={{ color: colors.white, fontWeight: "800", fontSize: 13, marginTop: 6 }}>
                  {p.price} <Text style={{ color: colors.muted, fontWeight: "400", fontSize: 10 }}>{p.note}</Text>
                </Text>
              </View>
            </Pane>
          ))}
        </View>
      </View>

      <FitEditSection compact />
      <PeopleOfSection />
      <TestimonialsSection />
      <QuickLinks />
    </ScrollView>
  );
}

function CentreCard({ tag, photo: src, name, sub, cta, onPress, onOpen }: { tag: string; photo: ReturnType<typeof classPhoto>; name: string; sub: string; cta: string; onPress: () => void; onOpen: () => void }) {
  const colors = useColors();
  return (
    <Pane padding={0} style={{ width: SCREEN_W - 64, height: 300, overflow: "hidden" }}>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={name} style={{ height: 170 }}>
        <Image source={src} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={{ position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(9,12,28,0.85)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success }} />
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{tag}</Text>
        </View>
      </Pressable>
      <View style={{ padding: 14, flex: 1 }}>
        <T numberOfLines={1}>{name}</T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
          <Ionicons name="location-outline" size={12} color={colors.success} />
          <P>{sub}</P>
        </View>
      </View>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={cta} style={{ minHeight: 44, alignItems: "center", justifyContent: "center", borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 1 }}>{cta.toUpperCase()}</Text>
      </Pressable>
    </Pane>
  );
}

/** A tiny phone with a plan list inside — drawn with Views, no image. */
function PhoneMock() {
  const colors = useColors();
  const rows = ["Plank", "Side Lunges · Right", "Side Lunges · Left", "Barbell Bench Press"];
  return (
    <View style={{ width: 150, height: 250, borderRadius: 22, backgroundColor: "#111", borderWidth: 4, borderColor: "#2a2f45", overflow: "hidden" }}>
      <LinearGradient colors={["#6a5cff", "#3d2fb8"]} style={{ height: 78, paddingTop: 14, paddingHorizontal: 10 }}>
        <View style={{ alignSelf: "center", width: 44, height: 8, borderRadius: 4, backgroundColor: "#111", marginTop: -10, marginBottom: 6 }} />
        <Text style={{ color: "#fff", fontSize: 8, fontWeight: "800" }}>‹ My Workout Plan</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 6 }}>Lose Weight • 5 Days</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
          {[18, 19, 20, 21, 22, 23].map((d, i) => (
            <View key={d} style={{ width: 16, height: 18, borderRadius: 3, backgroundColor: i === 0 ? "#fff" : "transparent", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: i === 0 ? "#3d2fb8" : "#fff", fontSize: 7, fontWeight: "800" }}>{d}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
      <View style={{ flex: 1, backgroundColor: "#f4f5fa", padding: 8, gap: 8 }}>
        <Text style={{ color: "#999", fontSize: 5, fontWeight: "800", letterSpacing: 0.5 }}>REPEAT 3 TIMES</Text>
        {rows.map((r) => (
          <View key={r} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: "#d9dcea" }} />
            <View>
              <Text style={{ color: "#111", fontSize: 6, fontWeight: "700" }}>{r}</Text>
              <Text style={{ color: "#888", fontSize: 5 }}>3 SETS × 12 REPS</Text>
            </View>
          </View>
        ))}
        <View style={{ marginTop: "auto", height: 14, borderRadius: 4, backgroundColor: colors.pink, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 5, fontWeight: "800" }}>START WORKOUT</Text>
        </View>
      </View>
    </View>
  );
}
