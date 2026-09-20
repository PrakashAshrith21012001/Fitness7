import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { SessionProvider, useSession } from "@/state/session";

/**
 * Route gate. Jakob's law: the app behaves like every app people already use —
 * welcome → sign in → a short onboarding → the tabs. Signed-in members never
 * see the first three again.
 */
function Gate() {
  const { ready, member } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (!ready) return;
    const top = segments[0] as string | undefined;
    const inAuth = top === "(auth)";
    const inOnboarding = top === "onboarding";
    const atWelcome = top === undefined || top === "index";

    if (!member) {
      if (!inAuth && !atWelcome) router.replace("/");
    } else if (!member.onboarded) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (inAuth || inOnboarding || atWelcome) {
      router.replace("/(tabs)");
    }
  }, [ready, member, segments, router]);

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.black },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="trek/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="visit" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="chat" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="checkin" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="progress" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="upgrade/[plan]" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="upgrade/success" options={{ animation: "fade" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <Gate />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
