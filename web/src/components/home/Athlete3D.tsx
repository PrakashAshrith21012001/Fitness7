"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { athlete, MOVE_BY_EXERCISE, type Exercise } from "@/lib/athlete";
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

function Figure({ still }: { still: boolean }) {
  const gltf = useGLTF(MODEL);
  const { rig, props } = useMemo(() => {
    const r = new AthleteRig(gltf.scene, [...REGIONS]);
    const { material, uniforms } = athleteMaterial();
    r.mesh.material = material;
    r.pulse = uniforms.uPulse;
    return { rig: r, props: new AthleteProps(r) };
  }, [gltf]);

  const current = useRef<Exercise>(athlete.exercise);
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
    if (current.current !== athlete.exercise) {
      current.current = athlete.exercise;
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
    athlete.angle = Math.round(THREE.MathUtils.radToDeg(a.clone().sub(p).angleTo(b.clone().sub(p))));
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

export default function Athlete3D({ active, still }: { active: boolean; still: boolean; dark?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0.12, 4.15], fov: 30 }} gl={{ antialias: true, alpha: true }} shadows>
      <ambientLight intensity={0.45} />
      {/* soft key from the front-left, cool rim behind for the silhouette, a touch of fill */}
      <directionalLight position={[2.5, 4, 3.5]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2.5, -3]} intensity={2.4} color="#b9c8ff" />
      <directionalLight position={[3, 1.2, -2.5]} intensity={1} />
      <group position={[0, -0.95, 0]}>
        <Suspense fallback={null}>
          <Figure still={still} />
        </Suspense>
      </group>
      <ContactShadows position={[0, -0.95, 0]} opacity={0.75} scale={5} blur={2.4} far={2.2} resolution={512} color="#000000" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.4} position={[0, 4, 1]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-3, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
