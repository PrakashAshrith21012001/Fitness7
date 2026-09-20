import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

/**
 * The three ways in, behind the same three buttons the login screen always had.
 *
 *  phone  → Supabase OTP (SMS via the provider configured in the dashboard;
 *           test numbers with fixed codes while no provider is set — see supabase/README.md)
 *  google → expo-auth-session gets a Google ID token, Supabase verifies it
 *  apple  → expo-apple-authentication (iOS only), same idea
 */

export async function sendOtp(phoneE164: string): Promise<void> {
  const c = supabase();
  if (!c) return;
  const { error } = await c.auth.signInWithOtp({ phone: phoneE164 });
  if (error) throw error;
}

export async function verifyOtp(phoneE164: string, code: string): Promise<void> {
  const c = supabase();
  if (!c) return;
  const { error } = await c.auth.verifyOtp({ phone: phoneE164, token: code, type: "sms" });
  if (error) throw error;
}

export async function signInWithGoogleIdToken(idToken: string): Promise<void> {
  const c = supabase();
  if (!c) return;
  const { error } = await c.auth.signInWithIdToken({ provider: "google", token: idToken });
  if (error) throw error;
}

const GOOGLE = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
export const googleConfigured = !!GOOGLE.webClientId;

/**
 * Hook for the login screen. `promptAsync` opens Google; the returned promise
 * resolves with the ID token or null (cancelled / not configured).
 */
export function useGoogleIdToken(): { ready: boolean; prompt: () => Promise<string | null> } {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    // Placeholder ids keep the hook happy when Google isn't configured yet (local mode).
    clientId: GOOGLE.webClientId ?? "unconfigured.apps.googleusercontent.com",
    androidClientId: GOOGLE.androidClientId,
    iosClientId: GOOGLE.iosClientId,
    webClientId: GOOGLE.webClientId,
  });
  return {
    ready: googleConfigured && !!request,
    prompt: async () => {
      if (!googleConfigured || !request) return null;
      const res = await promptAsync();
      if (res.type !== "success") return null;
      return (res.params?.id_token as string | undefined) ?? res.authentication?.idToken ?? null;
    },
  };
}

export async function signInWithApple(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;
  const c = supabase();
  // Loaded lazily so Android and web never touch the native module.
  const Apple = await import("expo-apple-authentication");
  const rawNonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const cred = await Apple.signInAsync({
    requestedScopes: [Apple.AppleAuthenticationScope.FULL_NAME, Apple.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });
  if (!cred.identityToken) return false;
  if (!c) return true; // local mode: accepted on device
  const { error } = await c.auth.signInWithIdToken({ provider: "apple", token: cred.identityToken, nonce: rawNonce });
  if (error) throw error;
  return true;
}

export async function signOutEverywhere() {
  const c = supabase();
  if (!c) return;
  await c.auth.signOut().catch(() => {});
}
