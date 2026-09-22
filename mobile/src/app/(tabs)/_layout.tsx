import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/theme/ThemeProvider";

/**
 * The cult.fit bar: five tabs on a solid deep-navy strip, line icons with
 * the label under, active in white. Home · Fitness · Treks (cult's Sports)
 * · Store · Transform. Profile lives inside Fitness → MY PROFILE, exactly
 * where the reference keeps it.
 */
export default function TabsLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.navyDeep,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: "600", marginTop: 2 },
        sceneStyle: { backgroundColor: colors.black },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="fitness" options={{ title: "Fitness", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "body" : "body-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="treks" options={{ title: "Treks", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "walk" : "walk-outline"} size={22} color={color} /> }} />
      <Tabs.Screen name="store" options={{ title: "Store", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "bag-handle" : "bag-handle-outline"} size={22} color={color} /> }} />
      {/* pushed from the tabs, not in the bar */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="membership" options={{ href: null }} />
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="transform" options={{ title: "Transform", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "sync-circle" : "sync-circle-outline"} size={22} color={color} /> }} />
    </Tabs>
  );
}
