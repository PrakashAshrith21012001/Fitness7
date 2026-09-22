import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/theme/ThemeProvider";
import { H, NavyPage, Segmented } from "@/components/cult";
import { FitnessCenter } from "@/components/FitnessCenter";
import { FitnessHome } from "@/components/FitnessHome";
import { FitnessProfile } from "@/components/FitnessProfile";

/**
 * Fitness — cult.fit's Fitness tab: "Fitness" + pin + search, then the
 * AT CENTER · AT HOME · MY PROFILE underline tabs. `?tab=profile` opens
 * MY PROFILE straight away (Home's "view my squad" tile, the avatar).
 */
type Tab = "center" | "home" | "profile";

export default function Fitness() {
  const colors = useColors();
  const router = useRouter();
  const { tab: param } = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(param === "profile" ? "profile" : param === "home" ? "home" : "center");
  useEffect(() => {
    if (param === "profile" || param === "home" || param === "center") setTab(param);
  }, [param]);

  const header = (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48 }}>
        <H size={20}>Fitness</H>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={() => router.push("/visit")} accessibilityRole="button" accessibilityLabel="Centre location" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="location-outline" size={22} color={colors.white} />
          </Pressable>
          <Pressable onPress={() => router.push("/classes")} accessibilityRole="button" accessibilityLabel="Search classes" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="search-outline" size={22} color={colors.white} />
          </Pressable>
          {tab === "profile" ? (
            <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" accessibilityLabel="Settings" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="settings-outline" size={22} color={colors.white} />
            </Pressable>
          ) : null}
        </View>
      </View>
      <Segmented<Tab>
        items={[
          { id: "center", label: "At center" },
          { id: "home", label: "At home" },
          { id: "profile", label: "My profile" },
        ]}
        value={tab}
        onChange={setTab}
      />
    </View>
  );

  return (
    <NavyPage scroll={false} header={header} contentStyle={{ flex: 1, paddingBottom: 0 }}>
      {tab === "center" ? <FitnessCenter /> : tab === "home" ? <FitnessHome /> : <FitnessProfile />}
    </NavyPage>
  );
}
