import { useEffect, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { brand, contact } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors, useTheme } from "@/theme/ThemeProvider";
import { useSession, prettyPhone } from "@/state/session";
import { isConfigured } from "@/lib/supabase";
import { useGoogleIdToken, googleConfigured } from "@/lib/auth";
import { Body, Display, LimeButton } from "@/components/ui";

/**
 * Sign in. One field, one button, then the two sign-ins that remove friction
 * (Hick's law: three ways in, not seven). Phone first because that is how a
 * Dharmapuri gym already talks to its members.
 *
 * With Supabase configured, "Continue" sends an SMS code and a 6-digit field
 * appears under the number — the only thing that moved. Google and Apple go
 * through Supabase too. Without keys (local mode) every button behaves as the
 * prototype did.
 */
export default function Login() {
  const colors = useColors();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, pendingPhone, verifyCode, cancelPending } = useSession();
  const google = useGoogleIdToken();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<TextInput>(null);

  const valid = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
  const codeValid = /^\d{6}$/.test(code);

  // Resend countdown while a code is pending
  useEffect(() => {
    if (!pendingPhone) return;
    setResendIn(30);
    setCode("");
    const t = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    const focus = setTimeout(() => codeRef.current?.focus(), 250);
    return () => {
      clearInterval(t);
      clearTimeout(focus);
    };
  }, [pendingPhone]);

  const fail = (msg: string) => {
    setError(msg);
    setBusy(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  };

  const go = async (provider: "phone" | "google" | "apple", identity: string) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await signIn({ provider, identity });
      setBusy(false);
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      if (msg.includes("google-not-configured")) fail("Google sign-in isn't set up yet — use your mobile number.");
      else if (msg.includes("cancelled")) setBusy(false);
      else if (/rate|too many|429/i.test(msg)) fail("Too many tries — wait a minute and try again.");
      else fail("Couldn't sign you in. Try again, or message us on WhatsApp.");
    }
  };

  const goGoogle = async () => {
    if (!isConfigured) return go("google", "google@member");
    if (!googleConfigured) return fail("Google sign-in isn't set up yet — use your mobile number.");
    setBusy(true);
    setError(null);
    try {
      const idToken = await google.prompt();
      setBusy(false);
      if (idToken) await go("google", idToken);
    } catch {
      fail("Google didn't respond. Try your mobile number.");
    }
  };

  const verify = async () => {
    if (!codeValid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifyCode(code);
      // On success the session provider hydrates and the route gate moves on.
    } catch {
      fail("That code didn't match. Check the SMS and try again.");
    }
  };

  const social = (label: string, icon: keyof typeof Ionicons.glyphMap, onPress: () => void) => (
    <Pressable
      onPress={onPress}
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

  const fieldStyle = (bad: boolean) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: bad ? colors.danger : colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  });

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
          <Body size="micro" style={{ marginBottom: 8 }}>Mobile number</Body>
          <View style={fieldStyle(!!error && !pendingPhone)}>
            <Body size="title" muted={false} style={{ marginRight: 10 }}>+91</Body>
            <TextInput
              value={phone}
              onChangeText={(v) => { setPhone(v.replace(/\D/g, "").slice(0, 10)); setError(null); if (pendingPhone) cancelPending(); }}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              placeholder="98765 43210"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Mobile number"
              editable={!pendingPhone}
              style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 14, opacity: pendingPhone ? 0.7 : 1 }}
              returnKeyType="done"
              onSubmitEditing={() => valid && go("phone", `+91${phone}`)}
            />
            {pendingPhone ? (
              <Pressable onPress={cancelPending} accessibilityRole="button" accessibilityLabel="Change number" hitSlop={10}>
                <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>Change</Body>
              </Pressable>
            ) : null}
          </View>

          {pendingPhone ? (
            <View style={{ marginTop: 16 }}>
              <Body size="micro" style={{ marginBottom: 8 }}>Code from the SMS</Body>
              <View style={fieldStyle(!!error)}>
                <TextInput
                  ref={codeRef}
                  value={code}
                  onChangeText={(v) => { setCode(v.replace(/\D/g, "").slice(0, 6)); setError(null); }}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  placeholder="6-digit code"
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="SMS code"
                  style={{ flex: 1, color: colors.white, ...type.title, paddingVertical: 14, letterSpacing: 4 }}
                  returnKeyType="done"
                  onSubmitEditing={verify}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Body size="small">Sent to {prettyPhone(pendingPhone)}</Body>
                <Pressable
                  onPress={() => resendIn === 0 && go("phone", pendingPhone)}
                  disabled={resendIn > 0}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Body size="small" style={{ color: resendIn > 0 ? colors.muted : colors.lime, fontWeight: "600" }}>
                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                  </Body>
                </Pressable>
              </View>
            </View>
          ) : null}

          {error ? <Body size="small" style={{ color: colors.danger, marginTop: 8 }}>{error}</Body> : null}
        </View>

        {pendingPhone ? (
          <LimeButton
            label={busy ? "Checking…" : "Verify"}
            icon="checkmark"
            onPress={verify}
            style={{ marginTop: 16, opacity: codeValid && !busy ? 1 : 0.5 }}
          />
        ) : (
          <LimeButton
            label={busy ? "Signing in…" : "Continue"}
            icon="arrow-forward"
            onPress={() => valid && go("phone", `+91${phone}`)}
            style={{ marginTop: 16, opacity: valid && !busy ? 1 : 0.5 }}
          />
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
          <Body size="micro">OR</Body>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        </View>

        <View style={{ gap: 12 }}>
          {social("Continue with Google", "logo-google", goGoogle)}
          {Platform.OS === "ios" ? social("Continue with Apple", "logo-apple", () => go("apple", "apple")) : null}
        </View>

        <View style={{ flex: 1 }} />
        <Body size="small" style={{ textAlign: "center", marginTop: 32 }}>
          By continuing you agree to be contacted about your membership on {contact.phoneDisplay}. No marketing lists.
        </Body>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
