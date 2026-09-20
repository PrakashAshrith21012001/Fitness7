"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

/**
 * Layered ridgelines that fall past the camera as the page is scrolled, so the
 * scroll reads as a climb. Nearer ranges travel faster than distant ones, and
 * each sits further toward the haze colour — aerial perspective, which is what
 * actually makes depth legible in a real mountain view.
 */

const LAYERS = 6;

/** One silhouette, built from layered sines so no two ranges repeat. */
function ridgeGeometry(seed: number, width: number, height: number) {
  const shape = new THREE.Shape();
  const steps = 200;
  shape.moveTo(-width / 2, -height * 2);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = -width / 2 + t * width;
    const y =
      (Math.sin(x * 0.22 + seed) * 0.55 +
        Math.sin(x * 0.51 + seed * 2.3) * 0.3 +
        Math.sin(x * 1.13 + seed * 3.9) * 0.13 +
        Math.sin(x * 2.4 + seed * 1.7) * 0.05) *
      height;
    shape.lineTo(x, y);
  }

  shape.lineTo(width / 2, -height * 2);
  shape.closePath();
  return new THREE.ShapeGeometry(shape, 1);
}

export function Ridge({
  progress,
  valley,
  haze,
}: {
  progress: MotionValue<number>;
  /** Near-ridge colour — the darkest thing on screen */
  valley: string;
  /** What distant ridges fade into */
  haze: string;
}) {
  const group = useRef<THREE.Group>(null);

  const layers = useMemo(() => {
    return Array.from({ length: LAYERS }, (_, i) => {
      const depth = i / (LAYERS - 1); // 0 = nearest
      return {
        geometry: ridgeGeometry(i * 12.7 + 3, 44 + i * 14, 1.2 + i * 0.45),
        depth,
        z: -3 - i * 5.5,
        // Nearer ranges sweep past faster. Kept small on purpose: the ranges
        // stay in the lower frame so the sky — which is what actually carries
        // the altitude — is never covered over.
        speed: 2.1 - i * 0.26,
        baseY: -6.4 - i * 0.25,
      };
    });
  }, []);

  const near = useMemo(() => new THREE.Color(valley), [valley]);
  const far = useMemo(() => new THREE.Color(haze), [haze]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = progress.get();

    g.children.forEach((child, i) => {
      const layer = layers[i];
      if (!layer) return;
      const target = layer.baseY - p * layer.speed;
      child.position.y = THREE.MathUtils.damp(child.position.y, target, 8, delta);

      // Aerial perspective, re-evaluated every frame so the ranges follow the
      // band: near-black in the valley, pale inside cloud, silhouette in sun.
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      const want = near.clone().lerp(far, layer.depth * 0.85);
      mat.color.lerp(want, 1 - Math.exp(-4 * delta));
    });

    // A breath of drift so a paused page is never completely dead
    g.position.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.35;
  });

  return (
    <group ref={group}>
      {layers.map((layer, i) => (
        <mesh key={i} geometry={layer.geometry} position={[0, layer.baseY, layer.z]}>
          <meshBasicMaterial color={valley} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
