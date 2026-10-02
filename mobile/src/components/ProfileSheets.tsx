import { useEffect, useState, type ReactNode } from "react";
import { Platform, Pressable, Switch, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { squadCopy } from "@f7/content";
import { useBookings } from "@/state/bookings";
import { Sheet } from "@/components/Sheet";

/**
 * The small sheets the weekly-activity pane opens, copied from cult.fit:
 *   WeeksActiveSheet  tap "Weeks Active" → Current / Longest
 *   GoalSheet         the pencil on the 0/3 arc → weekly goal
 *   DevicesSheet      Track Your Health → CONNECT → health apps or manual sleep
 * plus TrackHealthCard, the card with the three app icons and CONNECT.
 */

const W = "#ffffff";
const MUTED = "rgba(255,255,255,0.65)";
const healthApp = Platform.OS === "ios" ? "Apple Health" : "Health Connect";

export function HealthIcons({ size = 16 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: size + 4, height: size + 4, borderRadius: 5, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="heart" size={size - 4} color="#ff2d55" />
      </View>
      <MaterialCommunityIcons name="dots-grid" size={size + 2} color="#4cc2c4" />
      <MaterialCommunityIcons name="google-fit" size={size + 2} color="#4285f4" />
    </View>
  );
}

export function TrackHealthCard({ onConnect, bg = "rgba(255,255,255,0.08)", inset }: { onConnect: () => void; bg?: string; inset?: boolean }) {
  const { health } = useBookings();
  const linked = health.apple || health.fitbit;
  return (
    <View style={{ backgroundColor: bg, borderRadius: inset ? 0 : 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: W, fontSize: 15, fontWeight: "800" }}>Track Your Health</Text>
          <HealthIcons />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
          <Text style={{ flex: 1, color: MUTED, fontSize: 10, lineHeight: 13 }}>
            {linked ? `Syncing from ${[health.apple ? healthApp : null, health.fitbit ? "Fitbit" : null].filter(Boolean).join(" & ")}` : "Sync your health and fitness data to track your progress and get better insights"}
          </Text>
          <Pressable onPress={onConnect} accessibilityRole="button" accessibilityLabel={linked ? "Manage fitness devices" : "Connect a fitness device"} style={{ minHeight: 36, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: W, fontSize: 12, fontWeight: "800", letterSpacing: 1 }}>{linked ? "MANAGE" : "CONNECT"}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function WeeksActiveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { weeksActive, longestWeeks } = useBookings();
  return (
    <Sheet open={open} onClose={onClose} bg="#000">
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ color: W, fontSize: 20, fontWeight: "800" }}>Weeks Active</Text>
        <Text style={{ color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 8 }}>{squadCopy.weeksActiveInfo}</Text>
        {[
          ["Current", weeksActive],
          ["Longest", Math.max(longestWeeks, weeksActive)],
        ].map(([k, v], i) => (
          <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 14, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.12)", marginTop: i === 0 ? 14 : 0 }}>
            <Ionicons name="flash" size={18} color="#ffc93c" />
            <Text style={{ flex: 1, color: W, fontSize: 15 }}>{k}</Text>
            <Text style={{ color: W, fontSize: 15, fontWeight: "700" }}>{v}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

export function GoalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { thisWeek, setTarget } = useBookings();
  const [n, setN] = useState(thisWeek.target);
  useEffect(() => {
    if (open) setN(thisWeek.target);
  }, [open, thisWeek.target]);
  const step = (d: number) => setN((x) => Math.max(1, Math.min(7, x + d)));
  return (
    <Sheet open={open} onClose={onClose} bg="#141a33">
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ color: W, fontSize: 20, fontWeight: "800" }}>Weekly goal</Text>
        <Text style={{ color: MUTED, fontSize: 13, lineHeight: 19, marginTop: 8 }}>How many workouts do you want to do every week? Your streak counts any week with at least one.</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, marginTop: 24 }}>
          <Pressable onPress={() => step(-1)} accessibilityRole="button" accessibilityLabel="Fewer" style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="remove" size={22} color={W} />
          </Pressable>
          <Text style={{ color: W, fontSize: 34, fontWeight: "900", minWidth: 40, textAlign: "center" }}>{n}</Text>
          <Pressable onPress={() => step(1)} accessibilityRole="button" accessibilityLabel="More" style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="add" size={22} color={W} />
          </Pressable>
        </View>
        <Text style={{ color: MUTED, textAlign: "center", marginTop: 8, fontSize: 12, letterSpacing: 1 }}>WORKOUTS A WEEK</Text>
        <Pressable
          onPress={async () => {
            await setTarget(n);
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Save weekly goal"
          style={{ marginTop: 22, minHeight: 48, borderRadius: 8, backgroundColor: "#ff3e6c", alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: W, fontWeight: "800", letterSpacing: 1 }}>SAVE</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

export function DevicesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { health, setHealth, logSleep } = useBookings();
  const [manual, setManual] = useState(false);
  const [hours, setHours] = useState(7);
  const last = health.sleep[0];
  const row = (label: string, icon: ReactNode, on: boolean, toggle: (v: boolean) => void) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 16, minHeight: 60, marginTop: 14 }}>
      {icon}
      <Text style={{ flex: 1, color: W, fontSize: 14, fontWeight: "600" }}>{label}</Text>
      <Switch value={on} onValueChange={toggle} accessibilityLabel={label} trackColor={{ false: "rgba(255,255,255,0.2)", true: "#3ddc84" }} thumbColor="#fff" />
    </View>
  );
  return (
    <Sheet open={open} onClose={onClose} bg="#1d3a40">
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <Text style={{ color: W, fontSize: 20, fontWeight: "800" }}>{squadCopy.devicesTitle}</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <Ionicons name="information-circle-outline" size={18} color={W} />
          <Text style={{ flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 19 }}>{squadCopy.devicesInfo}</Text>
        </View>
        {row(
          healthApp,
          <View style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="heart" size={16} color="#ff2d55" />
          </View>,
          health.apple,
          (v) => setHealth({ apple: v }),
        )}
        {row("Fitbit", <MaterialCommunityIcons name="dots-grid" size={24} color="#4cc2c4" />, health.fitbit, (v) => setHealth({ fitbit: v }))}
        <Text style={{ color: MUTED, textAlign: "center", fontSize: 12, marginTop: 16 }}>or else</Text>
        {manual ? (
          <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, marginTop: 12 }}>
            <Text style={{ color: W, fontSize: 14, fontWeight: "700" }}>Last night's sleep</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, marginTop: 12 }}>
              <Pressable onPress={() => setHours((h) => Math.max(3, h - 0.5))} accessibilityRole="button" accessibilityLabel="Less sleep" style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="remove" size={20} color={W} />
              </Pressable>
              <Text style={{ color: W, fontSize: 26, fontWeight: "900", minWidth: 90, textAlign: "center" }}>{hours} h</Text>
              <Pressable onPress={() => setHours((h) => Math.min(12, h + 0.5))} accessibilityRole="button" accessibilityLabel="More sleep" style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="add" size={20} color={W} />
              </Pressable>
            </View>
            <Pressable
              onPress={async () => {
                await logSleep(hours);
                setManual(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Save sleep"
              style={{ marginTop: 14, minHeight: 44, borderRadius: 8, backgroundColor: "#3ddc84", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: "#0f1428", fontWeight: "800", letterSpacing: 1 }}>SAVE</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setManual(true)} accessibilityRole="button" accessibilityLabel="Enter sleep info manually" style={{ marginTop: 12, minHeight: 48, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: W, fontSize: 14 }}>Enter sleep info manually</Text>
          </Pressable>
        )}
        {last ? <Text style={{ color: MUTED, textAlign: "center", fontSize: 11, marginTop: 10 }}>Last logged: {last.hours} h on {last.date}</Text> : null}
      </View>
    </Sheet>
  );
}
