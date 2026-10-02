import { useRef, type ReactNode } from "react";
import { Modal, PanResponder, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * cult.fit bottom sheet: dimmed backdrop, rounded top, grab handle. Drag the
 * handle down (or tap the backdrop) to close.
 *
 *   full  — fills the screen up to just under the status bar, so the page
 *           behind peeks out at the top (the weekly-activity sheet on Home)
 *   else  — hugs its content (Weeks Active, Fitness Devices, weekly goal)
 */
export function Sheet({
  open,
  onClose,
  children,
  full,
  bg = "#0b0d16",
  style,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  full?: boolean;
  bg?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const drag = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 60) onClose();
      },
    }),
  ).current;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.55)" }]} />
        <View
          style={[
            {
              backgroundColor: bg,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              overflow: "hidden",
              paddingBottom: full ? 0 : insets.bottom + 16,
            },
            full ? { position: "absolute", left: 0, right: 0, bottom: 0, top: insets.top + 40 } : null,
            style,
          ]}
        >
          <View {...drag.panHandlers} style={{ position: full ? "absolute" : "relative", zIndex: 5, top: 0, left: 0, right: 0, height: 26, alignItems: "center", justifyContent: "center" }}>
            <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)" }} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
