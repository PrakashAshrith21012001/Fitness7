"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

/** Layered sine ridges — cheap stand-in for a mountain profile. */
function height(x: number, y: number) {
  return (
    Math.sin(x * 0.42) * 1.5 +
    Math.sin(y * 0.33 + 1.2) * 1.1 +
    Math.sin((x + y) * 0.21) * 0.9 +
    Math.sin(x * 0.11 - y * 0.17) * 1.8
  );
}

function Ridge() {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(52, 34, 84, 56);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, height(x, y));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.position.y = -6 + Math.sin(t * 0.15) * 0.25;
    mesh.current.rotation.z = Math.sin(t * 0.08) * 0.04;
  });

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[-Math.PI / 2.32, 0, 0]} position={[0, -6, -6]}>
      <meshBasicMaterial color="#c8ff1e" wireframe transparent opacity={0.16} />
    </mesh>
  );
}

export default function RidgeScene() {
  return (
    <Canvas dpr={[1, 1.5]} gl={{ antialias: true }} style={{ pointerEvents: "none" }}>
      <PerspectiveCamera makeDefault position={[0, 1.5, 11]} fov={52} />
      <fog attach="fog" args={["#05060A", 10, 30]} />
      <Ridge />
    </Canvas>
  );
}
