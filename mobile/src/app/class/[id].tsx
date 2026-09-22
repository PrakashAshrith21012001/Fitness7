import { useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { centreFacilities, classes, fmtTime, slotsFor, trainers, workoutFor } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession, today } from "@/state/session";
import { addDays, useBookings } from "@/state/bookings";
import { CultButton, H, Label, P, Pane, T, Tag } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { MuscleMapMini } from "@/components/MuscleMap";
import { classPhoto } from "@/lib/photos";
import { DAY, CENTRE, toDate } from "@/components/BookingDates";

/**
 * A class format — what "Explore all formats" opens. cult's format page:
 * a photo hero with the name in big caps, "High Intensity • kcal", the
 * story, the 7-day strip with slot chips (tap = book), today's WORKOUT OF
 * THE DAY preview, trainers, facilities and a sticky BOOK NOW that jumps to
 * the slots.
 */
export default function ClassFormat() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scroller = useRef<ScrollView>(null);
  const slotsY = useRef(0);
  const { id } = useLocalSearchParams<{ id: string }>();
  const cls = classes.find((c) => c.id === id);
  const { member, toggleFollow } = useSession();
  const { book, isBooked } = useBookings();
  const t = today();
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(t, i)), [t]);
  const [day, setDay] = useState(t);
  const [busy, setBusy] = useState<string | null>(null);

  if (!cls) return null;
  const following = !!member?.followed.includes(cls.id);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));
  const weekday = toDate(day).getDay();
  const slots = slotsFor(cls.id, weekday);
  const wod = workoutFor(cls.id, toDate(t).getDay());
  const now = new Date();
  const kcal = wod.kcal;
  const intensity = cls.intensity === "All levels" ? "All levels" : `${cls.intensity} Intensity`;

  const onSlot = async (time: string, h: number, m: number) => {
    const existing = isBooked(cls.id, day, time);
    if (existing) {
      router.push(`/booking/${existing.id}`);
      return;
    }
    const past = day === t && h * 60 + m < now.getHours() * 60 + now.getMinutes();
    if (past) return;
    setBusy(time);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const b = await book(cls.id, day, time);
    setBusy(null);
    router.push(`/booking/${b.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <LinearGradient pointerEvents="none" colors={[colors.navyDeep, colors.black, colors.black]} locations={[0, 0.45, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <ScrollView ref={scroller} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* hero */}
        <View style={{ height: 360, backgroundColor: colors.surface2 }}>
          <Image source={classPhoto(cls.id)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
          <LinearGradient pointerEvents="none" colors={["rgba(9,12,28,0.55)", "rgba(9,12,28,0)", "rgba(15,20,40,0.35)", colors.black]} locations={[0, 0.3, 0.7, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          <View style={{ position: "absolute", top: insets.top + 6, left: 8, right: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </Pressable>
            <PressScale onPress={() => toggleFollow(cls.id)} scale={0.9} accessibilityRole="button" accessibilityLabel={following ? "Stop following" : "Follow this class"} accessibilityState={{ selected: following }} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={following ? "notifications" : "notifications-outline"} size={22} color={following ? colors.success : "#fff"} />
            </PressScale>
          </View>
          <View style={{ position: "absolute", left: 16, right: 16, bottom: 18 }}>
            <Text style={{ color: "#fff", fontSize: 30, lineHeight: 34, fontWeight: "900", letterSpacing: 0.5, textTransform: "uppercase" }}>{cls.name}</Text>
            <P style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }} size={14}>{intensity} • {kcal} kcal</P>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <P style={{ marginTop: 14, lineHeight: 21 }} size={14}>{cls.description}</P>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <Tag label={`${cls.durationMin} min`} tone="muted" />
            <Tag label={cls.intensity} tone="muted" />
            <Tag label={cls.schedule.split(" · ")[0]} tone="muted" />
          </View>
        </View>

        {/* slots */}
        <View onLayout={(e) => { slotsY.current = e.nativeEvent.layout.y; }} style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <H size={20}>Classes at</H>
            <H size={20} style={{ textDecorationLine: "underline" }}>{CENTRE}</H>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 14 }}>
            {days.map((d) => {
              const on = d === day;
              const dd = toDate(d);
              return (
                <Pressable key={d} onPress={() => setDay(d)} accessibilityRole="tab" accessibilityLabel={`${DAY[dd.getDay()]} ${dd.getDate()}`} accessibilityState={{ selected: on }} style={{ width: 52, minHeight: 60, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: on ? "#ffffff" : colors.surface, borderWidth: 1, borderColor: on ? "#ffffff" : colors.line }}>
                  <Text style={{ color: on ? colors.black : colors.white, fontSize: 17, fontWeight: "800" }}>{dd.getDate()}</Text>
                  <Text style={{ color: on ? colors.black : colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 }}>{DAY[dd.getDay()].toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <Pane padding={0} style={{ overflow: "hidden" }}>
              <View style={{ height: 150 }}>
                <Image source={classPhoto(cls.id)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                <View style={{ position: "absolute", left: 14, right: 14, bottom: 12 }}>
                  <Text style={{ color: "#fff", fontSize: 20, fontWeight: "900", textTransform: "uppercase" }}>{cls.name} {workoutFor(cls.id, weekday).focus}</Text>
                  <P size={12} style={{ color: "rgba(255,255,255,0.8)" }}>{intensity} • {workoutFor(cls.id, weekday).kcal} kcal</P>
                </View>
              </View>
              <View style={{ padding: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {slots.length === 0 ? <P>No classes on this day. Pick another.</P> : null}
                {slots.map((s) => {
                  const booked = isBooked(cls.id, day, s.time);
                  const past = day === t && s.h * 60 + s.m < now.getHours() * 60 + now.getMinutes();
                  const wait = !booked && !past && (s.h + toDate(day).getDate()) % 4 === 0;
                  return (
                    <Pressable
                      key={s.time}
                      onPress={() => onSlot(s.time, s.h, s.m)}
                      disabled={past || busy !== null}
                      accessibilityRole="button"
                      accessibilityLabel={`${fmtTime(s.h, s.m)}${booked ? ", booked" : wait ? ", waitlist" : ""}`}
                      accessibilityState={{ selected: !!booked, disabled: past }}
                      style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: booked ? colors.success : colors.line, backgroundColor: booked ? colors.successSoft : colors.surface2, alignItems: "center", justifyContent: "center", opacity: past ? 0.4 : 1 }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        {booked ? <Ionicons name="checkmark" size={14} color={colors.success} /> : null}
                        <Text style={{ color: booked ? colors.success : colors.white, fontSize: 13, fontWeight: "800" }}>{fmtTime(s.h, s.m).replace(" ", "")}</Text>
                      </View>
                      {wait ? <Text style={{ color: colors.gold, fontSize: 8, fontWeight: "800", letterSpacing: 0.8 }}>WAITLIST</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Pane>
          </View>
        </View>

        {/* workout of the day */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <Label>Workout of the day</Label>
          <Pane style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <MuscleMapMini muscles={wod.muscles} width={70} />
            <View style={{ flex: 1 }}>
              <P>Focus for Today</P>
              <H size={20}>{wod.focus}</H>
              <P style={{ marginTop: 6 }} numberOfLines={2}>{wod.blocks.map((b) => b.title).join(" · ")} · {wod.blocks.reduce((n, b) => n + b.exercises.length, 0)} exercises</P>
            </View>
          </Pane>
          {wod.blocks[0].exercises.map((e) => (
            <Pressable key={e.id} onPress={() => router.push(`/exercise/${e.id}`)} accessibilityRole="button" accessibilityLabel={`Play ${e.name}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingHorizontal: 4 }}>
              <Ionicons name="barbell-outline" size={18} color={colors.white} />
              <T style={{ flex: 1 }}>{e.name}</T>
              <P>{e.volume}</P>
              <Ionicons name="play" size={14} color={colors.white} />
            </Pressable>
          ))}
        </View>

        {/* trainers */}
        <View style={{ marginTop: 28 }}>
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <H size={20}>Trainers at {CENTRE}</H>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
            {trainers.map((tr, i) => (
              <PressScale key={tr.id} onPress={() => router.push("/class/personal")} scale={0.97} accessibilityRole="button" accessibilityLabel={tr.name} style={{ width: 200 }}>
                <View style={{ height: 220, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface2 }}>
                  <Image source={classPhoto(i ? "crossfit" : "personal")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.85)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                  <View style={{ position: "absolute", top: 10, left: 10 }}>
                    <Tag label={`Level ${Math.min(3, Math.ceil(tr.experienceYears / 3))}`} tone="gold" />
                  </View>
                  <View style={{ position: "absolute", left: 12, right: 12, bottom: 12, alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", textTransform: "uppercase" }}>{tr.name}</Text>
                    <P size={11} style={{ color: "rgba(255,255,255,0.8)" }}>{tr.role} · {tr.experienceYears} yrs</P>
                  </View>
                </View>
              </PressScale>
            ))}
          </ScrollView>
        </View>

        {/* facilities */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <Label>Center facilities</Label>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {centreFacilities.map((f) => (
              <View key={f} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
                <Text style={{ color: colors.white, fontSize: 12, fontWeight: "600" }}>{f}</Text>
              </View>
            ))}
          </View>
          <P style={{ marginTop: 10 }}>
            {following ? "You follow this format — a reminder comes 30 minutes before each session." : "Tap the bell to follow this format and get a reminder 30 minutes before each session."}
          </P>
        </View>
      </ScrollView>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 12, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
        <CultButton label="Book now" variant="pink" onPress={() => scroller.current?.scrollTo({ y: Math.max(0, slotsY.current - 12), animated: true })} />
      </View>
    </View>
  );
}
