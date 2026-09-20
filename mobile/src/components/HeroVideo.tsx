import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";

/** The footage is dark, so the header is always a dark band with white type — in both themes. */
const DARK = { surface: "#181c19" };

/**
 * A muted looping clip with a bottom scrim, for screen headers. Silent by
 * design; nothing on a gym app should ever make sound on open.
 */
export function HeroVideo({
  source,
  height = 260,
  style,
  children,
}: {
  source: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    // Web needs the play call after the element exists; native has already started.
    const t = setTimeout(() => {
      try {
        player.muted = true;
        player.play();
      } catch {
        /* not ready yet */
      }
    }, 150);
    // useVideoPlayer owns the player's lifecycle; releasing it here kills it
    // under StrictMode's double-invoke.
    return () => clearTimeout(t);
  }, [player]);

  return (
    <View style={[{ height, overflow: "hidden", backgroundColor: DARK.surface }, style]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      <LinearGradient
        colors={["rgba(10,15,13,0.15)", "rgba(10,15,13,0.62)", "rgba(10,15,13,0.94)"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}>{children}</View>
    </View>
  );
}
