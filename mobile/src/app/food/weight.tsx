import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Switch, TextInput, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { WEIGHT_RANGE, goalLabel, idealRange, kgToLb, lbToKg, weeksToGoal } from "@f7/content";
import { useSession, today } from "@/state/session";
import { useTracker } from "@/state/tracker";
import { Btn, Card, Divider, HMHeader, HMSheet, HT, Toggle, WeightChart, hm, hmShadow, tap } from "@/components/hm";
import { axisDate, shortDate } from "@/lib/tracker-day";
import { pickThumb } from "@/lib/thumb";

/**
 * Weight Tracker — goal card ("Lose 7.5 kg · 15 weeks remaining"), the
 * purple chart with your ideal-weight band and goal line, the progress
 * gallery, and the timeline of every weigh-in with a photo slot.
 */
export default function WeightTracker() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ add?: string }>();
  const { member, logWeight, update } = useSession();
  const { state, patch, setGoal, setWeightPhoto } = useTracker();
  const [sheet, setSheet] = useState<null | "track" | "manual" | "goal" | "menu" | "scale" | "gallery">(params.add === "1" ? "manual" : null);
  const [value, setValue] = useState("");
  const [goalV, setGoalV] = useState("");
  const [error, setError] = useState<string | null>(null);
  const unit = state.unit;
  const u = unit === "lb" ? "lbs" : "kg";
  const show = (kg: number) => (unit === "lb" ? kgToLb(kg) : Math.round(kg * 10) / 10);

  useEffect(() => {
    if (sheet === "manual") setValue("");
    if (sheet === "goal") setGoalV(state.targetKg ? String(show(state.targetKg)) : "");
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet]);

  if (!member) return null;
  const weights = member.weights;
  const latest = weights.length ? weights[weights.length - 1].kg : null;
  const target = state.targetKg;
  const band = member.heightCm ? idealRange(member.heightCm) : undefined;
  const weeks = latest !== null && target !== undefined ? weeksToGoal(latest, target) : null;
  const points = weights.slice(-12).map((w) => ({ x: axisDate(w.date), y: show(w.kg) }));

  const parse = (s: string) => {
    const n = Number(s.replace(",", "."));
    if (!isFinite(n) || n <= 0) return null;
    return unit === "lb" ? lbToKg(n) : n;
  };
  const inRange = (kg: number | null) => kg !== null && kg >= WEIGHT_RANGE.min && kg <= WEIGHT_RANGE.max;
  const rangeMsg = `Weight must be within ${unit === "lb" ? `${Math.round(kgToLb(WEIGHT_RANGE.min))}-${Math.round(kgToLb(WEIGHT_RANGE.max))} lbs` : `${WEIGHT_RANGE.min}-${WEIGHT_RANGE.max} Kg`} range.`;

  const addPhoto = async (date: string) => {
    const r = await pickThumb("library");
    if (!r) return;
    if ("error" in r) setError(r.error);
    else await setWeightPhoto(date, r.thumb);
  };

  const photos = Object.entries(state.weightPhotos).sort(([a], [b]) => b.localeCompare(a));

  return (
    <View style={{ flex: 1, backgroundColor: hm.bg }}>
      <View style={{ backgroundColor: hm.card }}>
        <HMHeader
          title="Weight Tracker"
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => setSheet("menu")} accessibilityRole="button" accessibilityLabel="Weight options" hitSlop={8} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="ellipsis-vertical" size={20} color={hm.ink} />
            </Pressable>
          }
        />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <Pressable onPress={() => setSheet("goal")} accessibilityRole="button" accessibilityLabel={target !== undefined && latest !== null ? `${goalLabel(latest, target, unit)}, ${weeks} weeks remaining. Edit goal` : "Set a weight goal"} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: hm.card, padding: 16, marginBottom: 10 }}>
          <View style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 4, borderColor: "#eceef2", alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: hm.purple, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="scale" size={16} color="#fff" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <HT size={16} weight="500">{target !== undefined && latest !== null ? goalLabel(latest, target, unit) : "Set your weight goal"}</HT>
            <HT size={12} color={hm.sub}>{weeks !== null ? (weeks ? `${weeks} weeks remaining` : "You're at your goal 🎉") : latest === null ? "Log your weight first" : "Tap to choose a target"}</HT>
          </View>
          <Ionicons name="pencil" size={18} color={hm.ink} />
        </Pressable>

        <View style={{ backgroundColor: hm.card, paddingVertical: 14 }}>
          <View style={{ alignSelf: "flex-start", marginLeft: 16, backgroundColor: hm.purple, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 }}>
            <HT size={12} weight="500" color="#fff">Weight</HT>
          </View>
          {points.length ? (
            <View style={{ marginTop: 14, alignItems: "center" }}>
              <WeightChart width={width - 16} points={points} goal={target !== undefined ? show(target) : undefined} band={band ? { min: show(band.min), max: show(band.max) } : undefined} unit={u} />
            </View>
          ) : (
            <View style={{ height: 160, alignItems: "center", justifyContent: "center" }}>
              <HT size={13} color={hm.sub}>Your weigh-ins will show here.</HT>
            </View>
          )}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 12, height: 12, borderWidth: 1, borderColor: "#c7c7cc", backgroundColor: "#eaf4f1" }} />
              <HT size={11} color={hm.sub}>Ideal Weight{band ? ` (${show(band.min)}–${show(band.max)} ${u})` : ""}</HT>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <HT size={11} color={hm.sub}>- - -</HT>
              <HT size={11} color={hm.sub}>Your Goal</HT>
            </View>
          </View>
        </View>

        <Card style={{ marginHorizontal: 0, borderRadius: 0, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <HT size={15} weight="500" color={hm.purple}>Build Your Progress Gallery</HT>
            <HT size={12} color={hm.sub} style={{ marginTop: 4 }}>Every photo helps you see changes the scale can't.</HT>
            <Pressable onPress={() => { tap(); void addPhoto(today()); }} accessibilityRole="button" accessibilityLabel="Add a progress photo" style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: hm.purple, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, marginTop: 10 }}>
              <HT size={12} weight="500" color="#fff">Add Photo</HT>
              <Ionicons name="chevron-forward" size={12} color="#fff" />
            </Pressable>
          </View>
          {photos[0] ? <Image source={{ uri: photos[0][1] }} style={{ width: 64, height: 76, borderRadius: 6, transform: [{ rotate: "6deg" }] }} accessibilityLabel="Latest progress photo" /> : <Ionicons name="images-outline" size={44} color="#d6c7e6" />}
        </Card>
        {error ? <HT size={12} color={hm.red} style={{ padding: 12 }}>{error}</HT> : null}

        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
          <HT size={16} weight="500" style={{ flex: 1 }}>Timeline</HT>
          <Pressable onPress={() => setSheet("gallery")} accessibilityRole="button" accessibilityLabel="View progress gallery" hitSlop={8} style={{ flexDirection: "row", alignItems: "center" }}>
            <HT size={12} weight="500" color={hm.purple}>View Progress Gallery</HT>
            <Ionicons name="chevron-forward" size={14} color={hm.purple} />
          </Pressable>
        </View>
        {weights.length ? (
          [...weights].reverse().map((w, i, arr) => {
            const prev = arr[i + 1];
            const down = prev ? w.kg < prev.kg : false;
            const up = prev ? w.kg > prev.kg : false;
            const photo = state.weightPhotos[w.date];
            return (
              <View key={w.date} style={{ flexDirection: "row", paddingLeft: 14, paddingRight: 12 }}>
                <View style={{ width: 16, alignItems: "center" }}>
                  <View style={{ width: 2, flex: 1, backgroundColor: i ? "#e4dcef" : "transparent" }} />
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: hm.purple }} />
                  <View style={{ width: 2, flex: 1, backgroundColor: i < arr.length - 1 ? "#e4dcef" : "transparent" }} />
                </View>
                <Card style={{ flex: 1, flexDirection: "row", alignItems: "center", marginVertical: 6, marginLeft: 8 }} padding={14}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <HT size={20} weight="500" color={hm.purple}>{show(w.kg)} {u}</HT>
                      {down ? <Ionicons name="caret-down" size={12} color={hm.green} /> : up ? <Ionicons name="caret-up" size={12} color={hm.red} /> : null}
                    </View>
                    <HT size={11} color={hm.sub}>{shortDate(w.date)} • Manual</HT>
                  </View>
                  <Pressable onPress={() => { tap(); void addPhoto(w.date); }} accessibilityRole="button" accessibilityLabel={photo ? `Change photo for ${shortDate(w.date)}` : `Add a photo for ${shortDate(w.date)}`} style={[{ width: 44, height: 44, borderRadius: 8, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", overflow: "hidden" }, hmShadow]}>
                    {photo ? <Image source={{ uri: photo }} style={{ width: 44, height: 44 }} /> : <Ionicons name="camera" size={18} color={hm.purple} />}
                  </Pressable>
                </Card>
              </View>
            );
          })
        ) : (
          <HT size={13} color={hm.sub} style={{ paddingHorizontal: 16 }}>No weigh-ins yet. Tap + to log today's weight.</HT>
        )}

        <View style={{ backgroundColor: hm.card, marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 54 }}>
            <Ionicons name="notifications" size={18} color={hm.ink} />
            <HT size={14} style={{ flex: 1 }}>Weight Reminder <HT size={11} color={hm.sub}>· Mondays, 7 am</HT></HT>
            <Switch value={state.weightReminder} onValueChange={(v) => patch({ weightReminder: v })} accessibilityLabel="Weekly weight reminder" trackColor={{ true: hm.purple, false: "#d1d1d6" }} thumbColor="#fff" />
          </View>
          <Divider style={{ marginLeft: 46 }} />
          <Pressable onPress={() => router.push("/chat")} accessibilityRole="button" accessibilityLabel="Send feedback" style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, minHeight: 54 }}>
            <Ionicons name="star" size={18} color={hm.ink} />
            <HT size={14} style={{ flex: 1 }}>Send Feedback</HT>
            <Ionicons name="chevron-forward" size={18} color={hm.ink} />
          </Pressable>
        </View>
      </ScrollView>

      <Pressable onPress={() => { tap(); setSheet("track"); }} accessibilityRole="button" accessibilityLabel="Track weight" style={[{ position: "absolute", right: 18, bottom: 30, width: 56, height: 56, borderRadius: 28, backgroundColor: hm.purple, alignItems: "center", justifyContent: "center" }, hmShadow, { shadowOpacity: 0.25 }]}>
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>

      <HMSheet open={sheet === "track"} onClose={() => setSheet(null)} title="Track Weight">
        {([["scan-outline", "Track with Smart Scale", "scale"], ["create-outline", "Track manually", "manual"]] as const).map(([icon, l, next]) => (
          <Pressable key={l} onPress={() => { tap(); setSheet(next); }} accessibilityRole="button" accessibilityLabel={l} style={{ flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: hm.line, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: hm.tealSoft, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={icon} size={18} color={hm.teal} />
            </View>
            <HT size={14} weight="500">{l}</HT>
          </Pressable>
        ))}
      </HMSheet>

      <HMSheet open={sheet === "scale"} onClose={() => setSheet(null)} title="Smart Scale">
        <HT size={13} color={hm.ink2}>Bluetooth smart-scale sync is coming. Weigh yourself at the gym's InBody / scale near the front desk and enter the number here — the coaches can read your body-fat and muscle numbers with you.</HT>
        <Btn label="Track manually" onPress={() => setSheet("manual")} style={{ marginTop: 16 }} />
      </HMSheet>

      <HMSheet open={sheet === "manual"} onClose={() => setSheet(null)} title="Today's weight">
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: value && !inRange(parse(value)) ? hm.red : "#cfd2d8", borderRadius: 8, paddingHorizontal: 12, height: 50 }}>
          <TextInput value={value} onChangeText={(t) => setValue(t.replace(/[^0-9.,]/g, ""))} autoFocus keyboardType="decimal-pad" placeholder={latest ? String(show(latest)) : unit === "lb" ? "160" : "72.5"} placeholderTextColor={hm.faint} accessibilityLabel={`Weight in ${u}`} style={{ flex: 1, fontSize: 18, color: hm.ink, height: 48 }} maxLength={6} />
          <HT size={14} color={hm.sub}>{unit === "lb" ? "Lb" : "Kg"}</HT>
        </View>
        {value && !inRange(parse(value)) ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
            <Ionicons name="alert-circle-outline" size={13} color={hm.red} />
            <HT size={11} color={hm.red}>{rangeMsg}</HT>
          </View>
        ) : null}
        <View style={{ marginTop: 14 }}>
          <Toggle items={[{ id: "kg", label: "Kg" }, { id: "lb", label: "Lb" }]} value={unit} onChange={(v) => patch({ unit: v })} />
        </View>
        <Btn label="Save" disabled={!inRange(parse(value))} style={{ marginTop: 18 }} onPress={async () => { const kg = parse(value)!; await logWeight(Math.round(kg * 10) / 10); setSheet(null); }} />
      </HMSheet>

      <HMSheet open={sheet === "goal"} onClose={() => setSheet(null)} title="Your target weight">
        {band ? (
          <View style={{ backgroundColor: hm.tealSoft, borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <HT size={12} color={hm.teal} center>Your ideal weight range is {show(band.min)}–{show(band.max)} {u}</HT>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: goalV && !inRange(parse(goalV)) ? hm.red : "#cfd2d8", borderRadius: 8, paddingHorizontal: 12, height: 50 }}>
          <TextInput value={goalV} onChangeText={(t) => setGoalV(t.replace(/[^0-9.,]/g, ""))} autoFocus keyboardType="decimal-pad" placeholder={band ? String(show(band.max)) : ""} placeholderTextColor={hm.faint} accessibilityLabel={`Target weight in ${u}`} style={{ flex: 1, fontSize: 18, color: hm.ink, height: 48 }} maxLength={6} />
          <HT size={14} color={hm.sub}>{unit === "lb" ? "Lb" : "Kg"}</HT>
        </View>
        {goalV && !inRange(parse(goalV)) ? <HT size={11} color={hm.red} style={{ marginTop: 6 }}>{rangeMsg}</HT> : null}
        {latest === null ? <HT size={11} color={hm.sub} style={{ marginTop: 6 }}>Log today's weight too, so we can count the weeks.</HT> : null}
        <Btn label="Save goal" disabled={!inRange(parse(goalV))} style={{ marginTop: 18 }} onPress={async () => { await setGoal(parse(goalV)!, latest ?? parse(goalV)!); setSheet(null); }} />
      </HMSheet>

      <HMSheet open={sheet === "menu"} onClose={() => setSheet(null)} title="Weight">
        <View style={{ flexDirection: "row", alignItems: "center", minHeight: 50 }}>
          <HT size={15} style={{ flex: 1 }}>Units</HT>
          <Toggle items={[{ id: "kg", label: "Kg" }, { id: "lb", label: "Lb" }]} value={unit} onChange={(v) => patch({ unit: v })} />
        </View>
        <Pressable onPress={() => setSheet("goal")} accessibilityRole="button" accessibilityLabel="Edit goal" style={{ minHeight: 50, justifyContent: "center" }}>
          <HT size={15}>Edit goal</HT>
        </Pressable>
        {member.heightCm ? null : (
          <Pressable onPress={() => { setSheet(null); router.push("/food/setup"); }} accessibilityRole="button" accessibilityLabel="Add your height" style={{ minHeight: 50, justifyContent: "center" }}>
            <HT size={15}>Add your height for an ideal range</HT>
          </Pressable>
        )}
        {weights.some((w) => w.date === today()) ? (
          <Pressable onPress={async () => { await update({ weights: weights.filter((w) => w.date !== today()) }); setSheet(null); }} accessibilityRole="button" accessibilityLabel="Remove today's weight" style={{ minHeight: 50, justifyContent: "center" }}>
            <HT size={15} color={hm.red}>Remove today's weigh-in</HT>
          </Pressable>
        ) : null}
      </HMSheet>

      <HMSheet open={sheet === "gallery"} onClose={() => setSheet(null)} title="Progress Gallery" scroll>
        {photos.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {photos.map(([d, uri]) => {
              const w = weights.find((x) => x.date === d);
              return (
                <View key={d} style={{ width: (width - 56) / 3 }}>
                  <Image source={{ uri }} style={{ width: "100%", aspectRatio: 0.8, borderRadius: 8, backgroundColor: hm.chip }} accessibilityLabel={`Photo from ${shortDate(d)}`} />
                  <HT size={11} weight="500" style={{ marginTop: 4 }}>{shortDate(d)}</HT>
                  {w ? <HT size={11} color={hm.purple}>{show(w.kg)} {u}</HT> : null}
                </View>
              );
            })}
          </View>
        ) : (
          <HT size={13} color={hm.sub}>No photos yet. Add one from the Timeline — it stays on this phone.</HT>
        )}
      </HMSheet>
    </View>
  );
}
