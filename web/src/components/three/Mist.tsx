"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

/**
 * The cloud layer. Thickest in the middle of the climb — you enter the mist,
 * then break out above it — so its opacity is a curve over scroll, not a
 * constant.
 */
export function Mist({ progress, color }: { progress: MotionValue<number>; color: string }) {
  const group = useRef<THREE.Group>(null);

  /**
   * A soft vertical falloff, painted once. Without it each band is a flat
   * rectangle with hard edges, which reads as a grey panel the moment the
   * canvas behind it is light.
   */
  const alphaMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 4;
    c.height = 256;
    const ctx = c.getContext("2d");
    if (ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.38, "rgba(255,255,255,1)");
      g.addColorStop(0.62, "rgba(255,255,255,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 256);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const bands = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        y: -4.6 - i * 0.6,
        z: -6 - i * 4,
        scale: 30 + i * 9,
        drift: 0.05 + i * 0.03,
        offset: i * 1.9,
      })),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();

    // Peaks at the middle of the climb, gone by the summit
    const density = Math.max(0, Math.sin(Math.PI * Math.min(1, p * 1.15)));

    g.children.forEach((child, i) => {
      const band = bands[i];
      if (!band) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, density * 0.22, 5, delta);
      mesh.position.y = band.y - p * (2.6 - i * 0.3);
      mesh.position.x = Math.sin(state.clock.elapsedTime * band.drift + band.offset) * 2.2;
    });
  });

  return (
    <group ref={group}>
      {bands.map((band, i) => (
        <mesh key={i} position={[0, band.y, band.z]}>
          <planeGeometry args={[band.scale, band.scale * 0.34, 1, 1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0}
            alphaMap={alphaMap}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
