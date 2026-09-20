import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { brand, contact } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Display, LimeButton } from "@/components/ui";

/**
 * Sign in. One field, one button, then the two sign-ins that remove friction
 * (Hick's law: three ways in, not seven). Phone first because that is how a
 * Dharmapuri gym already talks to its members.
 *
 * Google / Apple are wired to the same local session for now; they become
 * real with expo-auth-session + Supabase — the buttons and the flow after
 * them do not change.
 */
export default function Login() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));

  const go = async (provider: "phone" | "google" | "apple", identity: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await signIn({ provider, identity });
    } catch {
      setError("Couldn't sign you in. Try again, or message us on WhatsApp.");
      setBusy(false);
    }
  };

  const social = (label: string, icon: keyof typeof Ionicons.glyphMap, provider: "google" | "apple") => (
    <Pressable
      onPress={() => go(provider, `${provider}@member`)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          minHeight: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.line,
          backgroundColor: colors.surface,
        },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={icon} size={18} color={colors.white} />
      <Body size="title" muted={false} style={{ fontWeight: "600" }}>{label}</Body>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 40, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={theme === "dark" ? require("@/assets/brand/logo-dark.png") : require("@/assets/brand/logo-light.png")}
          style={{ width: 150, height: 72, resizeMode: "contain" }}
          accessibilityLabel={brand.fullName}
        />

        <Display size="h1" style={{ marginTop: 36 }}>Welcome to {brand.name}</Display>
        <Body style={{ marginTop: 10 }}>
          Sign in with the number the gym has for you. New here? The same number gets you a free trial.
        </Body>

        <View style={{ marginTop: 28 }}>
          <Body size="micro" style={{ marginBottom: 8, letterSpacing: 1.4 }}>MOBILE NUMBER</Body>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              minHeight: 56,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.line,
              backgroundColor: colors.surface,
              paddingHorizontal: 16,
            }}
          >
            <Body size="title" muted={false} style={{ marginRight: 10 }}>+91</Body>
            <TextInput
              value={phone}
              onChangeText={(v) => { setPhone(v.replace(/\D/g, "").slice(0, 10)); setError(null); }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              placeholder="98765 43210"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Mobile number"
              style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 14 }}
              returnKeyType="done"
              onSubmitEditing={() => valid && go("phone", `+91${phone}`)}
            />
          </View>
          {error ? <Body size="small" style={{ color: colors.danger, marginTop: 8 }}>{error}</Body> : null}
        </View>

        <LimeButton
          label={busy ? "Signing in…" : "Continue"}
          icon="arrow-forward"
          onPress={() => valid && go("phone", `+91${phone}`)}
          style={{ marginTop: 16, opacity: valid && !busy ? 1 : 0.5 }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
          <Body size="micro">OR</Body>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        </View>

        <View style={{ gap: 12 }}>
          {social("Continue with Google", "logo-google", "google")}
          {Platform.OS === "ios" ? social("Continue with Apple", "logo-apple", "apple") : null}
        </View>

        <View style={{ flex: 1 }} />
        <Body size="small" style={{ textAlign: "center", marginTop: 32 }}>
          By continuing you agree to be contacted about your membership on {contact.phoneDisplay}. No marketing lists.
        </Body>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
