import { useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { CLASS_DURATION_MIN } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useBookings, className, type Booking } from "@/state/bookings";
import { CultButton, H, NavyHeader, NavyPage, P, Pane, T, Tag } from "@/components/cult";
import { classPhoto } from "@/lib/photos";
import { relativeLabel } from "@/components/BookingDates";

/**
 * Past Activities — cult's list: a date label ("Yesterday", "20 Sep"), then
 * a pane per class with the photo, the name, COMPLETED • 50 mins, and a
 * full-width HIGHLIGHT button that opens the memory.
 */
export default function PastActivities() {
  const colors = useColors();
  const router = useRouter();
  const { past } = useBookings();
  const groups = useMemo(() => {
    const out: { date: string; items: Booking[] }[] = [];
    for (const b of past) {
      const g = out[out.length - 1];
      if (g && g.date === b.date) g.items.push(b);
      else out.push({ date: b.date, items: [b] });
    }
    return out;
  }, [past]);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));

  return (
    <NavyPage
      top={false}
      header={
        <NavyHeader
          title="Past Activities"
          onBack={back}
          right={
            <Pressable onPress={() => router.push("/chat")} accessibilityRole="button" accessibilityLabel="Help" hitSlop={10} style={{ paddingHorizontal: 12, minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>HELP</Text>
            </Pressable>
          }
        />
      }
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        {groups.length === 0 ? (
          <Pane style={{ marginTop: 12 }}>
            <T>No classes yet</T>
            <P style={{ marginTop: 4 }}>Book a class and mark attendance — it shows up here with a memory.</P>
            <CultButton label="Book a class" variant="pink" style={{ marginTop: 14 }} onPress={() => router.push("/fitness")} />
          </Pane>
        ) : null}
        {groups.map((g) => (
          <View key={g.date} style={{ marginBottom: 6 }}>
            <H size={15} style={{ marginTop: 14, marginBottom: 10 }}>{relativeLabel(g.date)}</H>
            {g.items.map((b) => (
              <Pane key={b.id} padding={0} style={{ marginBottom: 12, overflow: "hidden" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 12 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", backgroundColor: colors.surface2 }}>
                    <Image source={classPhoto(b.classId)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T>{className(b.classId)}</T>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <Tag label="Completed" tone="green" />
                      <P size={12}>• {CLASS_DURATION_MIN} mins</P>
                    </View>
                  </View>
                </View>
                <Pressable onPress={() => router.push({ pathname: "/activities/memory", params: { id: b.id } })} accessibilityRole="button" accessibilityLabel={`Highlight of ${className(b.classId)}`} style={({ pressed }) => [{ minHeight: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface2, borderTopWidth: 1, borderTopColor: colors.line }, pressed && { opacity: 0.7 }]}>
                  <Text style={{ color: colors.white, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>HIGHLIGHT</Text>
                </Pressable>
              </Pane>
            ))}
          </View>
        ))}
      </View>
    </NavyPage>
  );
}
