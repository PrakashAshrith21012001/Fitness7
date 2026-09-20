import { useEffect, useState } from "react";
import { Image, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { fmtKcal, type MealSlot } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { MEALS, useFood, type DraftItem } from "@/state/food";
import { FoodItemRow } from "@/components/FoodItemRow";
import { Chips } from "@/components/Pickers";
import { Body, LimeButton } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";

const FIXTURE_ITEMS: DraftItem[] = [
  { name: "White rice (cooked)", foodId: "rice", grams: 220, portionLabel: "220 g", kcal: 286, proteinG: 5.9, carbsG: 61.6, fatG: 0.7, confidence: 0.82, source: "photo", needsConfirm: false, estimate: false },
  { name: "Sambar", foodId: "sambar", grams: 140, portionLabel: "140 ml", kcal: 91, proteinG: 4.2, carbsG: 13.3, fatG: 2.2, confidence: 0.78, source: "photo", needsConfirm: false, estimate: true },
  { name: "Curd", foodId: "curd", grams: 120, portionLabel: "120 g", kcal: 72, proteinG: 3.7, carbsG: 3.6, fatG: 4.8, confidence: 0.8, source: "photo", needsConfirm: false, estimate: false },
  { name: "Papad / appalam (fried)", foodId: "papad", grams: 24, portionLabel: "2 × papad", kcal: 101, proteinG: 3.8, carbsG: 10.8, fatG: 4.6, confidence: 0.7, source: "photo", needsConfirm: true, estimate: true },
];

/**
 * Snap it. Camera or gallery → resized on the phone (≤1024 px JPEG) →
 * "Analyse" → the same editable list as Type it, each line with a confidence
 * pill. Nothing is saved until "Looks right — add". The photo itself is never
 * stored anywhere.
 */
export default function SnapFood() {
  const colors = useColors();
  const router = useRouter();
  const { member } = useSession();
  const { analysePhoto, addItems, defaultSlot } = useFood();
  const [uri, setUri] = useState<string | null>(null);
  const [b64, setB64] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<DraftItem[] | null>(null);
  const [plate, setPlate] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [slot, setSlot] = useState<MealSlot>(defaultSlot());
  const hide = !!member?.hideCalories;
  const params = useLocalSearchParams<{ fixture?: string }>();

  // Dev only: ?fixture=1 shows the bundled sample plate with a canned result, for screenshots without an API key.
  useEffect(() => {
    if (!__DEV__ && process.env.EXPO_PUBLIC_ALLOW_FIXTURES !== "1") return;
    if (params.fixture !== "1") return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = require("@/assets/fixtures/plate.jpg") as number | { uri: string };
    setUri(typeof asset === "number" ? Image.resolveAssetSource(asset).uri : asset.uri);
    setPlate("Steel plate: a mound of white rice, a katori of sambar, a katori of curd, two papads, a tumbler beside.");
    setItems(FIXTURE_ITEMS);
  }, [params.fixture]);

  const pick = async (from: "camera" | "library") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setNote(null);
    setItems(null);
    setPlate(null);
    try {
      if (from === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setNote("Camera permission is off — allow it in your phone's settings, or pick from the gallery.");
          return;
        }
      }
      const res =
        from === "camera"
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.9, exif: false })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.9, exif: false, allowsMultipleSelection: false });
      if (res.canceled || !res.assets?.length) return;
      const asset = res.assets[0];
      // Longest side 1024 px, JPEG 0.8 → typically 150–400 KB, well under the route's 600 KB cap
      const landscape = (asset.width ?? 1) >= (asset.height ?? 1);
      const out = await manipulateAsync(asset.uri, [{ resize: landscape ? { width: 1024 } : { height: 1024 } }], { compress: 0.8, format: SaveFormat.JPEG, base64: true });
      setUri(out.uri);
      setB64(out.base64 ?? null);
    } catch {
      setNote("Couldn't open that photo. Try another one.");
    }
  };

  const analyse = async () => {
    if (!b64 || busy) return;
    setBusy(true);
    setNote(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    try {
      const res = await analysePhoto(b64, hint.trim() || undefined);
      setItems(res.items);
      setPlate(res.plateDescription ?? null);
      setNote(res.notes);
      if (res.mealSlot) setSlot(res.mealSlot);
      if (!res.items.length && !res.notes) setNote("Couldn't make out a meal — try a clearer photo from above, or type it.");
    } catch (e) {
      setNote((e as Error).message || "Couldn't analyse that photo. Try again, or type the meal.");
    } finally {
      setBusy(false);
    }
  };

  const total = (items ?? []).reduce((a, b) => a + b.kcal, 0);
  const label = MEALS.find((m) => m.id === slot)?.label.toLowerCase() ?? slot;

  const save = async () => {
    if (!items?.length) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await addItems(items, slot);
    router.back();
  };

  const source = (label: string, icon: keyof typeof Ionicons.glyphMap, go: () => void) => (
    <Pressable
      onPress={go}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { flex: 1, minHeight: 96, alignItems: "center", justifyContent: "center", gap: 8, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
        pressed && { borderColor: colors.green },
      ]}
    >
      <Ionicons name={icon} size={26} color={colors.lime} />
      <Body size="small" muted={false} style={{ fontWeight: "600" }}>{label}</Body>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader title="Snap it" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 160 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {!uri ? (
        <>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {Platform.OS !== "web" ? source("Camera", "camera-outline", () => pick("camera")) : null}
            {source("Gallery", "images-outline", () => pick("library"))}
          </View>
          <Body size="small" style={{ marginTop: 14 }}>
            Shoot from above with the whole plate in frame. A spoon or a tumbler next to it helps with portion size. The photo is analysed and then discarded — it's never stored.
          </Body>
        </>
      ) : (
        <>
          <View style={{ borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}>
            <Image source={{ uri }} style={{ width: "100%", aspectRatio: 4 / 3 }} resizeMode="cover" accessibilityLabel="Your photo" />
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Pressable onPress={() => pick("library")} accessibilityRole="button" accessibilityLabel="Choose another photo" style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 4 }}>
              <Body size="small" style={{ color: colors.lime, fontWeight: "600" }}>Change photo</Body>
            </Pressable>
          </View>
          {!items ? (
            <>
              <View style={{ marginTop: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14 }}>
                <TextInput
                  value={hint}
                  onChangeText={(v) => setHint(v.slice(0, 120))}
                  placeholder="Optional hint — e.g. lunch at home, hotel meals"
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="Hint about the meal"
                  style={{ minHeight: 48, color: colors.white, ...type.body }}
                />
              </View>
              <LimeButton label={busy ? "Looking at the plate…" : "Analyse"} icon="sparkles" onPress={analyse} style={{ marginTop: 14, opacity: busy ? 0.7 : 1 }} />
            </>
          ) : null}
        </>
      )}

      {plate ? (
        <View style={{ marginTop: 16, borderRadius: radius.md, borderWidth: 1, borderColor: "rgba(46,204,113,0.45)", backgroundColor: colors.limeSoft, padding: 12 }}>
          <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 4 }}>WHAT IT SAW</Body>
          <Body size="small" muted={false}>{plate}</Body>
        </View>
      ) : null}

      {note ? (
        <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", marginTop: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 12 }}>
          <Ionicons name="information-circle-outline" size={18} color={colors.lime} />
          <Body size="small" muted={false} style={{ flex: 1 }}>{note}</Body>
        </View>
      ) : null}

      {items?.length ? (
        <>
          <View style={{ marginTop: 18 }}>
            <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>MEAL</Body>
            <Chips value={slot} options={MEALS} onChange={setSlot} />
          </View>
          <Body size="small" style={{ marginTop: 16 }}>Portions from a photo are estimates. Check the ones marked, adjust with the buttons, then add.</Body>
          <View style={{ marginTop: 10, gap: 10 }}>
            {items.map((it, i) => (
              <FoodItemRow
                key={`${it.foodId ?? it.name}-${i}`}
                item={it}
                hideCalories={hide}
                onChange={(next) => setItems((list) => (list ?? []).map((x, j) => (j === i ? next : x)))}
                onRemove={() => setItems((list) => (list ?? []).filter((_, j) => j !== i))}
              />
            ))}
          </View>
        </>
      ) : null}
      </ScrollView>

      {items?.length ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingTop: 12, backgroundColor: colors.black, borderTopWidth: 1, borderTopColor: colors.line }}>
          {!hide ? (
            <Body size="small" style={{ textAlign: "center", marginBottom: 10 }}>
              {items.length} item{items.length === 1 ? "" : "s"} · {fmtKcal(total)} kcal
            </Body>
          ) : null}
          <LimeButton label={`Looks right — add to ${label}`} icon="checkmark" onPress={save} />
        </View>
      ) : null}
    </View>
  );
}
