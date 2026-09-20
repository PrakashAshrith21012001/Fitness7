import { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { fmtKcal, type MealSlot } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { MEALS, useFood, type DraftItem, type ParseResponse } from "@/state/food";
import { FoodItemRow } from "@/components/FoodItemRow";
import { Chips } from "@/components/Pickers";
import { Body, LimeButton } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";

/**
 * Type it. One box; the table answers as you type (debounced 600 ms), the
 * API fills what the table couldn't. Every line is editable before the one
 * green button — "Add to lunch" — lands it in the log.
 */
export default function AddFood() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ text?: string }>();
  const { member } = useSession();
  const { parseText, addItems, defaultSlot } = useFood();
  const [text, setText] = useState(params.text ?? "");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [slot, setSlot] = useState<MealSlot>(defaultSlot());
  const [slotTouched, setSlotTouched] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = !!member?.hideCalories;

  const apply = useCallback(
    (res: ParseResponse) => {
      setItems(res.items);
      setNote(res.notes);
      setHandoff(!!res.handoff);
      if (!slotTouched && res.mealSlot) setSlot(res.mealSlot);
    },
    [slotTouched],
  );

  // Debounced parse: table instantly, then the API for what's left.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = text.trim();
    if (q.length < 2) {
      setItems([]);
      setNote(null);
      setPending(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const id = ++seq.current;
      const local = await parseText(q, { allowApi: false });
      if (seq.current !== id) return;
      apply(local);
      const full = await (async () => {
        setPending(true);
        try {
          return await parseText(q);
        } finally {
          if (seq.current === id) setPending(false);
        }
      })();
      if (seq.current !== id) return;
      apply(full);
    }, 600);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const total = items.reduce((a, b) => a + b.kcal, 0);
  const protein = items.reduce((a, b) => a + b.proteinG, 0);
  const label = MEALS.find((m) => m.id === slot)?.label.toLowerCase() ?? slot;

  const save = async () => {
    if (!items.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addItems(items, slot);
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title="Type it" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 4 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="2 idli, sambar, one filter coffee"
            placeholderTextColor={colors.muted}
            autoFocus={!params.text}
            multiline
            accessibilityLabel="What did you eat?"
            style={{ minHeight: 64, color: colors.white, ...type.title, paddingVertical: 12, textAlignVertical: "top" }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, minHeight: 20 }}>
          <Body size="micro">TAMIL NAMES AND SPELLINGS WORK · "RENDU IDLI", "ORU CUP"</Body>
          {pending ? <Body size="micro" style={{ color: colors.lime }}>READING…</Body> : null}
        </View>

        <View style={{ marginTop: 18 }}>
          <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>MEAL</Body>
          <Chips
            value={slot}
            options={MEALS}
            onChange={(s) => {
              setSlot(s);
              setSlotTouched(true);
            }}
          />
        </View>

        {note ? (
          <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 16, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12 }}>
            <Ionicons name={handoff ? "people-outline" : "information-circle-outline"} size={18} color={colors.lime} />
            <Body size="small" muted={false} style={{ flex: 1 }}>{note}</Body>
          </View>
        ) : null}

        {items.length ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            {items.map((it, i) => (
              <FoodItemRow
                key={`${it.foodId ?? it.name}-${i}`}
                item={it}
                hideCalories={hide}
                onChange={(next) => setItems((list) => list.map((x, j) => (j === i ? next : x)))}
                onRemove={() => setItems((list) => list.filter((_, j) => j !== i))}
              />
            ))}
          </View>
        ) : text.trim().length >= 2 && !pending ? (
          <Body size="small" style={{ marginTop: 18 }}>Nothing recognised yet — try the dish name, e.g. "sambar rice".</Body>
        ) : null}
      </ScrollView>

      {items.length ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingTop: 12, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
          {!hide ? (
            <Body size="small" style={{ textAlign: "center", marginBottom: 10 }}>
              {items.length} item{items.length === 1 ? "" : "s"} · {fmtKcal(total)} kcal · {Math.round(protein)} g protein
            </Body>
          ) : null}
          <LimeButton label={`Add to ${label}`} icon="checkmark" onPress={save} />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
