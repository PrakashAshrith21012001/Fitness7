"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, PerspectiveCamera, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { Dumbbell } from "./Dumbbell";
import { Particles } from "./Particles";
import { useSceneColors } from "./useSceneColors";

export default function HeroScene({ progress }: { progress: MotionValue<number> }) {
  const pointer = useRef(new THREE.Vector2(0, 0));
  const [isMobile, setIsMobile] = useState(false);
  const colors = useSceneColors();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);

    const onMove = (e: PointerEvent) => {
      pointer.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ touchAction: "pan-y", background: "transparent" }}
    >
      <PerspectiveCamera makeDefault position={[0, 0.4, 6.2]} fov={38} />

      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 6, 6]} intensity={2.6} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-3, 2, 6]} intensity={130} color="#ffffff" distance={26} />
      <pointLight position={[-3, -2.5, -3]} intensity={110} color={colors.accent} distance={20} />
      <pointLight position={[5, 3, -3]} intensity={28} color={colors.rim} distance={20} />
      <spotLight position={[0, 7, 3]} angle={0.6} penumbra={1} intensity={60} color="#ffffff" />

      <Suspense fallback={null}>
        <Dumbbell progress={progress} pointer={pointer} isMobile={isMobile} accent={colors.accent} />
        <Particles color={colors.accent} />
        <ContactShadows position={[0, -1.75, 0]} opacity={0.5} scale={14} blur={2.8} far={4} color="#000000" />
      </Suspense>

      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
