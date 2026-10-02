import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { useTracker } from "@/state/tracker";
import { useBookings } from "@/state/bookings";
import { Btn, HMSheet, HT, hm } from "@/components/hm";
import { fmt } from "@/lib/tracker-day";

/**
 * Steps: until Health Connect / Apple Health sync is wired up (it's a flag
 * in Fitness Devices today), the member types today's count from their
 * phone's step counter. Goal is editable.
 */
export function StepsSheet({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const { state, setSteps, patch } = useTracker();
  const { health } = useBookings();
  const [v, setV] = useState("");
  const [goal, setGoal] = useState(String(state.stepsGoal));
  useEffect(() => {
    if (open) {
      setV(state.steps[date] ? String(state.steps[date]) : "");
      setGoal(String(state.stepsGoal));
    }
  }, [open, date, state.steps, state.stepsGoal]);
  const n = Number(v.replace(/[^0-9]/g, ""));
  const g = Number(goal.replace(/[^0-9]/g, ""));
  const valid = v === "" || (n >= 0 && n <= 100000);
  const goalValid = g >= 1000 && g <= 50000;
  return (
    <HMSheet open={open} onClose={onClose} title="Steps">
      <HT size={13} color={hm.sub}>
        {health.apple || health.fitbit ? "Your health app is connected — automatic step sync is coming. For now, enter today's count from your phone's step counter." : "Enter today's count from your phone's step counter, or connect a health app in Fitness Devices."}
      </HT>
      <HT size={12} weight="500" color={hm.sub} style={{ marginTop: 16 }}>Steps on this day</HT>
      <TextInput value={v} onChangeText={setV} keyboardType="number-pad" placeholder="e.g. 6500" placeholderTextColor={hm.faint} accessibilityLabel="Steps" maxLength={6} style={{ borderWidth: 1, borderColor: valid ? "#d6d8dd" : hm.red, borderRadius: 8, paddingHorizontal: 12, height: 46, fontSize: 16, color: hm.ink, marginTop: 6 }} />
      {!valid ? <HT size={11} color={hm.red} style={{ marginTop: 4 }}>Steps must be between 0 and 1,00,000.</HT> : null}
      <HT size={12} weight="500" color={hm.sub} style={{ marginTop: 14 }}>Daily goal</HT>
      <TextInput value={goal} onChangeText={setGoal} keyboardType="number-pad" accessibilityLabel="Daily step goal" maxLength={5} style={{ borderWidth: 1, borderColor: goalValid ? "#d6d8dd" : hm.red, borderRadius: 8, paddingHorizontal: 12, height: 46, fontSize: 16, color: hm.ink, marginTop: 6 }} />
      {!goalValid ? <HT size={11} color={hm.red} style={{ marginTop: 4 }}>Pick a goal between 1,000 and 50,000.</HT> : null}
      <View style={{ height: 16 }} />
      <Btn
        label={v ? `Save ${fmt(n)} steps` : "Save"}
        disabled={!valid || !goalValid}
        onPress={async () => {
          if (v !== "") await setSteps(n, date);
          if (g !== state.stepsGoal) await patch({ stepsGoal: g });
          onClose();
        }}
      />
    </HMSheet>
  );
}
