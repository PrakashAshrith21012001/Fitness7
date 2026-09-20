import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import { useRouter } from "expo-router";
import { brand } from "@f7/content";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body } from "@/components/ui";

/**
 * Welcome. Logo and the line, nothing else, centred — and it gets out of the
 * way in under two seconds. A returning member never sees it long enough to
 * read it.
 */
export default function Welcome() {
  const colors = useColors();
  const { theme } = useTheme();
  const router = useRouter();
  const { ready, member } = useSession();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      if (!member) router.replace("/(auth)/login");
      else if (!member.onboarded) router.replace("/onboarding");
      else router.replace("/(tabs)");
    }, 1400);
    return () => clearTimeout(t);
  }, [ready, member, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.black, alignItems: "center", justifyContent: "center", padding: 32 }}>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], alignItems: "center" }}>
        <Image
          source={theme === "dark" ? require("@/assets/brand/logo-dark.png") : require("@/assets/brand/logo-light.png")}
          style={{ width: 220, height: 105, resizeMode: "contain" }}
          accessibilityLabel={brand.fullName}
        />
        <Body size="micro" style={{ marginTop: 22, letterSpacing: 2.4, color: colors.muted }}>
          {brand.tagline.toUpperCase()}
        </Body>
      </Animated.View>
      <View style={{ position: "absolute", bottom: 48, width: 36, height: 3, borderRadius: 2, backgroundColor: colors.line, overflow: "hidden" }}>
        <Animated.View style={{ height: "100%", backgroundColor: colors.green, transform: [{ scaleX: fade }], width: "100%" }} />
      </View>
    </View>
  );
}
