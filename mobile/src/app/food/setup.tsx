import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { AGE_RANGE, HEIGHT_RANGE, WEIGHT_RANGE, bmi, idealRange, kgToLb, lbToKg } from "@f7/content";
import { useSession } from "@/state/session";
import { useTracker } from "@/state/tracker";
import { useBookings } from "@/state/bookings";
import { Btn, HT, OptionPill, Toggle, hm, tap } from "@/components/hm";

const GOALS = [
  { id: "coach", label: "Coach Guidance", icon: "people-outline" },
  { id: "snap", label: "Snap", icon: "camera-outline" },
  { id: "diet", label: "Diet Plan", icon: "nutrition-outline" },
  { id: "weight-loss", label: "Weight Loss", icon: "scale-outline" },
  { id: "if", label: "Intermittent Fasting", icon: "timer-outline" },
  { id: "calories", label: "Calorie Tracker", icon: "restaurant-outline" },
  { id: "muscle", label: "Muscle Gain", icon: "barbell-outline" },
  { id: "workouts", label: "Workouts and Yoga", icon: "body-outline" },
  { id: "healthy-food", label: "Healthy Foods", icon: "leaf-outline" },
  { id: "trek", label: "Trek Fitness", icon: "trail-sign-outline" },
] as const;

const CITIES = ["Dharmapuri", "Krishnagiri", "Hosur", "Salem", "Bengaluru", "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Vellore", "Erode", "Namakkal"];
const LANGS = ["Tamil (தமிழ்)", "English", "Hindi (हिन्दी)", "Telugu (తెలుగు)", "Kannada (ಕನ್ನಡ)", "Malayalam (മലയാളം)", "Other"];
const CONDITIONS = ["Diabetes", "Pre-Diabetes", "Cholesterol", "Hypertension", "PCOS", "Thyroid", "Physical Injury", "Excessive stress/anxiety", "Sleep issues", "Back or knee pain", "Asthma", "Heart condition"];

type Step = "goals" | "age" | "sex" | "height" | "city" | "weight" | "target" | "medical" | "health";

/**
 * Tracker setup — HealthifyMe's question flow, one question a screen with a
 * progress bar and Skip: what you're looking for, age, (sex and height when
 * we don't have them), city and language, weight, target weight with the
 * BMI range, medical conditions, then health-app sync. Answers fill the
 * member profile that drives the calorie and macro targets.
 */
export default function TrackerSetup() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { member, update, logWeight } = useSession();
  const { state, patch, setGoal } = useTracker();
  const { setHealth } = useBookings();
  const latest = member?.weights.length ? member.weights[member.weights.length - 1].kg : undefined;

  const steps = useMemo<Step[]>(() => {
    const s: Step[] = ["goals", "age"];
    if (!member?.sex) s.push("sex");
    if (!member?.heightCm) s.push("height");
    s.push("city", "weight", "target", "medical", "health");
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(0);
  const step = steps[i];

  const [goals, setGoals] = useState<string[]>(state.lookingFor.length ? state.lookingFor : ["calories"]);
  const [age, setAge] = useState(member?.age ? String(member.age) : "");
  const [sex, setSex] = useState<"male" | "female" | undefined>(member?.sex);
  const [height, setHeight] = useState(member?.heightCm ? String(member.heightCm) : "");
  const [city, setCity] = useState(state.city ?? "");
  const [cityQ, setCityQ] = useState(state.city ?? "");
  const [lang, setLang] = useState(state.language ?? "");
  const [unit, setUnit] = useState<"kg" | "lb">(state.unit);
  const [weight, setWeight] = useState(latest ? String(unit === "lb" ? kgToLb(latest) : latest) : "");
  const [target, setTarget] = useState(state.targetKg ? String(unit === "lb" ? kgToLb(state.targetKg) : state.targetKg) : "");
  const [conds, setConds] = useState<string[]>(state.conditions.length ? state.conditions : ["None"]);
  const [busy, setBusy] = useState(false);

  const num = (s: string) => {
    const n = Number(s.replace(",", "."));
    return s.trim() && isFinite(n) ? n : null;
  };
  const toKg = (s: string) => {
    const n = num(s);
    return n === null ? null : unit === "lb" ? lbToKg(n) : n;
  };
  const ageN = num(age);
  const ageOk = ageN !== null && Number.isInteger(ageN) && ageN >= AGE_RANGE.min && ageN <= AGE_RANGE.max;
  const hN = num(height);
  const hOk = hN !== null && hN >= HEIGHT_RANGE.min && hN <= HEIGHT_RANGE.max;
  const kg = toKg(weight);
  const kgOk = kg !== null && kg >= WEIGHT_RANGE.min && kg <= WEIGHT_RANGE.max;
  const tkg = toKg(target);
  const tOk = tkg !== null && tkg >= WEIGHT_RANGE.min && tkg <= WEIGHT_RANGE.max;
  const heightCm = member?.heightCm ?? (hOk ? hN! : undefined);
  const range = heightCm ? idealRange(heightCm) : null;
  const show = (k: number) => (unit === "lb" ? kgToLb(k) : Math.round(k * 10) / 10);
  const u = unit === "lb" ? "lbs" : "kg";
  const rangeMsg = `Weight must be within ${unit === "lb" ? `${Math.round(kgToLb(WEIGHT_RANGE.min))}-${Math.round(kgToLb(WEIGHT_RANGE.max))} Lb` : `${WEIGHT_RANGE.min}-${WEIGHT_RANGE.max} Kg`} range.`;

  const valid: Record<Step, boolean> = {
    goals: goals.length > 0,
    age: ageOk,
    sex: !!sex,
    height: hOk,
    city: !!city && !!lang,
    weight: kgOk,
    target: tOk,
    medical: conds.length > 0,
    health: true,
  };

  const finish = async (sync: boolean | null) => {
    if (busy) return;
    setBusy(true);
    try {
      const p: Parameters<typeof update>[0] = {};
      if (ageOk) p.age = ageN!;
      if (sex) p.sex = sex;
      if (!member?.heightCm && hOk) p.heightCm = Math.round(hN!);
      if (goals.includes("weight-loss") && !member?.goal) p.goal = "fat-loss";
      else if (goals.includes("muscle") && !member?.goal) p.goal = "strength";
      if (Object.keys(p).length) await update(p);
      if (kgOk && (latest === undefined || Math.abs(latest - kg!) >= 0.05)) await logWeight(Math.round(kg! * 10) / 10);
      if (tOk) await setGoal(tkg!, kgOk ? kg! : latest ?? tkg!);
      if (sync !== null) await setHealth({ apple: sync });
      await patch({ setupDone: true, lookingFor: goals, city: city || undefined, language: lang || undefined, conditions: conds.filter((c) => c !== "None"), unit, healthSync: sync === null ? state.healthSync : sync ? "apple" : "manual", welcomeDismissed: false });
      leave();
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (!valid[step]) return;
    if (i < steps.length - 1) setI(i + 1);
  };
  // Setup is opened on top of the tracker; going back lands there with the new numbers.
  const leave = () => (router.canGoBack() ? router.back() : router.replace("/food"));
  const skip = async () => {
    await patch({ setupDone: true });
    leave();
  };

  const field = ({ value, onChange, suffix, ok, error, placeholder, decimal }: { value: string; onChange: (v: string) => void; suffix: string; ok: boolean; error: string; placeholder?: string; decimal?: boolean }) => (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: value && !ok ? hm.red : "#cfd2d8", borderRadius: 6, paddingHorizontal: 12, height: 46, backgroundColor: "#fff", marginTop: 26 }}>
        <TextInput value={value} onChangeText={(t) => onChange(t.replace(decimal ? /[^0-9.,]/g : /[^0-9]/g, ""))} autoFocus keyboardType={decimal ? "decimal-pad" : "number-pad"} placeholder={placeholder} placeholderTextColor={hm.faint} accessibilityLabel={suffix} maxLength={6} onSubmitEditing={next} style={{ flex: 1, fontSize: 16, color: hm.ink, height: 44 }} />
        <HT size={13} color={hm.faint}>{suffix}</HT>
      </View>
      {value && !ok ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
          <Ionicons name="alert-circle-outline" size={13} color={hm.red} />
          <HT size={11} color={hm.red}>{error}</HT>
        </View>
      ) : null}
    </>
  );

  const title = (t: string, sub?: string) => (
    <View style={{ marginTop: 20 }}>
      <HT size={22} weight="500" center>{t}</HT>
      {sub ? <HT size={12} color={hm.sub} center style={{ marginTop: 8, paddingHorizontal: 10 }}>{sub}</HT> : null}
    </View>
  );

  const body = () => {
    switch (step) {
      case "goals":
        return (
          <>
            {title("What are you looking for?", "Selecting one or more options would help us tailor your experience.")}
            <View style={{ gap: 10, marginTop: 22 }}>
              {GOALS.map((g) => {
                const on = goals.includes(g.id);
                return (
                  <Pressable key={g.id} onPress={() => { tap(); setGoals((x) => (on ? x.filter((y) => y !== g.id) : [...x, g.id])); }} accessibilityRole="checkbox" accessibilityState={{ checked: on }} aria-checked={on} accessibilityLabel={g.label} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 8, borderWidth: 1, borderColor: on ? hm.teal : "#e6e7eb", backgroundColor: on ? hm.tealSoft : "#fff", paddingHorizontal: 14, height: 50 }}>
                    <Ionicons name={g.icon} size={20} color={hm.ink} />
                    <HT size={14} weight="500" style={{ flex: 1 }}>{g.label}</HT>
                    <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: on ? hm.teal : "#8e8e93", alignItems: "center", justifyContent: "center" }}>
                      {on ? <Ionicons name="checkmark" size={15} color={hm.teal} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        );
      case "age":
        return (
          <>
            {title("What's your Age?", "Your age determines how much you should consume.\n(Select your age in years)")}
            {field({ value: age, onChange: setAge, suffix: "Years", ok: ageOk, error: `Age must be within ${AGE_RANGE.min}-${AGE_RANGE.max} Years range.` })}
          </>
        );
      case "sex":
        return (
          <>
            {title("What's your gender?", "Men and women burn energy at different rates at rest.")}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 26 }}>
              {(["male", "female"] as const).map((s) => (
                <Pressable key={s} onPress={() => { tap(); setSex(s); }} accessibilityRole="radio" accessibilityState={{ checked: sex === s }} aria-checked={sex === s} accessibilityLabel={s === "male" ? "Male" : "Female"} style={{ flex: 1, height: 110, borderRadius: 12, borderWidth: sex === s ? 2 : 1, borderColor: sex === s ? hm.teal : "#e3e5ea", backgroundColor: sex === s ? hm.tealSoft : "#fff", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Ionicons name={s === "male" ? "male" : "female"} size={30} color={hm.teal} />
                  <HT size={15} weight="500">{s === "male" ? "Male" : "Female"}</HT>
                </Pressable>
              ))}
            </View>
          </>
        );
      case "height":
        return (
          <>
            {title("What's your height?", "We use it for your BMI and ideal weight range.")}
            {field({ value: height, onChange: setHeight, suffix: "cm", ok: hOk, error: `Height must be within ${HEIGHT_RANGE.min}-${HEIGHT_RANGE.max} cm range.`, placeholder: "170" })}
          </>
        );
      case "city": {
        const list = CITIES.filter((c) => !cityQ || c.toLowerCase().includes(cityQ.toLowerCase()));
        return (
          <>
            {title("Where are you from?", "This will help us personalize the app for you.")}
            <View style={{ flexDirection: "row", alignItems: "center", borderRadius: 6, backgroundColor: "#fff", paddingHorizontal: 12, height: 44, marginTop: 18, borderWidth: 1, borderColor: "#e3e5ea" }}>
              <TextInput value={cityQ} onChangeText={(t) => { setCityQ(t); if (city && t !== city) setCity(""); }} placeholder="Search for your city" placeholderTextColor={hm.faint} accessibilityLabel="Search for your city" style={{ flex: 1, fontSize: 14, color: hm.ink, height: 42 }} onSubmitEditing={() => { if (cityQ.trim().length > 1) setCity(cityQ.trim()); }} />
              {cityQ ? (
                <Pressable onPress={() => { setCityQ(""); setCity(""); }} accessibilityRole="button" accessibilityLabel="Clear city" hitSlop={8}>
                  <Ionicons name="close" size={18} color={hm.ink} />
                </Pressable>
              ) : (
                <Ionicons name="search" size={18} color={hm.ink} />
              )}
            </View>
            {!city ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                {list.map((c) => (
                  <Pressable key={c} onPress={() => { tap(); setCity(c); setCityQ(c); }} accessibilityRole="button" accessibilityLabel={c} style={{ width: "30.5%", aspectRatio: 1, borderRadius: 8, backgroundColor: "#eef0f3", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <CityGlyph />
                    <HT size={10} color={hm.ink2} center>{c}</HT>
                  </Pressable>
                ))}
                {cityQ.trim().length > 1 && !list.length ? (
                  <Pressable onPress={() => setCity(cityQ.trim())} accessibilityRole="button" accessibilityLabel={`Use ${cityQ.trim()}`} style={{ paddingVertical: 10 }}>
                    <HT size={13} weight="500" color={hm.teal}>Use “{cityQ.trim()}”</HT>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <>
                <HT size={20} weight="500" center style={{ marginTop: 34 }}>What language do you prefer to speak in?</HT>
                <HT size={11} color={hm.sub} center style={{ marginTop: 8 }}>This does not affect your app language.</HT>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18, justifyContent: "center" }}>
                  {LANGS.map((l) => (
                    <OptionPill key={l} label={l} on={lang === l} onPress={() => setLang(l)} />
                  ))}
                </View>
              </>
            )}
          </>
        );
      }
      case "weight":
        return (
          <>
            {title("What's your current weight?", "This will help us determine your goal, and monitor your progress over time.")}
            {field({ value: weight, onChange: setWeight, suffix: unit === "lb" ? "Lb" : "Kg", ok: kgOk, error: rangeMsg, decimal: true })}
            <View style={{ marginTop: 18 }}>
              <Toggle items={[{ id: "kg", label: "Kg" }, { id: "lb", label: "Lb" }]} value={unit} onChange={(v) => { const k = toKg(weight); const t = toKg(target); setUnit(v); if (k !== null) setWeight(String(v === "lb" ? kgToLb(k) : Math.round(k * 10) / 10)); if (t !== null) setTarget(String(v === "lb" ? kgToLb(t) : Math.round(t * 10) / 10)); }} />
            </View>
          </>
        );
      case "target": {
        const b = kgOk && heightCm ? bmi(kg!, heightCm) : null;
        const aligned = tOk && range ? tkg! >= range.min && tkg! <= range.max : null;
        return (
          <>
            {title("What's your target weight?", "Set a realistic weight goal for yourself.")}
            {range ? (
              <View style={{ backgroundColor: aligned === false ? "#fff4e5" : "#e3ece9", borderRadius: 6, padding: 14, marginTop: 18 }}>
                <HT size={12} weight="500" color={aligned === false ? "#8a5a00" : hm.teal} center>
                  {aligned === true
                    ? `Your target weight is perfectly aligned with your ideal weight range of ${show(range.min)}-${show(range.max)} ${u}`
                    : aligned === false
                      ? `This is outside your ideal range of ${show(range.min)}-${show(range.max)} ${u}. You can still go for it — your coach will help you do it safely.`
                      : `Based on your BMI of ${b ?? "—"}, your Ideal Weight range is ${show(range.min)}-${show(range.max)} ${u}`}
                </HT>
              </View>
            ) : null}
            {field({ value: target, onChange: setTarget, suffix: unit === "lb" ? "Lb" : "Kg", ok: tOk, error: rangeMsg, decimal: true, placeholder: kgOk ? String(show(kg!)) : "" })}
            <View style={{ marginTop: 18 }}>
              <Toggle items={[{ id: "kg", label: "Kg" }, { id: "lb", label: "Lb" }]} value={unit} onChange={(v) => { const k = toKg(weight); const t = toKg(target); setUnit(v); if (k !== null) setWeight(String(v === "lb" ? kgToLb(k) : Math.round(k * 10) / 10)); if (t !== null) setTarget(String(v === "lb" ? kgToLb(t) : Math.round(t * 10) / 10)); }} />
            </View>
          </>
        );
      }
      case "medical":
        return (
          <>
            {title("Any Medical Condition we should be aware of?", "This info will help us guide you to your fitness goals safely and quickly. It stays on this phone.")}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
              <OptionPill label="None" on={conds.includes("None")} onPress={() => setConds(["None"])} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
              {CONDITIONS.map((c) => {
                const on = conds.includes(c);
                return <OptionPill key={c} label={c} on={on} onPress={() => setConds((x) => { const y = x.filter((z) => z !== "None"); return on ? (y.filter((z) => z !== c).length ? y.filter((z) => z !== c) : ["None"]) : [...y, c]; })} />;
              })}
            </View>
          </>
        );
      case "health":
        return (
          <View style={{ alignItems: "center" }}>
            <WalkerArt />
            <HT size={20} weight="500" center style={{ marginTop: 18 }}>Let's Auto-Track with {Platform.OS === "android" ? "Health Connect" : "Apple Health"}!</HT>
            <HT size={12} color={hm.ink2} center style={{ marginTop: 10 }}>Sync your health data around activity and sleep.{"\n"}More access = faster path to your fitness goal!</HT>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable onPress={() => (i ? setI(i - 1) : router.back())} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} style={{ width: 32, height: 40, justifyContent: "center" }}>
          <Ionicons name="chevron-back" size={24} color={hm.ink} />
        </Pressable>
        <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: "#dfe1e5", overflow: "hidden" }} accessibilityLabel={`Step ${i + 1} of ${steps.length}`}>
          <View style={{ width: `${((i + 1) / steps.length) * 100}%`, height: 4, backgroundColor: hm.teal }} />
        </View>
        <Pressable onPress={skip} accessibilityRole="button" accessibilityLabel="Skip setup" hitSlop={10} style={{ paddingHorizontal: 6 }}>
          <HT size={13} color={hm.sub}>Skip</HT>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>{body()}</ScrollView>
      <View style={{ paddingHorizontal: 18, paddingBottom: Math.max(insets.bottom, 14), paddingTop: 8 }}>
        {step === "health" ? (
          <>
            <Btn label={`Sync with ${Platform.OS === "android" ? "Health Connect" : "Apple Health"}`} tone="black" busy={busy} onPress={() => finish(true)} />
            <Pressable onPress={() => finish(false)} accessibilityRole="button" accessibilityLabel="No, I'll track everything manually" style={{ alignItems: "center", paddingVertical: 14 }}>
              <HT size={13} weight="500">No, I'll Track Everything Manually</HT>
            </Pressable>
          </>
        ) : (
          <Btn label="Next" disabled={!valid[step]} onPress={next} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function CityGlyph() {
  return (
    <Svg width={34} height={30} viewBox="0 0 34 30">
      <Rect x={4} y={12} width={26} height={16} fill="none" stroke="#5f6670" strokeWidth={1.4} />
      <Path d="M8 12 L17 3 L26 12" fill="none" stroke="#5f6670" strokeWidth={1.4} />
      <Rect x={14} y={19} width={6} height={9} fill="none" stroke="#5f6670" strokeWidth={1.2} />
      <Rect x={7} y={16} width={4} height={4} fill="none" stroke="#5f6670" strokeWidth={1} />
      <Rect x={23} y={16} width={4} height={4} fill="none" stroke="#5f6670" strokeWidth={1} />
    </Svg>
  );
}

function WalkerArt() {
  return (
    <Svg width={260} height={220} viewBox="0 0 260 220" accessibilityLabel="Steps and sleep auto-tracked">
      <Rect x={130} y={30} width={110} height={56} rx={10} fill="#fff" stroke="#eceef2" />
      <Path d="M144 52 a5 5 0 0 1 10 0 c0 6 -5 9 -5 9 s-5 -3 -5 -9z" fill="#ff3b5c" />
      <Path d="M160 56 h0" />
      <Rect x={162} y={44} width={30} height={8} rx={2} fill="#1d1d1f" />
      <Rect x={198} y={42} width={32} height={12} rx={2} fill="#1d1d1f" />
      <Rect x={162} y={62} width={20} height={6} rx={2} fill="#c7c7cc" />
      <Rect x={198} y={62} width={20} height={6} rx={2} fill="#c7c7cc" />
      <Circle cx={70} cy={40} r={12} fill="#1d1d1f" />
      <Path d="M62 56 h18 l6 50 h-30z" fill="#1e5a50" />
      <Path d="M58 106 h30 l-2 28 h-26z" fill="#1d1d1f" />
      <Path d="M62 134 l-8 60 M82 134 l10 60" stroke="#e9c8a8" strokeWidth={8} strokeLinecap="round" />
      <Path d="M86 70 q40 40 70 100" stroke="#a0522d" strokeWidth={2} fill="none" />
      <Path d="M150 170 q20 -14 44 -6 l14 -10 l6 6 l-8 10 q4 14 -4 24 h-6 l-4 -12 l-24 0 l-6 12 h-6 q-4 -10 0 -18z" fill="#a0522d" />
    </Svg>
  );
}
