import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { classes, type GymClass } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Display } from "@/components/ui";
import { PhotoCard } from "@/components/PhotoCard";
import { Enter } from "@/components/motion";
import { classPhoto } from "@/lib/photos";

/**
 * Classes — the "Choose your bottle" screen: a big title, one row of
 * category chips, a two-column grid of photo tiles with the follow bell in
 * the corner. Tap a tile for the class page.
 */

type Cat = "all" | "strength" | "cardio" | "mind" | "combat" | "coaching";
const CATS: { id: Cat; label: string; ids: string[] }[] = [
  { id: "all", label: "All", ids: [] },
  { id: "strength", label: "Strength", ids: ["strength", "crossfit"] },
  { id: "cardio", label: "Cardio", ids: ["hiit", "cardio"] },
  { id: "mind", label: "Mind & body", ids: ["yoga", "ladies"] },
  { id: "combat", label: "Combat", ids: ["combat"] },
  { id: "coaching", label: "Coaching", ids: ["personal"] },
];

export default function Classes() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { member, toggleFollow } = useSession();
  const [cat, setCat] = useState<Cat>("all");

  const list = useMemo<GymClass[]>(() => {
    const c = CATS.find((x) => x.id === cat)!;
    return cat === "all" ? classes : classes.filter((k) => c.ids.includes(k.id));
  }, [cat]);

  return (
    <ScrollView style={{ backgroundColor: colors.black }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 112 }} showsVerticalScrollIndicator={false}>
      <Body size="small" style={{ fontWeight: "600" }}>{classes.length} classes · every one coached</Body>
      <Display size="hero" style={{ marginTop: 6 }}>Find your{"\n"}class</Display>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 18 }} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
        {CATS.map((c) => {
          const on = c.id === cat;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setCat(c.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={{ minHeight: 40, paddingHorizontal: 16, justifyContent: "center", borderRadius: radius.pill, backgroundColor: on ? colors.green : colors.surface }}
            >
              <Body size="small" style={{ fontWeight: "600", color: on ? colors.onAccent : colors.white }}>{c.label}</Body>
            </Pressable>
          );
        })}
        <View style={{ width: 12 }} />
      </ScrollView>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 14 }}>
        {list.map((cls, i) => {
          const following = !!member?.followed.includes(cls.id);
          return (
            <Enter key={cls.id} index={i} style={{ width: "48%" }}>
              <PhotoCard
                photo={classPhoto(cls.id)}
                title={cls.name}
                meta={`${cls.durationMin} min · ${cls.intensity}`}
                width={undefined}
                height={200}
                corner={{ icon: following ? "notifications" : "notifications-outline", on: following, label: following ? `Stop following ${cls.name}` : `Follow ${cls.name}`, onPress: () => toggleFollow(cls.id) }}
                onPress={() => router.push({ pathname: "/class/[id]", params: { id: cls.id } })}
                accessibilityLabel={`${cls.name}, ${cls.durationMin} minutes, ${cls.intensity}`}
              />
            </Enter>
          );
        })}
      </View>
    </ScrollView>
  );
}
