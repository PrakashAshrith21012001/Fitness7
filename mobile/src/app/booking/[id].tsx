import { useMemo, useState } from "react";
import { Image, Linking, Platform, Pressable, ScrollView, Share, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { addressLine, centreFacilities, classes, contact, dealProducts, fmtRange, fmtTime, inr, squad, workoutById, type Exercise } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useBookings } from "@/state/bookings";
import { useSession } from "@/state/session";
import { CultButton, Divider, H, Label, NavyHeader, P, Pane, T, Tag } from "@/components/cult";
import { PressScale } from "@/components/motion";
import { MuscleMapMini } from "@/components/MuscleMap";
import { classPhoto, gymPhotos } from "@/lib/photos";
import { CENTRE, shortDay } from "@/components/BookingDates";
import { productImage } from "@/lib/storeImages";

/**
 * The booked class — cult.fit's class page, section for section: photo hero
 * with CONFIRMED, the slot, buddies, Set a Reminder chips, cancel / invite /
 * dropout rows, WORKOUT OF THE DAY (muscle focus + the three blocks with
 * play icons), CENTER FACILITIES, deal of the day, training collection and
 * the sticky MARK ATTENDANCE.
 */

const REMINDERS: { label: string; min: number | null; top?: boolean }[] = [
  { label: "1 hour\n30 mins", min: 90 },
  { label: "1 hour\n45 mins", min: 105 },
  { label: "2\nhours", min: 120, top: true },
  { label: "Other", min: 60 },
];

const hm = (t: string) => t.split(":").map(Number) as [number, number];

/** exercise thumbnail: a small square with a barbell glyph over a tinted photo */
function ExThumb({ index }: { index: number }) {
  const colors = useColors();
  const icons: (keyof typeof Ionicons.glyphMap)[] = ["barbell-outline", "body-outline", "fitness-outline", "walk-outline"];
  return (
    <View style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
      <Image source={gymPhotos.weights} style={{ position: "absolute", width: 40, height: 40, opacity: 0.35 }} resizeMode="cover" accessibilityIgnoresInvertColors />
      <Ionicons name={icons[index % icons.length]} size={20} color="#fff" />
    </View>
  );
}

function ExerciseRow({ ex, index, onPress }: { ex: Exercise; index: number; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Play ${ex.name}`} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingVertical: 6 }, pressed && { opacity: 0.7 }]}>
      <ExThumb index={index} />
      <T style={{ flex: 1 }}>{ex.name}</T>
      <Ionicons name="play" size={16} color={colors.white} />
    </Pressable>
  );
}

function ProductTile({ name, image, price, mrp, tint, onPress }: { name: string; image: string; price: number; mrp: number; tint: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <PressScale onPress={onPress} scale={0.97} accessibilityRole="button" accessibilityLabel={name} style={{ flex: 1 }}>
      <View style={{ aspectRatio: 1, borderRadius: 12, backgroundColor: tint, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
        <Image source={productImage(image)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
      </View>
      <T numberOfLines={1} style={{ marginTop: 8, fontSize: 13 }}>{name}</T>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: 2 }}>
        <T style={{ fontSize: 13 }}>{inr(price)}</T>
        <P style={{ textDecorationLine: "line-through" }}>{inr(mrp)}</P>
      </View>
      <View style={{ height: 0, borderColor: colors.line }} />
    </PressScale>
  );
}

function CollectionTile({ title, sub, photo, wide, onPress }: { title: string; sub: string; photo: ReturnType<typeof classPhoto>; wide?: boolean; onPress: () => void }) {
  return (
    <PressScale onPress={onPress} scale={0.98} accessibilityRole="button" accessibilityLabel={title} style={{ flex: 1 }}>
      <View style={{ height: wide ? 120 : 200, borderRadius: 14, overflow: "hidden", backgroundColor: "#1b2340" }}>
        <Image source={photo} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
        <LinearGradient colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
        <View style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </View>
        <View style={{ position: "absolute", left: 12, right: 12, bottom: 12, alignItems: wide ? "flex-start" : "center" }}>
          <T style={{ textAlign: wide ? "left" : "center" }}>{title}</T>
          <P style={{ color: "rgba(255,255,255,0.75)", textAlign: wide ? "left" : "center" }} size={11}>{sub}</P>
        </View>
      </View>
    </PressScale>
  );
}

export default function BookingPage() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { byId, setReminder, cancel, markAttendance } = useBookings();
  const { member, checkIn } = useSession();
  const booking = byId(id ?? "");
  const [wodOpen, setWodOpen] = useState(false);
  const [facOpen, setFacOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [marked, setMarked] = useState(false);

  const cls = classes.find((c) => c.id === booking?.classId);
  const workout = useMemo(() => (booking ? workoutById(booking.workoutId) : undefined), [booking]);
  const deals = useMemo(() => dealProducts().slice(0, 2), []);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));

  if (!booking || !cls || !workout) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.black }}>
        <NavyHeader title="Class" onBack={back} />
        <P style={{ padding: 16 }}>This booking is no longer here.</P>
      </View>
    );
  }

  const [h, m] = hm(booking.time);
  const cutoff = fmtTime((h - 1 + 24) % 24, m);
  const buddies = squad.filter((s) => booking.buddies.includes(s.id));
  const attended = booking.status === "attended" || marked;
  const tag = attended ? { label: "Completed", tone: "green" as const } : booking.status === "cancelled" ? { label: "Cancelled", tone: "muted" as const } : booking.status === "dropped" ? { label: "Dropped", tone: "muted" as const } : { label: "Confirmed", tone: "green" as const };
  const firstName = (member?.name ?? "Member").split(" ")[0];
  const tints = ["#f8d7e8", "#cfe4ff", "#ffe3c9", "#d5f5e3"];

  const invite = async () => {
    const text = `Join me for ${cls.name} at ${CENTRE} — ${shortDay(booking.date)}, ${fmtRange(h, m)}. Book on the Fitness 7 app.`;
    if (Platform.OS === "web") {
      const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }) : undefined;
      if (nav?.share) await nav.share({ text }).catch(() => {});
      return;
    }
    await Share.share({ message: text }).catch(() => {});
  };

  const attend = async () => {
    await markAttendance(booking.id);
    await checkIn().catch(() => false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setMarked(true);
  };

  const doCancel = async () => {
    await cancel(booking.id);
    back();
  };

  const openMaps = () => Linking.openURL(contact.mapsUrl).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <LinearGradient pointerEvents="none" colors={[colors.navyDeep, colors.black, colors.black]} locations={[0, 0.45, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <NavyHeader title={cls.name} onBack={back} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* hero */}
        <View style={{ alignItems: "center", paddingTop: 4 }}>
          <View style={{ width: 150, height: 150, borderRadius: 75, overflow: "hidden", backgroundColor: colors.surface2 }}>
            <Image source={classPhoto(cls.id)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
            <LinearGradient colors={["rgba(15,20,40,0)", "rgba(15,20,40,0.85)"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
          </View>
          <View style={{ marginTop: -14 }}>
            <Tag label={tag.label} tone={tag.tone} />
          </View>
          <P style={{ marginTop: 10, color: colors.white }}>{CENTRE}</P>
          <H size={18} style={{ marginTop: 6 }}>{shortDay(booking.date)}, {fmtRange(h, m)}</H>
          <P size={11} style={{ marginTop: 16, alignSelf: "flex-start", paddingHorizontal: 16 }}>
            {buddies.length ? `${buddies.length} ${buddies.length === 1 ? "buddy" : "buddies"} joining you in this class` : "No buddies yet — invite one below"}
          </P>
          {buddies.length ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", paddingHorizontal: 16, marginTop: 6 }}>
              {buddies.map((b) => (
                <View key={b.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: colors.white, fontSize: 9, fontWeight: "800" }}>{b.initials}</Text>
                  </View>
                  <T style={{ fontSize: 13 }}>{b.name}</T>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* reminder */}
        {!attended && booking.status === "confirmed" ? (
          <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
            <Pane>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="notifications-outline" size={18} color={colors.white} />
                <T>Set a Reminder</T>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
                {REMINDERS.map((r) => {
                  const on = booking.reminderMin === r.min;
                  return (
                    <View key={r.label} style={{ flex: 1 }}>
                      {r.top ? (
                        <View style={{ position: "absolute", top: -9, alignSelf: "center", zIndex: 2, backgroundColor: colors.white, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}>
                          <Text style={{ color: colors.black, fontSize: 7, fontWeight: "800" }}>Most opted</Text>
                        </View>
                      ) : null}
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync().catch(() => {});
                          setReminder(booking.id, on ? null : r.min);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remind ${r.label.replace("\n", " ")}`}
                        accessibilityState={{ selected: on }}
                        style={{ minHeight: 52, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: on ? "#ffffff" : colors.surface2, borderWidth: 1, borderColor: on ? "#ffffff" : colors.line }}
                      >
                        <Text style={{ color: on ? colors.black : colors.white, fontSize: 12, fontWeight: "600", textAlign: "center", lineHeight: 16 }}>{r.label}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              <Divider style={{ marginTop: 18 }} />
              <Pressable onPress={() => setConfirmCancel((v) => !v)} accessibilityRole="button" accessibilityLabel="Cancel class" style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
                <Ionicons name="close-circle-outline" size={20} color={colors.white} />
                <View style={{ flex: 1 }}>
                  <T>Cancel Class</T>
                  <P size={11}>Cancel by {cutoff}</P>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.white} />
              </Pressable>
              {confirmCancel ? (
                <View style={{ backgroundColor: colors.surface2, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <T>Cancel this class?</T>
                  <P style={{ marginTop: 4 }}>Your slot goes back to the waitlist. You can book again any time.</P>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <CultButton label="Keep it" variant="dark" small onPress={() => setConfirmCancel(false)} style={{ flex: 1 }} />
                    <CultButton label="Yes, cancel" variant="pink" small onPress={doCancel} style={{ flex: 1 }} />
                  </View>
                </View>
              ) : null}
              <Divider />
              <Pressable onPress={invite} accessibilityRole="button" accessibilityLabel="Invite buddies for workout" style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
                <Ionicons name="share-social-outline" size={20} color={colors.white} />
                <T style={{ flex: 1 }}>Invite buddies for workout</T>
                <Ionicons name="chevron-forward" size={18} color={colors.white} />
              </Pressable>
              <Divider />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 }}>
                <Ionicons name="close-circle-outline" size={20} color={colors.white} />
                <T style={{ flex: 1 }}>Dropout after {cutoff}</T>
                <Ionicons name="information-circle-outline" size={18} color={colors.gold} />
              </View>
            </Pane>
          </View>
        ) : null}

        {/* workout of the day */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <Label>Workout of the day</Label>
          <Pressable onPress={() => setWodOpen((v) => !v)} accessibilityRole="button" accessibilityLabel="Workout of the day" accessibilityState={{ expanded: wodOpen }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, minHeight: 44 }}>
            <T>{workout.focus}</T>
            <Ionicons name={wodOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.white} />
          </Pressable>
          {wodOpen ? (
            <View>
              <View style={{ alignItems: "center", paddingVertical: 12 }}>
                <MuscleMapMini muscles={workout.muscles} width={150} />
                <P style={{ marginTop: 10 }}>Focus for Today</P>
                <H size={22}>{workout.focus}</H>
              </View>
              {workout.blocks.map((b) => (
                <Pane key={b.title} style={{ marginTop: 12 }} padding={12}>
                  <H size={15} style={{ marginBottom: 6 }}>{b.title}</H>
                  {b.exercises.map((e, i) => (
                    <ExerciseRow key={e.id} ex={e} index={i} onPress={() => router.push(`/exercise/${e.id}`)} />
                  ))}
                </Pane>
              ))}
            </View>
          ) : null}
        </View>

        {/* facilities */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <Label>Center facilities</Label>
          <Pressable onPress={() => setFacOpen((v) => !v)} accessibilityRole="button" accessibilityLabel="Center facilities" accessibilityState={{ expanded: facOpen }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, minHeight: 44 }}>
            <T>{centreFacilities.slice(0, 2).join(" • ")} • +{centreFacilities.length - 2}</T>
            <Ionicons name={facOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.white} />
          </Pressable>
          {facOpen ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {centreFacilities.map((f) => (
                <View key={f} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }}>
                  <P size={12} style={{ color: colors.white }}>{f}</P>
                </View>
              ))}
            </View>
          ) : null}
          <Pressable onPress={openMaps} accessibilityRole="link" accessibilityLabel="Directions to Fitness 7 TS Square" style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 8 }}>
            <Ionicons name="location-outline" size={16} color={colors.white} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 13 }}>1.2 KM • {CENTRE}</T>
              <P size={11} numberOfLines={2}>{addressLine}</P>
            </View>
            <Ionicons name="navigate-outline" size={18} color={colors.white} />
          </Pressable>
        </View>

        {/* deal of the day */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <H size={17} numberOfLines={1}>{firstName}, deal of the day unlocked for you</H>
          <P style={{ marginTop: 4 }}>Everything you need for your workout sessions</P>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            {deals.map((p, i) => (
              <ProductTile key={p.id} name={p.name} image={p.image} price={p.priceINR} mrp={p.mrpINR} tint={tints[i % tints.length]} onPress={() => router.push(`/store/product/${p.id}`)} />
            ))}
          </View>
        </View>

        {/* training collection */}
        <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
          <H size={17}>Best of training collection</H>
          <P style={{ marginTop: 4 }}>Designed for strength and burn formats</P>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            <CollectionTile title="Training Apparel" sub="Tshirts, tights and more" photo={classPhoto("strength")} onPress={() => router.push("/store")} />
            <CollectionTile title="Training Accessories" sub="Sippers, duffle bags" photo={classPhoto("crossfit")} onPress={() => router.push("/store")} />
          </View>
          <View style={{ marginTop: 12 }}>
            <CollectionTile title="F7 Elite Essentials" sub="Next-level gear curated for members" photo={gymPhotos.floor} wide onPress={() => router.push("/store")} />
          </View>
        </View>
      </ScrollView>

      {/* sticky action */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 12, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
        {attended ? (
          <CultButton label="Attended ✓" variant="green" icon="checkmark" onPress={() => router.push("/activities")} />
        ) : booking.status === "confirmed" ? (
          <CultButton label="Mark attendance" variant="white" onPress={attend} />
        ) : (
          <CultButton label="Book again" variant="pink" onPress={() => router.push(`/class/${cls.id}`)} />
        )}
        {marked ? <P style={{ textAlign: "center", marginTop: 8, color: colors.success }}>Attendance marked — see you on the floor.</P> : null}
      </View>
    </View>
  );
}
