import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { today } from "@/state/session";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Monday → Sunday of the current week, ticked where the member checked in. */
export function WeekStrip({ checkins }: { checkins: string[] }) {
  const colors = useColors();
  const now = new Date(today() + "T12:00:00");
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const set = new Set(checkins);
  const t = today();

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {DAYS.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const done = set.has(iso);
        const isToday = iso === t;
        const future = iso > t;
        return (
          <View key={i} style={{ alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: done ? colors.green : "transparent",
                borderWidth: done ? 0 : 1,
                borderColor: isToday ? colors.green : colors.line,
                borderStyle: future ? "dashed" : "solid",
                opacity: future ? 0.5 : 1,
              }}
            >
              {done ? <Ionicons name="checkmark" size={18} color={colors.onAccent} /> : null}
            </View>
            <Body size="micro" style={{ color: isToday ? colors.lime : colors.muted, fontWeight: isToday ? "700" : "400" }}>
              {label}
            </Body>
          </View>
        );
      })}
    </View>
  );
}
