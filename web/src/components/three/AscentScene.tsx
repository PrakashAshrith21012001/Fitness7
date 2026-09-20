"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import { Ridge } from "./Ridge";
import { Mist } from "./Mist";
import { Particles } from "./Particles";
import { useSceneColors } from "./useSceneColors";

export default function AscentScene({ progress }: { progress: MotionValue<number> }) {
  const [isMobile, setIsMobile] = useState(false);
  const colors = useSceneColors();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y", background: "transparent" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={isMobile ? 62 : 46} />
      {/* Everything is unlit flat colour — a mountain at dawn reads as
          silhouette, and flat shading keeps this at 60fps on a cheap phone. */}
      <Ridge progress={progress} valley={colors.ridgeNear} haze={colors.ridgeFar} />
      <Mist progress={progress} color="#C9CFC8" />
      <Particles count={isMobile ? 70 : 130} color={colors.accent} />
    </Canvas>
  );
}
