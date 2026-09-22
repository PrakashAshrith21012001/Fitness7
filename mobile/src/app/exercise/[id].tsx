import { Component, useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { exerciseById, MUSCLE_LABEL } from "@f7/content";
import { CultButton, H, Label, P, T } from "@/components/cult";
import { classPhoto } from "@/lib/photos";

/**
 * The exercise video — cult's full-screen player: black page, a white 16:9
 * video band in the middle with a spinner while it loads, the name, the
 * volume, the muscles and the cue under it, and NEXT EXERCISE cycling
 * through the block.
 */

const VIDEO = require("@/assets/video/gym.mp4");

class VideoBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function Player() {
  const player = useVideoPlayer(VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const { status } = useEvent(player, "statusChange", { status: player.status });
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        player.muted = true;
        player.play();
      } catch {
        /* not ready */
      }
    }, 150);
    return () => clearTimeout(t);
  }, [player]);
  return (
    <View style={{ flex: 1 }}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} allowsPictureInPicture={false} />
      {status !== "readyToPlay" ? (
        <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2" }]}>
          <ActivityIndicator color="#9aa1b8" />
        </View>
      ) : null}
    </View>
  );
}

export default function ExerciseScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cur, setCur] = useState(id ?? "");
  const found = exerciseById(cur) ?? exerciseById(id ?? "");
  const close = () => (router.canGoBack() ? router.back() : router.replace("/fitness"));

  if (!found) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
        <StatusBar style="light" />
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" }}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <P style={{ padding: 16 }}>Exercise not found.</P>
      </View>
    );
  }
  const { exercise, block, workout } = found;
  const idx = block.exercises.findIndex((e) => e.id === exercise.id);
  const next = block.exercises[(idx + 1) % block.exercises.length];

  const poster = (
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <Image source={classPhoto("strength")} style={{ width: "100%", height: "100%" }} resizeMode="cover" accessibilityIgnoresInvertColors />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
        <View style={{ paddingLeft: 8 }}>
          <Label color="rgba(255,255,255,0.6)">{workout.focus} · {block.title}</Label>
        </View>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#f2f2f2" }}>
            <VideoBoundary fallback={poster}>
              <Player key={exercise.id} />
            </VideoBoundary>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <H size={24} style={{ color: "#fff" }}>{exercise.name}</H>
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 6 }}>{exercise.volume}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {exercise.muscles.map((m) => (
              <View key={m} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)" }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{MUSCLE_LABEL[m]}</Text>
              </View>
            ))}
          </View>
          <T style={{ marginTop: 16, color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>{exercise.cue}</T>
          <P style={{ marginTop: 8, color: "rgba(255,255,255,0.5)" }}>{idx + 1} of {block.exercises.length} · {block.title}</P>
          <CultButton label="Next exercise" icon="chevron-forward" variant="white" style={{ marginTop: 24 }} onPress={() => setCur(next.id)} />
        </View>
      </ScrollView>
    </View>
  );
}
