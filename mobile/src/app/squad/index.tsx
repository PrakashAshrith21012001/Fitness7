import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { activitiesFor, brand, denseRank, squadClasses, squadCopy, squadMembers, squads, workoutFor } from "@f7/content";
import { useSession } from "@/state/session";
import { addDays, className, useBookings, weekStartOf } from "@/state/bookings";
import { today } from "@/state/session";
import { Ridges } from "@/components/Scenery";
import { Sheet } from "@/components/Sheet";
import { DevicesSheet, TrackHealthCard } from "@/components/ProfileSheets";
import { SCREEN_W, referText, shareText, useHorizontalIndex } from "@/components/FitnessShared";
import { PressScale } from "@/components/motion";
import { classPhoto, photo } from "@/lib/photos";

/**
 * Squad leaderboard — cult.fit's green "This week's leaderboard" page:
 * week switcher over a forest ridge, Everyone / per-squad tabs, the rank
 * table, each member's week card with their latest moment, upcoming classes
 * the squad has booked (JOIN books the same slot), and the sticky
 * ADD FRIENDS TO YOUR SQUAD button.
 */

const W = "#ffffff";
const MUTED = "rgba(255,255,255,0.6)";
const CARD = "rgba(255,255,255,0.07)";
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ord = (n: number) => (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
const nice = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return `${d.getDate()}${ord(d.getDate())} ${MON[d.getMonth()]}`;
};
const to12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

type Row = { id: string; name: string; initials: string; tint: string; n: number; weeksActive: number; me: boolean; moment?: { photo: string; caption: string } };

export default function SquadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { member } = useSession();
  const { attendedIn, weeksActive, isBooked, book, memories } = useBookings();
  const [offset, setOffset] = useState(0);
  const [tab, setTab] = useState("everyone");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [devices, setDevices] = useState(false);
  const [squadsOpen, setSquadsOpen] = useState(false);
  const carousel = useHorizontalIndex(SCREEN_W - 48 + 12);

  const t = today();
  const ws = addDays(weekStartOf(t), offset * 7);
  const we = addDays(ws, 6);
  const myN = attendedIn(ws, we).length;
  const myName = (member?.name || "You").trim();
  const initials = myName.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const myMoment = memories.find((m) => m.date >= ws && m.date <= we);

  const tabs = [{ id: "everyone", label: squadCopy.everyone }, ...squads.map((s) => ({ id: s.id, label: s.name }))];

  const rows = useMemo(() => {
    const ids = tab === "everyone" ? squadMembers.map((m) => m.id) : squads.find((s) => s.id === tab)?.memberIds ?? [];
    const list: Row[] = squadMembers
      .filter((m) => ids.includes(m.id))
      .map((m) => ({ id: m.id, name: m.name, initials: m.initials, tint: m.tint, n: activitiesFor(m, -offset), weeksActive: m.weeksActive, me: false, moment: m.moment }));
    list.push({ id: "me", name: "You", initials, tint: "#ff3e6c", n: myN, weeksActive, me: true, moment: myMoment ? { photo: myMoment.photo, caption: className(myMoment.classId) } : undefined });
    // ties: the member sits last among equals, like cult
    return denseRank(list.sort((a, b) => Number(a.me) - Number(b.me)), (r) => r.n);
  }, [tab, offset, myN, weeksActive, initials, myMoment]);
  const maxN = Math.max(1, ...rows.map((r) => r.n));

  const upcoming = squadClasses.map((c) => {
    const date = addDays(t, c.dayOffset);
    const d = new Date(date + "T12:00:00");
    return { ...c, date, label: `${d.getDate()} ${MON[d.getMonth()]} ${to12(c.time)}`, focus: workoutFor(c.classId, d.getDay()).focus };
  });

  const join = async (classId: string, date: string, time: string) => {
    const b = isBooked(classId, date, time) ?? (await book(classId, date, time));
    router.push(`/booking/${b.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#18432f" }}>
      <LinearGradient pointerEvents="none" colors={["#2d6a4d", "#225a40", "#1a4834", "#173f2e"]} locations={[0, 0.3, 0.7, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} stickyHeaderIndices={[1]}>
        {/* ---------- header over the forest ridge ---------- */}
        <View style={{ paddingTop: insets.top }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, height: 52 }}>
            <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={26} color={W} />
            </Pressable>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={() => shareText(referText(member?.name))} accessibilityRole="button" accessibilityLabel="Add a friend" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="add-circle-outline" size={26} color={W} />
              </Pressable>
              <Pressable onPress={() => setSquadsOpen(true)} accessibilityRole="button" accessibilityLabel="My squads" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="people-outline" size={24} color={W} />
              </Pressable>
            </View>
          </View>
          <Text style={{ color: W, fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 14 }}>{squadCopy.title.replace("This week's", offset === 0 ? "This week's" : "Weekly")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6 }}>
            <Pressable onPress={() => setOffset((o) => Math.max(-5, o - 1))} accessibilityRole="button" accessibilityLabel="Previous week" hitSlop={12}>
              <Ionicons name="chevron-back" size={16} color={W} />
            </Pressable>
            <Text style={{ color: W, fontSize: 15, fontWeight: "700" }}>
              {nice(ws)} - {nice(we)}
            </Text>
            {offset < 0 ? (
              <Pressable onPress={() => setOffset((o) => Math.min(0, o + 1))} accessibilityRole="button" accessibilityLabel="Next week" hitSlop={12}>
                <Ionicons name="chevron-forward" size={16} color={W} />
              </Pressable>
            ) : null}
          </View>
          <View style={{ marginTop: 10 }}>
            <Ridges width={SCREEN_W} height={80} variant="forest" />
          </View>
        </View>

        {/* ---------- sticky squad tabs ---------- */}
        <View style={{ backgroundColor: "#1f5139", paddingTop: 18 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
            {tabs.map((x) => {
              const on = x.id === tab;
              return (
                <Pressable key={x.id} onPress={() => setTab(x.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: on ? W : "transparent" }}>
                  <Text style={{ color: on ? W : MUTED, fontSize: 15, fontWeight: on ? "600" : "400" }}>{x.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.12)" }} />
        </View>

        {/* ---------- rank table ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.18)" }}>
            <Text style={{ flex: 1, color: MUTED, fontSize: 14, fontWeight: "700" }}>#Rank</Text>
            <Ionicons name="flag" size={14} color="#d8c58a" />
            <Text style={{ color: MUTED, fontSize: 14, fontWeight: "700", marginLeft: 4 }}>Activity</Text>
          </View>
          <View style={{ marginTop: 14 }}>
            {rows.map((r) => (
              <View key={r.id} style={{ flexDirection: "row", alignItems: "center", height: 54, paddingHorizontal: r.me ? 8 : 0, marginHorizontal: r.me ? -8 : 0, backgroundColor: r.me ? "rgba(255,255,255,0.1)" : "transparent", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
                <Text style={{ width: 22, color: W, fontSize: 15, fontWeight: "700" }}>{r.rank}</Text>
                <View>
                  {r.rank === 1 ? (
                    <View style={{ position: "absolute", top: -12, left: 0, right: 0, alignItems: "center" }}>
                      <MaterialCommunityIcons name="crown" size={16} color="#e8c46a" />
                    </View>
                  ) : null}
                  <Avatar initials={r.initials} tint={r.tint} size={34} />
                </View>
                <Text style={{ width: 92, color: W, fontSize: 15, fontWeight: "700", marginLeft: 12 }} numberOfLines={1}>
                  {r.name}
                </Text>
                {/* the runner moves right with the week's activity */}
                <View style={{ flex: 1, height: 54, justifyContent: "center" }}>
                  <View style={{ position: "absolute", left: `${(r.n / maxN) * 72}%` }}>
                    <MaterialCommunityIcons name="run-fast" size={22} color={r.me ? "#7dff6a" : "#d8c58a"} />
                  </View>
                </View>
                <View style={{ width: 1, height: 38, backgroundColor: "rgba(255,255,255,0.25)" }} />
                <Text style={{ width: 54, textAlign: "center", color: W, fontSize: 15, fontWeight: "700" }}>{r.n}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---------- member feed ---------- */}
        <View style={{ paddingHorizontal: 16, marginTop: 44, gap: 34 }}>
          {rows.map((r) => (
            <View key={r.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar initials={r.initials} tint={r.tint} size={46} />
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: W, fontSize: 16, fontWeight: "800" }}>{r.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.45)" }}>
                      <Ionicons name="star-half-outline" size={11} color="#e8c46a" />
                      <Text style={{ color: "#e8d7a6", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }}>RANK {r.rank}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Ionicons name="flash" size={12} color="#ffc93c" />
                    <Text style={{ color: MUTED, fontSize: 13 }}>
                      {r.weeksActive} Weeks Active
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <View style={{ width: 2, marginLeft: 22, marginRight: 22, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 1 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: CARD, borderRadius: 14, overflow: "hidden" }}>
                    <View style={{ flexDirection: "row" }}>
                      <Stat label="Activities" value={String(r.n)} green />
                      <Stat label="KCal" value="--" />
                    </View>
                    <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <View style={{ flexDirection: "row" }}>
                      <Stat label="Steps" value="--" />
                      <Stat label="Active mins" value="--" />
                    </View>
                    {r.me ? (
                      <TrackHealthCard onConnect={() => setDevices(true)} bg="rgba(255,255,255,0.05)" inset />
                    ) : null}
                    {r.moment ? (
                      <View style={{ height: 300, margin: r.me ? 0 : 0, backgroundColor: "#000" }}>
                        <Image source={photo(r.moment.photo)} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
                        <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.9)"]} locations={[0.55, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
                        <Text style={{ position: "absolute", left: 14, bottom: 14, color: W, fontSize: 15, fontWeight: "800" }}>{r.moment.caption}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ flexDirection: "row", gap: 18, marginTop: 12, marginLeft: 8 }}>
                    <Pressable onPress={() => setLiked((l) => ({ ...l, [r.id]: !l[r.id] }))} accessibilityRole="button" accessibilityLabel={`Like ${r.name}`} accessibilityState={{ selected: !!liked[r.id] }} hitSlop={8}>
                      <Ionicons name={liked[r.id] ? "thumbs-up" : "thumbs-up-outline"} size={24} color={liked[r.id] ? "#7dff6a" : W} />
                    </Pressable>
                    <Pressable onPress={() => shareText(`${r.me ? "I" : r.name} did ${r.n} workout${r.n === 1 ? "" : "s"} at ${brand.name} this week — ${r.weeksActive} weeks active! #WEAREF7`)} accessibilityRole="button" accessibilityLabel={`Share ${r.name}`} hitSlop={8}>
                      <Ionicons name="share-outline" size={24} color={W} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ---------- upcoming classes of the squad ---------- */}
        <View style={{ marginTop: 44 }}>
          <Text style={{ color: W, fontSize: 18, fontWeight: "800", paddingHorizontal: 16, marginBottom: 14 }}>Upcoming classes of the squad</Text>
          <FlatList
            data={upcoming}
            keyExtractor={(c) => c.id}
            horizontal
            snapToInterval={SCREEN_W - 48 + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={carousel.onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => {
              const joined = !!isBooked(item.classId, item.date, item.time);
              const people = squadMembers.filter((m) => item.memberIds.includes(m.id));
              return (
                <View style={{ width: SCREEN_W - 48, backgroundColor: CARD, borderRadius: 14, overflow: "hidden" }}>
                  <View style={{ flexDirection: "row", gap: 14, padding: 14 }}>
                    <Image source={classPhoto(item.classId)} style={{ width: 84, height: 84, borderRadius: 8 }} resizeMode="cover" accessibilityIgnoresInvertColors />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: W, fontSize: 17, fontWeight: "800" }} numberOfLines={1}>{className(item.classId)}</Text>
                      <Text style={{ color: W, fontSize: 13, marginTop: 4 }}>{item.label}</Text>
                      <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>{brand.name} TS Square</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                        {people.map((p, i) => (
                          <View key={p.id} style={{ marginLeft: i ? -8 : 0 }}>
                            <Avatar initials={p.initials} tint={p.tint} size={20} />
                          </View>
                        ))}
                        <Text style={{ color: MUTED, fontSize: 11, marginLeft: 6 }}>joining</Text>
                      </View>
                    </View>
                  </View>
                  <PressScale onPress={() => join(item.classId, item.date, item.time)} scale={0.98} accessibilityRole="button" accessibilityLabel={`${joined ? "Joined" : "Join"} ${className(item.classId)} ${item.label}`} style={{ height: 46, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <Text style={{ color: joined ? "#7dff6a" : W, fontSize: 13, fontWeight: "800", letterSpacing: 1 }}>{joined ? "JOINED ✓" : "JOIN"}</Text>
                  </PressScale>
                </View>
              );
            }}
          />
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 14 }}>
            {upcoming.map((_, i) => (
              <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: i === carousel.index ? W : "rgba(255,255,255,0.35)" }} />
            ))}
          </View>
        </View>

        {/* ---------- footer ridge ---------- */}
        <View style={{ marginTop: 50 }}>
          <Text style={{ color: W, fontSize: 13, fontWeight: "800", textAlign: "center", marginBottom: -20, zIndex: 2 }}>{squadCopy.footer}</Text>
          <Ridges width={SCREEN_W} height={170} variant="footer" />
        </View>
      </ScrollView>

      {/* ---------- sticky add friends ---------- */}
      <View pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 12 }}>
        <PressScale onPress={() => shareText(`Join my squad at ${brand.name}! ${referText(member?.name)}`)} scale={0.98} accessibilityRole="button" accessibilityLabel={squadCopy.addFriends} style={{ height: 52, borderRadius: 8, backgroundColor: W, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#ff3e3e", fontSize: 14, fontWeight: "800", letterSpacing: 1 }}>{squadCopy.addFriends.toUpperCase()}</Text>
        </PressScale>
      </View>

      <DevicesSheet open={devices} onClose={() => setDevices(false)} />
      <Sheet open={squadsOpen} onClose={() => setSquadsOpen(false)} bg="#173f2e">
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Text style={{ color: W, fontSize: 20, fontWeight: "800" }}>My squads</Text>
          {squads.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => {
                setTab(s.id);
                setSquadsOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={s.name}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" }}
            >
              <View style={{ flexDirection: "row" }}>
                {squadMembers
                  .filter((m) => s.memberIds.includes(m.id))
                  .map((m, i) => (
                    <View key={m.id} style={{ marginLeft: i ? -8 : 0 }}>
                      <Avatar initials={m.initials} tint={m.tint} size={28} />
                    </View>
                  ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: W, fontSize: 15, fontWeight: "700" }}>{s.name}</Text>
                <Text style={{ color: MUTED, fontSize: 12 }}>{s.memberIds.length + 1} members incl. you</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={MUTED} />
            </Pressable>
          ))}
          <Pressable onPress={() => shareText(`Start a squad with me at ${brand.name}! ${referText(member?.name)}`)} accessibilityRole="button" accessibilityLabel="Create a squad" style={{ marginTop: 16, minHeight: 48, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: W, fontWeight: "800", letterSpacing: 1 }}>CREATE A SQUAD</Text>
          </Pressable>
        </View>
      </Sheet>
    </View>
  );
}

function Avatar({ initials, tint, size }: { initials: string; tint: string; size: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint, alignItems: "center", justifyContent: "center", borderWidth: size > 24 ? 2 : 1, borderColor: "rgba(255,255,255,0.8)" }}>
      <Text style={{ color: W, fontSize: Math.max(8, size * 0.32), fontWeight: "800" }}>{initials}</Text>
    </View>
  );
}

function Stat({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 12 }}>
      <Text style={{ color: MUTED, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: green ? "#3ddc84" : W, fontSize: 22, fontWeight: "800", marginTop: 4 }}>{value}</Text>
    </View>
  );
}
