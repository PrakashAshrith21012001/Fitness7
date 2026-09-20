import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";

/**
 * Five tabs, no more (Hick's law). Visit, Settings and the assistant are
 * pushed screens reached from Home and Profile, so the bar only holds what
 * a member opens every week.
 */
export default function TabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.lime,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { ...type.micro, fontWeight: "600", letterSpacing: 0.2 },
        sceneStyle: { backgroundColor: colors.black },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size - 3} color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: "Classes",
          tabBarIcon: ({ color, size }) => <Ionicons name="barbell" size={size - 2} color={color} />,
        }}
      />
      <Tabs.Screen
        name="treks"
        options={{
          title: "Treks",
          tabBarIcon: ({ color, size }) => <Ionicons name="trail-sign" size={size - 3} color={color} />,
        }}
      />
      <Tabs.Screen
        name="membership"
        options={{
          title: "Plans",
          tabBarIcon: ({ color, size }) => <Ionicons name="card" size={size - 3} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size - 3} color={color} />,
        }}
      />
    </Tabs>
  );
}
