"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { heroScroll } from "@/lib/heroScroll";

/**
 * A studio-lit dumbbell, built from primitives (no model file to download).
 * It eases in on load, idles with a slow turn, leans towards the pointer, and
 * the hero's ScrollTrigger feeds `scroll.p` (0 → 1) so it rolls over and
 * sinks as you scroll past. The reflections come from a tiny environment of
 * light panels rendered locally — no HDR fetch.
 */


type PlateSpec = { x: number; r: number; w: number; accent?: boolean };
const PLATES: PlateSpec[] = [
  { x: 0.86, r: 0.66, w: 0.15 },
  { x: 1.03, r: 0.56, w: 0.13 },
  { x: 1.17, r: 0.42, w: 0.1, accent: true },
];

function Dumbbell({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);

  const mats = useMemo(
    () => ({
      rubber: new THREE.MeshPhysicalMaterial({ color: "#16171a", roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
      chrome: new THREE.MeshStandardMaterial({ color: "#d9dbe0", roughness: 0.18, metalness: 1 }),
      steel: new THREE.MeshStandardMaterial({ color: "#9a9ea6", roughness: 0.32, metalness: 1 }),
      accent: new THREE.MeshPhysicalMaterial({ color: "#8cba3d", roughness: 0.38, metalness: 0.05, clearcoat: 0.5 }),
    }),
    [],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (born.current === null) born.current = t;
    const age = t - born.current;
    const intro = still ? 1 : 1 - Math.pow(1 - Math.min(1, age / 1.6), 4); // easeOutQuart
    const p = heroScroll.p;

    const idle = still ? 0 : Math.sin(t * 0.45) * 0.55; // sway, never turns plate-on
    const targetY = -0.6 + idle + intro * 0.6 + p * Math.PI * 1.1 + state.pointer.x * 0.35;
    const targetX = 0.28 - p * 0.9 - state.pointer.y * 0.25;
    const targetZ = -0.42 + p * 0.5;
    const k = Math.min(1, dt * 4);
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    g.rotation.z += (targetZ - g.rotation.z) * k;
    g.position.y = (still ? 0 : Math.sin(t * 1.1) * 0.06) - p * 0.7;
    const s = (0.7 + 0.3 * intro) * (1 - p * 0.18);
    g.scale.setScalar(s);
  });

  return (
    <group ref={group} rotation={[0.28, -0.6, -0.42]}>
      {/* handle with knurled grip bands */}
      <mesh material={mats.chrome} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.075, 2.5, 48]} />
      </mesh>
      {[-0.32, -0.16, 0, 0.16, 0.32].map((x) => (
        <mesh key={x} material={mats.steel} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.083, 0.083, 0.1, 48]} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          {/* inner collar */}
          <mesh material={mats.chrome} position={[0.7, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.14, 48]} />
          </mesh>
          {PLATES.map((pl) => (
            <group key={pl.x} position={[pl.x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh material={pl.accent ? mats.accent : mats.rubber} castShadow>
                <cylinderGeometry args={[pl.r, pl.r, pl.w, 72]} />
              </mesh>
              {/* rounded rubber lip */}
              <mesh material={pl.accent ? mats.accent : mats.rubber} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[pl.r - 0.015, pl.w / 2, 16, 72]} />
              </mesh>
              {/* steel hub */}
              <mesh material={mats.steel}>
                <cylinderGeometry args={[0.13, 0.13, pl.w + 0.012, 40]} />
              </mesh>
            </group>
          ))}
          {/* end cap */}
          <mesh material={mats.chrome} position={[1.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.1, 0.08, 40]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Dumbbell3D({ active, still, dark = false }: { active: boolean; still: boolean; dark?: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.35, 5.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3.5, 5, 4]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={dark ? 2.2 : 0.8} color={dark ? "#b9dd7a" : "#dfe8ff"} />
      <Dumbbell still={still} />
      <ContactShadows position={[0, -1.25, 0]} opacity={dark ? 0.7 : 0.32} scale={7} blur={2.6} far={3.2} resolution={512} color={dark ? "#000000" : "#2a2b30"} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -1]} scale={[8, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[4, 0, 3]} rotation-y={-Math.PI / 2} scale={[3, 5, 1]} color="#eef3ff" />
        <Lightformer form="ring" intensity={2} position={[2, 3, 4]} scale={1.5} />
      </Environment>
    </Canvas>
  );
}
