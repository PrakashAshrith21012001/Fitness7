"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { athlete, type Exercise } from "@/lib/athlete";

/**
 * A stylised 3D athlete — a jointed figure built from capsules, no model file.
 * Each exercise is a small function of time that returns joint angles; every
 * frame the joints ease towards that pose, so switching exercise (when a new
 * programme card slides in) blends smoothly instead of snapping. The hips are
 * re-seated each frame so the feet stay on the floor.
 */

// ---- body proportions (metres-ish) ----
const THIGH = 0.44;
const SHIN = 0.43;
const UPPER = 0.29;
const FORE = 0.27;
const SHOULDER_Y = 0.47;

type Pair = [number, number]; // [left, right]
type Pose = {
  hipFlex: Pair; // − swings the leg forward
  hipAbd: Pair; // + spreads the legs
  knee: Pair; // + bends
  lean: number; // + leans the torso forward
  shFlex: Pair; // − raises the arm forward
  shAbd: Pair; // + raises the arm sideways
  elbowX: Pair; // − bends the forearm forward
  elbowZ: Pair; // + bends the forearm up when the arm is out to the side
  hop: number;
  yaw: number;
};

const P2 = (a: number, b = a): Pair => [a, b];
const wave = (t: number, period: number) => (1 - Math.cos((2 * Math.PI * t) / period)) / 2; // 0 → 1 → 0

const POSES: Record<Exercise, (t: number) => Pose> = {
  // goblet squat
  squat: (t) => {
    const s = wave(t, 2.6);
    return { hipFlex: P2(-1.5 * s), hipAbd: P2(0.14), knee: P2(2.05 * s), lean: 0.5 * s, shFlex: P2(-0.55), shAbd: P2(-0.12), elbowX: P2(-2.1), elbowZ: P2(0), hop: 0, yaw: -0.65 };
  },
  // jumping jacks
  jacks: (t) => {
    const j = wave(t, 0.9);
    return { hipFlex: P2(0), hipAbd: P2(0.05 + 0.3 * j), knee: P2(0.12), lean: 0, shFlex: P2(0), shAbd: P2(0.2 + 2.55 * j), elbowX: P2(-0.12), elbowZ: P2(0), hop: 0.08 * Math.abs(Math.sin((2 * Math.PI * t) / 0.9)), yaw: -0.25 };
  },
  // kettlebell swing
  swing: (t) => {
    const s = (1 + Math.cos((2 * Math.PI * t) / 1.4)) / 2; // 1 = bottom of the hinge
    return { hipFlex: P2(-0.3 * s), hipAbd: P2(0.16), knee: P2(0.5 * s), lean: 1.1 * s, shFlex: P2(0.25 * s - 1.45 * (1 - s)), shAbd: P2(-0.27), elbowX: P2(0), elbowZ: P2(0), hop: 0, yaw: -1.05 };
  },
  // running
  run: (t) => {
    const ph = (2 * Math.PI * t) / 0.72;
    const s = Math.sin(ph);
    return {
      hipFlex: [-0.75 * s - 0.12, 0.75 * s - 0.12],
      hipAbd: P2(0.03),
      knee: [0.35 + 0.95 * Math.max(0, Math.sin(ph + 1.1)), 0.35 + 0.95 * Math.max(0, Math.sin(ph + Math.PI + 1.1))],
      lean: 0.16,
      shFlex: [0.75 * s, -0.75 * s],
      shAbd: P2(0.08),
      elbowX: P2(-1.55),
      elbowZ: P2(0),
      hop: 0.05 * Math.abs(s),
      yaw: -1.2,
    };
  },
  // warrior II, breathing
  warrior: (t) => {
    const b = Math.sin((2 * Math.PI * t) / 4) * 0.05;
    return { hipFlex: [-0.35, 0.1], hipAbd: P2(0.5), knee: [1.0 + b, 0], lean: 0, shFlex: P2(0), shAbd: P2(1.57 + b), elbowX: P2(0), elbowZ: P2(0), hop: 0, yaw: -0.15 };
  },
  // alternating lunges with dumbbells
  lunge: (t) => {
    const side = Math.floor(t / 1.6) % 2;
    const s = wave(t, 1.6);
    const front = { hip: -1.25 * s, knee: 1.45 * s };
    const back = { hip: 0.45 * s, knee: 1.55 * s };
    return {
      hipFlex: side ? [back.hip, front.hip] : [front.hip, back.hip],
      hipAbd: P2(0.07),
      knee: side ? [back.knee, front.knee] : [front.knee, back.knee],
      lean: 0.08,
      shFlex: P2(0.05),
      shAbd: P2(0.14),
      elbowX: P2(-0.15),
      elbowZ: P2(0),
      hop: 0,
      yaw: -1.1,
    };
  },
  // dumbbell overhead press
  press: (t) => {
    const p = wave(t, 1.9);
    return { hipFlex: P2(0), hipAbd: P2(0.12), knee: P2(0.08), lean: -0.04, shFlex: P2(-0.15), shAbd: P2(1.35 + 1.45 * p), elbowX: P2(0), elbowZ: P2(1.75 * (1 - p) + 0.05), hop: 0, yaw: -0.3 };
  },
  // boxing combination
  box: (t) => {
    const punch = (o: number) => Math.pow(Math.max(0, Math.sin((2 * Math.PI * (t + o)) / 1.1)), 4);
    const l = punch(0);
    const r = punch(0.55);
    const bounce = Math.abs(Math.sin((2 * Math.PI * t) / 0.55));
    return {
      hipFlex: [-0.35, 0.25],
      hipAbd: P2(0.12),
      knee: [0.35, 0.3],
      lean: 0.12,
      shFlex: [-0.95 - 0.6 * l, -0.95 - 0.6 * r],
      shAbd: P2(0.18),
      elbowX: [-2.0 + 1.9 * l, -2.0 + 1.9 * r],
      elbowZ: P2(0),
      hop: 0.025 * bounce,
      yaw: -0.85,
    };
  },
};

type Rig = {
  root: THREE.Group;
  spine: THREE.Group;
  hip: [THREE.Group, THREE.Group];
  knee: [THREE.Group, THREE.Group];
  sh: [THREE.Group, THREE.Group];
  el: [THREE.Group, THREE.Group];
};

function legDrop(flex: number, knee: number, abd: number) {
  return Math.cos(abd) * (THIGH * Math.cos(flex) + SHIN * Math.cos(flex + knee));
}

function Figure({ dark, still }: { dark: boolean; still: boolean }) {
  const rig = useRef<Partial<Rig>>({ hip: [] as never, knee: [] as never, sh: [] as never, el: [] as never });
  const current = useRef<Exercise>(athlete.exercise);
  const t0 = useRef(0);

  const mats = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({ color: dark ? "#ddd8cd" : "#2b2d33", roughness: 0.55, metalness: 0.05 });
    const accent = new THREE.MeshStandardMaterial({ color: "#8cba3d", roughness: 0.45 });
    const iron = new THREE.MeshStandardMaterial({ color: dark ? "#55585f" : "#16171a", roughness: 0.35, metalness: 0.6 });
    return { body, accent, iron };
  }, [dark]);

  const props = useRef<Record<string, THREE.Object3D | null>>({});

  useFrame((state, dt) => {
    const r = rig.current as Rig;
    if (!r.root) return;
    const now = state.clock.elapsedTime;
    if (current.current !== athlete.exercise) {
      current.current = athlete.exercise;
      t0.current = now;
    }
    const t = still ? 0.6 : now - t0.current;
    const pose = POSES[current.current](t);
    const k = Math.min(1, dt * 9);
    const ease = (obj: THREE.Object3D, axis: "x" | "y" | "z", v: number) => {
      obj.rotation[axis] += (v - obj.rotation[axis]) * k;
    };

    [0, 1].forEach((i) => {
      const side = i === 0 ? 1 : -1; // left limbs abduct towards +x
      ease(r.hip[i], "x", pose.hipFlex[i]);
      ease(r.hip[i], "z", side * pose.hipAbd[i]);
      ease(r.knee[i], "x", pose.knee[i]);
      ease(r.sh[i], "x", pose.shFlex[i]);
      ease(r.sh[i], "z", side * pose.shAbd[i]);
      ease(r.el[i], "x", pose.elbowX[i]);
      ease(r.el[i], "z", side * pose.elbowZ[i]);
    });
    ease(r.spine, "x", pose.lean);
    ease(r.root, "y", pose.yaw + (still ? 0 : state.pointer.x * 0.25));

    // keep the lower foot on the floor
    const drop = Math.max(
      legDrop(r.hip[0].rotation.x, r.knee[0].rotation.x, r.hip[0].rotation.z),
      legDrop(r.hip[1].rotation.x, r.knee[1].rotation.x, -r.hip[1].rotation.z),
    );
    r.root.position.y += (drop + 0.05 + pose.hop - r.root.position.y) * Math.min(1, dt * 14);

    // props for the current exercise
    const want: Record<string, boolean> = {
      goblet: current.current === "squat",
      bell: current.current === "swing",
      dbL: current.current === "lunge" || current.current === "press",
      dbR: current.current === "lunge" || current.current === "press",
    };
    for (const [key, obj] of Object.entries(props.current)) {
      if (!obj) continue;
      const target = want[key] ? 1 : 0.0001;
      const s = obj.scale.x + (target - obj.scale.x) * Math.min(1, dt * 10);
      obj.scale.setScalar(s);
      obj.visible = s > 0.01;
    }
  });

  const limb = (len: number, radius: number) => (
    <mesh material={mats.body} position={[0, -len / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, len - radius * 2, 8, 16]} />
    </mesh>
  );
  const joint = (r: number, y = 0) => (
    <mesh material={mats.body} position={[0, y, 0]} castShadow>
      <sphereGeometry args={[r, 20, 16]} />
    </mesh>
  );
  const dumbbell = (key: string, x: number) => (
    <group ref={(n) => void (props.current[key] = n)} position={[x, -FORE - 0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mats.iron}>
        <cylinderGeometry args={[0.018, 0.018, 0.2, 12]} />
      </mesh>
      {[-0.085, 0.085].map((y) => (
        <mesh key={y} material={mats.accent} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <group
      ref={(n) => {
        if (n) rig.current.root = n;
      }}
      position={[0, THIGH + SHIN + 0.05, 0]}
      rotation={[0, -0.6, 0]}
    >
      {/* pelvis */}
      <mesh material={mats.body} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.1, 0.12, 8, 16]} />
      </mesh>

      {/* legs */}
      {[0, 1].map((i) => (
        <group key={`leg${i}`} position={[i === 0 ? 0.1 : -0.1, -0.02, 0]} ref={(n) => void (n && (rig.current.hip![i] = n))}>
          {joint(0.07)}
          {limb(THIGH, 0.068)}
          <group position={[0, -THIGH, 0]} ref={(n) => void (n && (rig.current.knee![i] = n))}>
            {joint(0.058)}
            {limb(SHIN, 0.055)}
            <mesh material={mats.body} position={[0, -SHIN - 0.01, 0.05]} castShadow>
              <boxGeometry args={[0.09, 0.05, 0.2]} />
            </mesh>
          </group>
        </group>
      ))}

      {/* torso, head, arms */}
      <group position={[0, 0.05, 0]} ref={(n) => void (n && (rig.current.spine = n))}>
        <mesh material={mats.body} position={[0, 0.27, 0]} castShadow>
          <capsuleGeometry args={[0.135, 0.22, 10, 20]} />
        </mesh>
        <mesh material={mats.accent} position={[0, 0.27, 0]} scale={[1.02, 0.55, 1.02]}>
          <capsuleGeometry args={[0.135, 0.22, 10, 20]} />
        </mesh>
        <mesh material={mats.body} position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.045, 0.05, 0.08, 12]} />
        </mesh>
        <mesh material={mats.body} position={[0, 0.66, 0.01]} castShadow>
          <sphereGeometry args={[0.105, 28, 24]} />
        </mesh>

        {/* goblet dumbbell held at the chest */}
        <group ref={(n) => void (props.current.goblet = n)} position={[0, 0.3, 0.2]}>
          <mesh material={mats.iron}>
            <cylinderGeometry args={[0.02, 0.02, 0.22, 12]} />
          </mesh>
          {[-0.1, 0.1].map((y) => (
            <mesh key={y} material={mats.accent} position={[0, y, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.05, 20]} />
            </mesh>
          ))}
        </group>

        {[0, 1].map((i) => (
          <group key={`arm${i}`} position={[i === 0 ? 0.2 : -0.2, SHOULDER_Y, 0]} ref={(n) => void (n && (rig.current.sh![i] = n))}>
            {joint(0.06)}
            {limb(UPPER, 0.05)}
            <group position={[0, -UPPER, 0]} ref={(n) => void (n && (rig.current.el![i] = n))}>
              {joint(0.046)}
              {limb(FORE, 0.044)}
              <mesh material={mats.body} position={[0, -FORE - 0.02, 0]}>
                <sphereGeometry args={[0.05, 16, 12]} />
              </mesh>
              {i === 0 ? dumbbell("dbL", 0) : dumbbell("dbR", 0)}
              {i === 0 ? (
                <group ref={(n) => void (props.current.bell = n)} position={[-0.05, -FORE - 0.13, 0]}>
                  <mesh material={mats.iron} castShadow>
                    <sphereGeometry args={[0.1, 24, 18]} />
                  </mesh>
                  <mesh material={mats.accent} position={[0, 0.1, 0]}>
                    <torusGeometry args={[0.055, 0.014, 10, 24]} />
                  </mesh>
                </group>
              ) : null}
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}

export default function Athlete3D({ active, dark, still }: { active: boolean; dark: boolean; still: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0.3, 4.1], fov: 30 }} gl={{ antialias: true, alpha: true }} shadows>
      <ambientLight intensity={dark ? 0.35 : 0.6} />
      <directionalLight position={[2.5, 4, 3]} intensity={dark ? 2.6 : 2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2, -2]} intensity={0.9} color={dark ? "#9fd14f" : "#dfe8ff"} />
      {/* the camera looks at the origin, so the floor sits below it and the figure is centred */}
      <group position={[0, -0.98, 0]}>
        <Figure dark={dark} still={still} />
      </group>
      <ContactShadows position={[0, -0.98, 0]} opacity={dark ? 0.6 : 0.35} scale={4} blur={2.2} far={2} resolution={512} color={dark ? "#000000" : "#2a2b30"} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 1]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-3, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
