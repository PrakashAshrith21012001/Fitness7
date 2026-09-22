import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { contact } from "@f7/content";
import { store as sc } from "@/theme/ThemeProvider";
import { useSession } from "@/state/session";
import { ST, StoreBar, StoreButton, StoreHeader } from "@/components/StoreUI";

/**
 * cult store Account (v4 t=93–97): avatar + name, Profile / Orders / Addresses
 * rows, then the Profile form (First Name, Last Name, Gender, Birthday) with
 * Save (grey until something changed → black) / Discard.
 */

type Gender = "Male" | "Female" | "Other";

export default function AccountPage() {
  const router = useRouter();
  const { member, update } = useSession();
  const [firstInit, lastInit] = useMemo(() => {
    const parts = (member?.name ?? "").trim().split(/\s+/).filter(Boolean);
    return [parts[0] ?? "", parts.slice(1).join(" ")];
  }, [member?.name]);
  const genderInit: Gender = member?.sex === "female" ? "Female" : member?.sex === "male" ? "Male" : "Other";
  const [first, setFirst] = useState(firstInit);
  const [last, setLast] = useState(lastInit);
  const [gender, setGender] = useState<Gender>(genderInit);
  const [birthday, setBirthday] = useState(member?.age ? `${new Date().getFullYear() - member.age}` : "");
  const [genderOpen, setGenderOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<"profile" | "addresses">("profile");

  useEffect(() => { setFirst(firstInit); setLast(lastInit); }, [firstInit, lastInit]);

  const dirty = first !== firstInit || last !== lastInit || gender !== genderInit;
  const save = async () => {
    const yr = Number(birthday.replace(/[^0-9]/g, "").slice(-4));
    await update({
      name: `${first.trim()} ${last.trim()}`.trim(),
      sex: gender === "Female" ? "female" : gender === "Male" ? "male" : undefined,
      ...(yr > 1900 && yr < new Date().getFullYear() ? { age: new Date().getFullYear() - yr } : {}),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  const discard = () => { setFirst(firstInit); setLast(lastInit); setGender(genderInit); };
  const initials = `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase() || "F7";

  return (
    <View style={{ flex: 1, backgroundColor: sc.bg }}>
      <StatusBar style="dark" />
      <StoreHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: sc.pink, alignItems: "center", justifyContent: "center" }}>
            <ST size={16} weight="900" color="#fff">{initials}</ST>
          </View>
          <ST size={17} weight="700">{member?.name?.trim() || "Fitness 7 member"}</ST>
        </View>
        {([
          { id: "profile", label: "Profile", icon: "person-circle-outline" as const, onPress: () => setSection("profile") },
          { id: "orders", label: "Orders", icon: "cart-outline" as const, onPress: () => router.push("/store/orders") },
          { id: "addresses", label: "Addresses", icon: "location-outline" as const, onPress: () => setSection("addresses") },
        ]).map((r) => {
          const on = section === r.id;
          return (
            <Pressable key={r.id} onPress={r.onPress} accessibilityRole="button" accessibilityLabel={r.label} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: sc.line }, pressed && { opacity: 0.6 }]}>
              <Ionicons name={r.icon} size={20} color={on ? sc.pink : sc.ink} />
              <ST size={14} weight="600" color={on ? sc.pink : sc.ink}>{r.label}</ST>
            </Pressable>
          );
        })}

        {section === "profile" ? (
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: sc.line, marginTop: 8 }}>
            <ST size={22} weight="800">Profile</ST>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: sc.pink, alignItems: "center", justifyContent: "center" }}>
                <ST size={20} weight="900" color="#fff">{initials}</ST>
              </View>
            </View>
            <Field label="First Name" value={first} onChange={setFirst} />
            <Field label="Last Name" value={last} onChange={setLast} />
            <ST size={12} weight="700" style={{ marginBottom: 6 }}>Gender</ST>
            <Pressable onPress={() => setGenderOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={`Gender ${gender}`} style={{ backgroundColor: sc.bg2, borderRadius: 4, height: 44, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", marginBottom: genderOpen ? 4 : 16 }}>
              <ST size={14} style={{ flex: 1 }}>{gender}</ST>
              <Ionicons name={genderOpen ? "chevron-up" : "chevron-expand-outline"} size={16} color={sc.muted} />
            </Pressable>
            {genderOpen ? (
              <View style={{ borderWidth: 1, borderColor: sc.line, borderRadius: 4, marginBottom: 16 }}>
                {(["Male", "Female", "Other"] as Gender[]).map((g) => (
                  <Pressable key={g} onPress={() => { setGender(g); setGenderOpen(false); }} accessibilityRole="radio" accessibilityState={{ selected: gender === g }} accessibilityLabel={g} style={{ minHeight: 44, paddingHorizontal: 12, justifyContent: "center", backgroundColor: gender === g ? sc.bg2 : sc.bg }}>
                    <ST size={14} weight={gender === g ? "700" : "500"}>{g}</ST>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Field label="Birthday" value={birthday} onChange={setBirthday} placeholder="23 Jul 2000" />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
              <StoreButton label={saved ? "Saved" : "Save"} tone={dirty || saved ? "black" : "grey"} disabled={!dirty && !saved} onPress={save} style={{ flex: 1 }} />
              <StoreButton label="Discard" tone="outline" disabled={!dirty} onPress={discard} style={{ flex: 1, borderColor: sc.line }} />
            </View>
          </View>
        ) : (
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: sc.line, marginTop: 8 }}>
            <ST size={22} weight="800">Addresses</ST>
            <View style={{ marginTop: 14, borderWidth: 1, borderColor: sc.line, borderRadius: 8, padding: 14, gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="home-outline" size={16} color={sc.ink} />
                <ST size={14} weight="700">Home · pick up at the gym</ST>
              </View>
              <ST size={12} muted>{contact.address.line1}, {contact.address.line2}</ST>
              <ST size={12} muted>{contact.address.city}, {contact.address.state} {contact.address.pincode}</ST>
            </View>
            <ST size={12} muted style={{ marginTop: 12 }}>Home delivery within Dharmapuri is arranged on WhatsApp after you order.</ST>
          </View>
        )}
      </ScrollView>
      <StoreBar active="account" />
    </View>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <ST size={12} weight="700" style={{ marginBottom: 6 }}>{label}</ST>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={sc.muted} accessibilityLabel={label} style={{ backgroundColor: sc.bg2, borderRadius: 4, height: 44, paddingHorizontal: 12, fontSize: 14, color: sc.ink }} />
    </View>
  );
}
