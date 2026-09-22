import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { greeting, localAnswer, fallbackAnswer, CHIPS, wa, type Reply } from "@f7/content";
import { radius, type } from "@/theme";
import { useColors } from "@/theme/ThemeProvider";
import { Body } from "@/components/ui";
import { ScreenHeader } from "@/components/Screen";

type Msg = { id: string; role: "user" | "assistant"; content: string };

/**
 * "Ask F7". Same brain as the website's chat: the common questions are
 * answered on-device from shared/gym.ts (works offline, instant), and free
 * text goes to the site's /api/chat when EXPO_PUBLIC_API_URL is set, which
 * adds Claude on top of the same facts. Anything it can't answer hands off
 * to WhatsApp — a person, not a dead end.
 */
const API = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

async function ask(history: Msg[]): Promise<Reply> {
  const last = history[history.length - 1]?.content ?? "";
  const local = localAnswer(last);
  const isChip = (CHIPS.home as readonly string[]).includes(last) || last.length < 28;
  if (local && isChip) return local;
  if (API) {
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) return (await res.json()) as Reply;
    } catch {
      /* fall through to local */
    }
  }
  return local ?? fallbackAnswer();
}

export default function Chat() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Msg>>(null);
  const first = greeting();
  const [messages, setMessages] = useState<Msg[]>([{ id: "g", role: "assistant", content: first.reply }]);
  const [chips, setChips] = useState<string[]>(first.chips ?? [...CHIPS.home]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => list.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, busy]);

  const send = async (content: string) => {
    const q = content.trim();
    if (!q || busy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = [...messages, { id: `u${Date.now()}`, role: "user" as const, content: q }];
    setMessages(next);
    setText("");
    setChips([]);
    setBusy(true);
    const reply = await ask(next);
    setMessages((m) => [...m, { id: `a${Date.now()}`, role: "assistant", content: reply.reply }]);
    setChips(reply.chips ?? []);
    setBusy(false);
  };

  const bubble = ({ item }: { item: Msg }) => {
    const me = item.role === "user";
    return (
      <View style={{ alignItems: me ? "flex-end" : "flex-start", paddingHorizontal: 16, marginBottom: 10 }}>
        <View
          style={{
            maxWidth: "84%",
            borderRadius: 18,
            borderBottomRightRadius: me ? 6 : 18,
            borderBottomLeftRadius: me ? 18 : 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
            backgroundColor: me ? colors.green : colors.surface,
            borderWidth: me ? 0 : 1,
            borderColor: colors.line,
          }}
        >
          <Body muted={false} style={{ color: me ? colors.onAccent : colors.white }}>
            {item.content}
          </Body>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: colors.black }}>
      <ScreenHeader
        title="Ask F7"
        right={
          <Pressable
            onPress={() => Linking.openURL(wa.general()).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel="Open WhatsApp"
            style={({ pressed }) => [
              {
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                borderWidth: 1,
                borderColor: colors.line,
                backgroundColor: colors.surface,
              },
              pressed && { borderColor: colors.green },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={16} color={colors.lime} />
            <Body size="small" muted={false} style={{ fontWeight: "600" }}>
              Human
            </Body>
          </Pressable>
        }
      />

      <FlatList
        ref={list}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={bubble}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          busy ? (
            <View style={{ paddingHorizontal: 16 }}>
              <Body size="small">Typing…</Body>
            </View>
          ) : null
        }
      />

      {chips.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          {chips.map((item) => (
            <Pressable
              key={item}
              onPress={() => send(item)}
              accessibilityRole="button"
              style={({ pressed }) => [
                {
                  height: 40,
                  paddingHorizontal: 14,
                  justifyContent: "center",
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.accentBorder,
                  backgroundColor: colors.limeSoft,
                },
                pressed && { backgroundColor: colors.green },
              ]}
            >
              <Body size="small" muted={false} style={{ fontWeight: "600" }}>
                {item}
              </Body>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.black,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          maxLength={500}
          placeholder="Ask about hours, prices, treks…"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Message"
          returnKeyType="send"
          onSubmitEditing={() => send(text)}
          style={{
            flex: 1,
            minHeight: 48,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.line,
            backgroundColor: colors.surface,
            paddingHorizontal: 18,
            color: colors.white,
            ...type.body,
          }}
        />
        <Pressable
          onPress={() => send(text)}
          disabled={!text.trim() || busy}
          accessibilityRole="button"
          accessibilityLabel="Send"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.green,
            opacity: text.trim() && !busy ? 1 : 0.45,
          }}
        >
          <Ionicons name="arrow-up" size={22} color={colors.onAccent} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
