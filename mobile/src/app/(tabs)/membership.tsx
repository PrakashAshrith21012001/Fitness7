import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { plans, trialOffer, inr, wa } from "@f7/content";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { Body, Card, Display, LimeButton, Pill, SectionHeader } from "@/components/ui";

export default function Membership() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.black }}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 112,
      }}
      showsVerticalScrollIndicator={false}
    >
      <SectionHeader
        eyebrow="Membership"
        title="No joining fee"
        body="One price, everything included — classes, coaching, lockers and showers."
      />

      <View style={{ gap: 14 }}>
        {plans.map((plan) => (
          <Card key={plan.id} accent={plan.highlight}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Body size="micro" style={{ color: colors.white }}>
                {plan.name}
              </Body>
              {member?.plan?.id === plan.id ? <Pill label="Current" tone="lime" /> : plan.badge ? <Pill label={plan.badge} tone={plan.highlight ? "lime" : "muted"} /> : null}
            </View>

            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 12 }}>
              <Display size="hero">{inr(plan.priceINR)}</Display>
              {plan.compareAtINR ? (
                <Body size="small" style={{ textDecorationLine: "line-through", marginBottom: 6 }}>
                  {inr(plan.compareAtINR)}
                </Body>
              ) : null}
            </View>
            <Body size="micro" style={{ marginTop: 2 }}>{plan.period}</Body>

            <Body size="small" style={{ marginTop: 12 }}>{plan.summary}</Body>

            <View style={{ marginTop: 16, gap: 9 }}>
              {plan.features.map((f) => (
                <View key={f} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={plan.highlight ? colors.lime : colors.muted}
                  />
                  <Body style={{ flex: 1, color: colors.white }} size="small">{f}</Body>
                </View>
              ))}
            </View>

            <LimeButton
              label={member?.plan?.id === plan.id ? "Your current plan" : `Choose ${plan.name}`}
              icon={member?.plan?.id === plan.id ? "checkmark-circle" : "arrow-forward"}
              variant={member?.plan?.id === plan.id ? "soft" : "lime"}
              trailing={member?.plan?.id !== plan.id}
              onPress={() => member?.plan?.id !== plan.id && router.push({ pathname: "/upgrade/[plan]", params: { plan: plan.id } })}
              style={{ marginTop: 18 }}
            />
          </Card>
        ))}
      </View>

      <Card style={{ marginTop: 16 }}>
        <Display size="h2">{trialOffer.title}</Display>
        <Body style={{ marginTop: 8 }}>{trialOffer.body}</Body>
        <LimeButton
          label={trialOffer.cta}
          icon="flash"
          href={wa.trial()}
          style={{ marginTop: 16 }}
        />
      </Card>
    </ScrollView>
  );
}
