import { Stack } from "expo-router";
import { useColors } from "@/theme/ThemeProvider";

export default function OnboardingLayout() {
  const colors = useColors();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.black }, animation: "slide_from_right" }} />;
}
