"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

/**
 * Keyframes for the travelling dumbbell, as scroll progress 0→1 through the
 * story — one stop per chapter (hero, 01, 02, 03, meter).
 * Each stop is [x, y, z, scale, rotX, rotY, rotZ].
 */
type Key = [number, number, number, number, number, number, number];

const DESKTOP: Key[] = [
  [2.05, 0.05, 0, 0.9, 0.18, 0.4, 0.0], // hero — right of the headline
  [-2.5, 0.0, 0, 0.9, 0.1, 1.3, 0.35], // 01 — swings to the left
  [2.5, 0.1, 0, 0.9, -0.1, -1.1, -0.4], // 02 — back to the right
  [1.9, -1.35, 0.4, 0.5, 0.55, 0.0, 0.0], // 03 trek — small, low right, under the card
  [-2.6, -0.3, 0, 0.7, 0.1, 0.0, 0.0], // meter — left, the list sits right
];

const MOBILE: Key[] = [
  [0.0, 1.35, 0, 0.55, 0.2, 0.4, 0.0], // hero — upper half, copy sits below
  [0.0, 2.0, 0, 0.42, 0.1, 1.3, 0.3], // 01 — top strip
  [0.0, 2.0, 0, 0.42, -0.1, -1.1, -0.3], // 02
  [0.0, 2.1, 0, 0.36, 0.55, 0.0, 0.0], // 03 trek — smallest
  [0.0, 2.0, 0, 0.42, 0.0, 0.0, 0.0], // meter
];

function sample(keys: Key[], t: number): Key {
  const seg = keys.length - 1;
  const f = Math.min(Math.max(t, 0), 1) * seg;
  const i = Math.min(Math.floor(f), seg - 1);
  const u = f - i;
  // smoothstep between stops so each chapter has a settled pose
  const e = u * u * (3 - 2 * u);
  const a = keys[i];
  const b = keys[i + 1];
  return a.map((v, k) => v + (b[k] - v) * e) as Key;
}

export function Dumbbell({
  progress,
  pointer,
  isMobile,
  accent,
}: {
  progress: MotionValue<number>;
  pointer: React.RefObject<THREE.Vector2>;
  isMobile: boolean;
  accent: string;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    spin.current += delta * 0.22;

    const [x, y, z, s, rx, ry, rz] = sample(isMobile ? MOBILE : DESKTOP, progress.get());
    const p = pointer.current;
    const tiltX = p && !isMobile ? p.y * 0.18 : 0;
    const tiltZ = p && !isMobile ? -p.x * 0.1 : 0;

    const bob = Math.sin(state.clock.elapsedTime * 0.7) * 0.06;

    g.position.x = THREE.MathUtils.damp(g.position.x, x, 6, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, y + bob, 6, delta);
    g.position.z = THREE.MathUtils.damp(g.position.z, z, 6, delta);
    const sc = THREE.MathUtils.damp(g.scale.x, s * 0.78, 6, delta);
    g.scale.setScalar(sc);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx + tiltX, 5, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, rz + tiltZ, 5, delta);
    g.rotation.y = ry + spin.current;
  });

  const steel = <meshStandardMaterial color="#d2d8e2" metalness={0.95} roughness={0.18} />;
  const plate = <meshStandardMaterial color="#484d56" metalness={0.6} roughness={0.4} />;
  const glow = (
    <meshStandardMaterial
      color={accent}
      emissive={accent}
      emissiveIntensity={2.2}
      toneMapped={false}
    />
  );

  return (
    <group ref={group} position={[2.3, 0, 0]} scale={0.78}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 3.1, 40]} />
        {steel}
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.18, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 1.15, 32]} />
            {steel}
          </mesh>
          <mesh castShadow position={[side * 0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.92, 0.92, 0.22, 56]} />
            {plate}
          </mesh>
          <mesh position={[side * 0.225, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.66, 0.028, 14, 72]} />
            {glow}
          </mesh>
          <mesh castShadow position={[side * 0.44, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.64, 0.64, 0.18, 48]} />
            {plate}
          </mesh>
          <mesh position={[side * 0.545, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.44, 0.022, 12, 56]} />
            {glow}
          </mesh>
          <mesh position={[side * 0.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.12, 28]} />
            {steel}
          </mesh>
        </group>
      ))}
    </group>
  );
}
