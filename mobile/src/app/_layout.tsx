import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { SessionProvider, useSession } from "@/state/session";
import { FoodProvider } from "@/state/food";
import { DayProvider } from "@/state/day";
import { ContentProvider } from "@/state/content";
import { BookingsProvider } from "@/state/bookings";
import { CartProvider } from "@/state/cart";
import { TrackerProvider } from "@/state/tracker";
import { SavedToast } from "@/components/SavedToast";
import { Reminders } from "@/components/Reminders";

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

  // The calorie tracker is a white app (HealthifyMe look) in both themes; sleep sets its own light bar.
  const sub = (segments as string[])[1];
  const trackerPage = segments[0] === "food" && !["add", "snap", "recent", "activity", "sleep"].includes(sub ?? "");
  const slide = { animation: "slide_from_right" as const };
  const modal = { presentation: "modal" as const, animation: "slide_from_bottom" as const };

  return (
    <>
      <StatusBar style={trackerPage ? "dark" : theme === "dark" ? "light" : "dark"} />
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
        <Stack.Screen name="trek/[id]" options={slide} />
        <Stack.Screen name="class/[id]" options={slide} />
        <Stack.Screen name="booking/[id]" options={slide} />
        <Stack.Screen name="exercise/[id]" options={{ presentation: "fullScreenModal", animation: "fade" }} />
        <Stack.Screen name="activities/index" options={slide} />
        <Stack.Screen name="squad/index" options={slide} />
        <Stack.Screen name="activities/memories" options={slide} />
        <Stack.Screen name="activities/memory" options={{ presentation: "fullScreenModal", animation: "fade" }} />
        <Stack.Screen name="plan/index" options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="plan/result" options={slide} />
        <Stack.Screen name="store/category/[id]" options={slide} />
        <Stack.Screen name="store/product/[id]" options={slide} />
        <Stack.Screen name="store/cart" options={slide} />
        <Stack.Screen name="store/pay" options={{ presentation: "fullScreenModal", animation: "fade" }} />
        <Stack.Screen name="store/account" options={slide} />
        <Stack.Screen name="store/menu" options={{ presentation: "transparentModal", animation: "fade", contentStyle: { backgroundColor: "transparent" } }} />
        <Stack.Screen name="store/express" options={slide} />
        <Stack.Screen name="store/orders" options={slide} />
        <Stack.Screen name="settings" options={slide} />
        <Stack.Screen name="visit" options={slide} />
        <Stack.Screen name="chat" options={modal} />
        <Stack.Screen name="checkin" options={modal} />
        <Stack.Screen name="progress" options={slide} />
        <Stack.Screen name="upgrade/[plan]" options={modal} />
        <Stack.Screen name="upgrade/success" options={{ animation: "fade" }} />
        <Stack.Screen name="food/index" options={slide} />
        <Stack.Screen name="food/add" options={modal} />
        <Stack.Screen name="food/snap" options={modal} />
        <Stack.Screen name="food/recent" options={modal} />
        <Stack.Screen name="food/activity" options={modal} />
        {/* HealthifyMe-style tracker (v14) */}
        <Stack.Screen name="food/day" options={{ animation: "fade" }} />
        <Stack.Screen name="food/log" options={slide} />
        <Stack.Screen name="food/search" options={{ animation: "fade" }} />
        <Stack.Screen name="food/item" options={slide} />
        <Stack.Screen name="food/insights" options={slide} />
        <Stack.Screen name="food/recipes" options={slide} />
        <Stack.Screen name="food/recipe" options={slide} />
        <Stack.Screen name="food/weight" options={slide} />
        <Stack.Screen name="food/sleep" options={slide} />
        <Stack.Screen name="food/water" options={slide} />
        <Stack.Screen name="food/setup" options={{ presentation: "fullScreenModal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="food/snaps" options={slide} />
        <Stack.Screen name="food/meals" options={slide} />
      </Stack>
      <SavedToast />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <FoodProvider>
            <DayProvider>
              <ContentProvider>
                <BookingsProvider>
                  <CartProvider>
                    <TrackerProvider>
                      <Reminders />
                      <Gate />
                    </TrackerProvider>
                  </CartProvider>
                </BookingsProvider>
              </ContentProvider>
            </DayProvider>
          </FoodProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
