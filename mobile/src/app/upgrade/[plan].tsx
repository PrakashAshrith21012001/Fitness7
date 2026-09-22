import { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { plans, inr, wa, contact } from "@f7/content";
import { radius } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Card, Display, Eyebrow, LimeButton, Pill } from "@/components/ui";
import { Screen } from "@/components/Screen";

type Method = "desk" | "upi" | "whatsapp";

const methods: { id: Method; label: string; detail: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "upi", label: "UPI", detail: "GPay / PhonePe / Paytm — pay now", icon: "qr-code-outline" },
  { id: "desk", label: "Pay at the gym", detail: "Cash or card at the front desk", icon: "storefront-outline" },
  { id: "whatsapp", label: "Confirm on WhatsApp", detail: "We send a payment link", icon: "logo-whatsapp" },
];

function renewsFrom(planId: string) {
  const d = new Date();
  const months = planId === "annual" || planId === "yearly" ? 12 : planId === "quarterly" ? 3 : planId === "half-yearly" ? 6 : 1;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

/**
 * Confirm a plan. One screen: what you're buying, what it costs, how you'll
 * pay, one green button. Payment is a stub — the app records the plan and
 * hands off to UPI / the desk / WhatsApp. Razorpay drops in here later
 * without changing the screens around it.
 */
export default function Upgrade() {
  const colors = useColors();
  const router = useRouter();
  const { plan: planId } = useLocalSearchParams<{ plan: string }>();
  const { member, update } = useSession();
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const [method, setMethod] = useState<Method>("upi");
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (method === "whatsapp") Linking.openURL(wa.plan(plan)).catch(() => {});
    if (method === "upi") {
      // Owner's UPI ID goes in contact.upi; until then the desk / WhatsApp path completes the sale.
      const upi = (contact as { upi?: string }).upi;
      if (upi) Linking.openURL(`upi://pay?pa=${upi}&pn=${encodeURIComponent("Fitness 7 Gym")}&am=${plan.priceINR}&cu=INR`).catch(() => {});
    }
    await update({ plan: { id: plan.id, name: plan.name, renewsOn: renewsFrom(plan.id) } });
    router.replace({ pathname: "/upgrade/success", params: { plan: plan.id, method } });
  };

  return (
    <Screen title="Confirm plan">
      <Card accent={plan.highlight}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Eyebrow>{plan.name}</Eyebrow>
          {plan.badge ? <Pill label={plan.badge} tone="lime" /> : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 10 }}>
          <Display size="hero">{inr(plan.priceINR)}</Display>
          {plan.compareAtINR ? (
            <Body size="small" style={{ textDecorationLine: "line-through", marginBottom: 6 }}>
              {inr(plan.compareAtINR)}
            </Body>
          ) : null}
        </View>
        <Body size="micro" style={{ marginTop: 2 }}>
          {plan.period} · no joining fee
        </Body>
        <View style={{ marginTop: 14, gap: 8 }}>
          {plan.features.map((f) => (
            <View key={f} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Ionicons name="checkmark-circle" size={16} color={colors.lime} />
              <Body size="small" muted={false} style={{ flex: 1 }}>
                {f}
              </Body>
            </View>
          ))}
        </View>
        <Pressable onPress={() => router.replace("/membership")} accessibilityRole="button" hitSlop={8} style={{ marginTop: 14, minHeight: 32, justifyContent: "center" }}>
          <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>
            Change plan
          </Body>
        </Pressable>
      </Card>

      <Body size="micro" style={{ marginTop: 24, marginBottom: 10 }}>
        How would you like to pay?
      </Body>
      <View style={{ gap: 10 }}>
        {methods.map((m) => {
          const on = m.id === method;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setMethod(m.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={{
                minHeight: 64,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                padding: 14,
                borderRadius: radius.md,
                borderWidth: on ? 2 : 1,
                borderColor: on ? colors.green : colors.line,
                backgroundColor: on ? colors.limeSoft : colors.surface,
              }}
            >
              <Ionicons name={m.icon} size={22} color={on ? colors.lime : colors.muted} />
              <View style={{ flex: 1 }}>
                <Body size="title" muted={false} style={{ fontWeight: "600" }}>
                  {m.label}
                </Body>
                <Body size="small">{m.detail}</Body>
              </View>
              <Ionicons name={on ? "radio-button-on" : "radio-button-off"} size={20} color={on ? colors.lime : colors.muted} />
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: 24, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 6 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Body size="small">{plan.name} plan</Body>
          <Body size="small" muted={false}>
            {inr(plan.priceINR)}
          </Body>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Body size="small">Joining fee</Body>
          <Body size="small" style={{ color: colors.lime }}>
            Free
          </Body>
        </View>
        <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Body size="title" muted={false} style={{ fontWeight: "700" }}>
            Total
          </Body>
          <Body size="title" muted={false} style={{ fontWeight: "700" }}>
            {inr(plan.priceINR)}
          </Body>
        </View>
      </View>

      <LimeButton
        label={busy ? "Confirming…" : method === "whatsapp" ? "Continue on WhatsApp" : `Confirm ${plan.name}`}
        icon={method === "whatsapp" ? "logo-whatsapp" : "checkmark"}
        onPress={confirm}
        style={{ marginTop: 20 }}
      />
      <Body size="small" style={{ textAlign: "center", marginTop: 12 }}>
        {member?.name ? `Signed in as ${member.name}. ` : ""}Cancel any time by messaging the gym.
      </Body>
    </Screen>
  );
}
