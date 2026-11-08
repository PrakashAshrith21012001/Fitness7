"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { CHANNELS, MOVE_BY_EXERCISE, type AthleteChannel, type Exercise } from "@/lib/athlete";
import { AthleteProps, AthleteRig, athleteMaterial, REGIONS } from "@/components/home/athleteRig";

/**
 * The anatomy athlete: a real human body (CC0 MakeHuman base, built into
 * public/models/athlete.glb) in studio white with black training shorts,
 * posed by inverse kinematics so feet stay planted and joints bend the way
 * people do. The working muscles glow red under the skin and a neon form
 * line shows the key joint angle — the look of a coach's form-check render.
 */

const MODEL = "/models/athlete.glb";
const FORM = "#8dff4f";
const UP = new THREE.Vector3(0, 1, 0);

function Figure({ still, channel }: { still: boolean; channel: AthleteChannel }) {
  const gltf = useGLTF(MODEL);
  const { rig, props } = useMemo(() => {
    // each canvas gets its own skeleton + geometry (the hero and Programs both show one)
    const r = new AthleteRig(cloneSkinned(gltf.scene), [...REGIONS]);
    const { material, uniforms } = athleteMaterial();
    r.mesh.material = material;
    r.pulse = uniforms.uPulse;
    return { rig: r, props: new AthleteProps(r) };
  }, [gltf]);

  const current = useRef<Exercise>(CHANNELS[channel].exercise);
  const t0 = useRef(0);
  const segA = useRef<THREE.Group>(null);
  const segB = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Mesh>(null);
  const tmp = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
  const mats = useMemo(
    () => ({
      line: new THREE.MeshBasicMaterial({ color: FORM, toneMapped: false, depthTest: false, transparent: true }),
      glow: new THREE.MeshBasicMaterial({ color: FORM, toneMapped: false, depthTest: false, transparent: true, opacity: 0.22 }),
    }),
    [],
  );

  useEffect(() => () => void rig.mesh.geometry.dispose(), [rig]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const now = state.clock.elapsedTime;
    const src = CHANNELS[channel];
    if (current.current !== src.exercise) {
      current.current = src.exercise;
      t0.current = now;
      rig.beginBlend();
    }
    const ex = current.current;
    const move = MOVE_BY_EXERCISE[ex];
    const frame = rig.update(ex, now - t0.current, dt, { still, pointerX: state.pointer.x });
    props.update(frame, dt);
    const pulse = still ? 0.5 : 0.5 + 0.5 * Math.sin(now * 3);
    rig.setHeat(move.muscles, dt, pulse);

    // form line a → pivot → b on the leading side
    const legs = move.form.includes("knee") || move.form.includes("ankle");
    const side = move.formSide ?? (legs ? (frame.joints[0].ankle.z >= frame.joints[1].ankle.z - 0.01 ? 0 : 1) : 0);
    const [ja, jp, jb] = move.form;
    const [a, p, b] = tmp;
    a.copy(frame.joints[side][ja]);
    p.copy(frame.joints[side][jp]);
    b.copy(frame.joints[side][jb]);
    const place = (seg: THREE.Group | null, from: THREE.Vector3, to: THREE.Vector3) => {
      if (!seg) return;
      const d = to.clone().sub(from);
      seg.position.copy(from).addScaledVector(d, 0.5);
      seg.quaternion.setFromUnitVectors(UP, d.clone().normalize());
      seg.scale.set(1, d.length(), 1);
    };
    place(segA.current, p, a);
    place(segB.current, p, b);
    if (pivot.current) {
      pivot.current.position.copy(p);
      pivot.current.scale.setScalar(1 + 0.25 * pulse);
    }
    src.angle = Math.round(THREE.MathUtils.radToDeg(a.clone().sub(p).angleTo(b.clone().sub(p))));
  });

  const segment = (ref: React.RefObject<THREE.Group | null>) => (
    <group ref={ref}>
      <mesh material={mats.glow} renderOrder={10}>
        <cylinderGeometry args={[0.02, 0.02, 1, 10]} />
      </mesh>
      <mesh material={mats.line} renderOrder={11}>
        <cylinderGeometry args={[0.0075, 0.0075, 1, 8]} />
      </mesh>
    </group>
  );

  return (
    <primitive object={rig.group}>
      {segment(segA)}
      {segment(segB)}
      <mesh ref={pivot} material={mats.line} renderOrder={12}>
        <sphereGeometry args={[0.019, 14, 10]} />
      </mesh>
    </primitive>
  );
}

/** `channel` picks who drives the exercise: the Programs section (default) or the hero's own cycle. */
/** Soft radial gradient as a texture: floor light pool and backdrop glow. */
function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Studio set: a light pool on the floor with a thin lime ring, and a soft glow behind the athlete. */
function Stage() {
  const { pool, glow } = useMemo(
    () => ({
      pool: radialTexture("rgba(255,255,255,0.16)", "rgba(255,255,255,0)"),
      glow: radialTexture("rgba(150,165,210,0.32)", "rgba(150,165,210,0)"),
    }),
    [],
  );
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} renderOrder={-1}>
        <circleGeometry args={[1.35, 64]} />
        <meshBasicMaterial map={pool} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]} renderOrder={-1}>
        <ringGeometry args={[0.92, 0.935, 96]} />
        <meshBasicMaterial color="#8dff4f" transparent opacity={0.35} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, 0]} renderOrder={-1}>
        <ringGeometry args={[1.18, 1.186, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.15, -1.6]} renderOrder={-2}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

/** Phones (and iPhones especially) get a lighter GPU budget and a closer camera. */
function deviceProfile() {
  if (typeof window === "undefined") return { small: false, ios: false };
  const small = window.matchMedia("(max-width: 640px)").matches;
  const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return { small, ios };
}

export default function Athlete3D({ active, still, channel = "programs" }: { active: boolean; still: boolean; dark?: boolean; channel?: AthleteChannel }) {
  const [{ small, ios }] = useState(deviceProfile);
  const light = small || ios;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={light ? [1, ios ? 1.25 : 1.5] : [1, 1.75]}
      camera={{ position: [0, small ? 0.08 : 0.12, small ? 3.55 : 4.15], fov: 30 }}
      gl={{ antialias: !light, alpha: true, powerPreference: light ? "low-power" : "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      {/* soft key from the front-left, cool rim behind for the silhouette, a touch of fill */}
      <directionalLight position={[2.5, 4, 3.5]} intensity={2.2} />
      <directionalLight position={[-3, 2.5, -3]} intensity={2.6} color="#b9c8ff" />
      <directionalLight position={[3, 1.2, -2.5]} intensity={1.1} />
      <group position={[0, -0.95, 0]}>
        <Stage />
        <Suspense fallback={null}>
          <Figure still={still} channel={channel} />
        </Suspense>
      </group>
      <ContactShadows position={[0, -0.948, 0]} opacity={0.8} scale={4} blur={2.2} far={2} resolution={light ? 256 : 512} frames={still ? 1 : Infinity} color="#000000" />
      <Environment resolution={light ? 32 : 64} frames={1}>
        <Lightformer form="rect" intensity={1.4} position={[0, 4, 1]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-3, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
