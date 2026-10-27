"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { athlete, MOVE_BY_EXERCISE, type Exercise, type Joint, type Muscle } from "@/lib/athlete";

/**
 * An anatomy-chart athlete, in the style of exercise-guide illustrations: a
 * matte studio-white figure with sculpted muscle groups, the working muscles
 * glowing red for the current movement, and a neon form-check line drawn
 * through the key joint with its live angle.
 *
 * Everything is built from primitives (no model file). Each exercise is a
 * small function of time returning joint angles; every frame the joints ease
 * towards that pose, so switching exercise blends instead of snapping. The
 * hips are re-seated each frame so the feet stay on the floor.
 */

// ---- body proportions (metres-ish) ----
const THIGH = 0.44;
const SHIN = 0.43;
const UPPER = 0.29;
const FORE = 0.27;
const SHOULDER_Y = 0.47;
const SHOULDER_X = 0.215;

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
  squat: (t) => {
    const s = wave(t, 2.6);
    return { hipFlex: P2(-1.5 * s), hipAbd: P2(0.14), knee: P2(2.05 * s), lean: 0.5 * s, shFlex: P2(-0.55), shAbd: P2(-0.12), elbowX: P2(-2.1), elbowZ: P2(0), hop: 0, yaw: -0.65 };
  },
  jacks: (t) => {
    const j = wave(t, 0.9);
    return { hipFlex: P2(0), hipAbd: P2(0.05 + 0.3 * j), knee: P2(0.12), lean: 0, shFlex: P2(0), shAbd: P2(0.2 + 2.55 * j), elbowX: P2(-0.12), elbowZ: P2(0), hop: 0.08 * Math.abs(Math.sin((2 * Math.PI * t) / 0.9)), yaw: -0.25 };
  },
  swing: (t) => {
    const s = (1 + Math.cos((2 * Math.PI * t) / 1.4)) / 2; // 1 = bottom of the hinge
    return { hipFlex: P2(-0.3 * s), hipAbd: P2(0.16), knee: P2(0.5 * s), lean: 1.1 * s, shFlex: P2(0.25 * s - 1.45 * (1 - s)), shAbd: P2(-0.27), elbowX: P2(0), elbowZ: P2(0), hop: 0, yaw: -1.05 };
  },
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
  warrior: (t) => {
    const b = Math.sin((2 * Math.PI * t) / 4) * 0.05;
    return { hipFlex: [-0.35, 0.1], hipAbd: P2(0.5), knee: [1.0 + b, 0], lean: 0, shFlex: P2(0), shAbd: P2(1.57 + b), elbowX: P2(0), elbowZ: P2(0), hop: 0, yaw: -0.15 };
  },
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
  press: (t) => {
    const p = wave(t, 1.9);
    return { hipFlex: P2(0), hipAbd: P2(0.12), knee: P2(0.08), lean: -0.04, shFlex: P2(-0.15), shAbd: P2(1.35 + 1.45 * p), elbowX: P2(0), elbowZ: P2(1.75 * (1 - p) + 0.05), hop: 0, yaw: -0.3 };
  },
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

const MUSCLES: Muscle[] = ["pecs", "abs", "obliques", "delts", "biceps", "triceps", "forearms", "lats", "traps", "glutes", "quads", "hams", "calves"];

type Rig = {
  root: THREE.Group;
  spine: THREE.Group;
  hip: THREE.Group[];
  knee: THREE.Group[];
  sh: THREE.Group[];
  el: THREE.Group[];
};

function legDrop(flex: number, knee: number, abd: number) {
  return Math.cos(abd) * (THIGH * Math.cos(flex) + SHIN * Math.cos(flex + knee));
}

const SKIN = new THREE.Color("#dedad3");
const HOT = new THREE.Color("#e2452b");
const HOT_GLOW = new THREE.Color("#ff2f12");
const FORM = "#8dff4f";
const UP = new THREE.Vector3(0, 1, 0);

/** Fine meridian lines → used as a bump map, they read as muscle fibres on the sculpted groups. */
function fibreTexture() {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 64);
  for (let x = 0; x < 256; x += 3) {
    const v = 90 + Math.floor(Math.random() * 90);
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, 0, 1.4, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function Figure({ still }: { still: boolean }) {
  const rig = useRef<Partial<Rig>>({ hip: [], knee: [], sh: [], el: [] });
  const anchors = useRef<Record<Joint, THREE.Object3D | null>[]>([{} as never, {} as never]);
  const current = useRef<Exercise>(athlete.exercise);
  const t0 = useRef(0);
  const heat = useRef<Record<Muscle, number>>(Object.fromEntries(MUSCLES.map((m) => [m, 0])) as Record<Muscle, number>);
  const props = useRef<Record<string, THREE.Object3D | null>>({});
  const lines = useRef<THREE.Group>(null);
  const segA = useRef<THREE.Group>(null);
  const segB = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Mesh>(null);

  const sphere = useMemo(() => new THREE.SphereGeometry(1, 28, 20), []);
  const mats = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.62, metalness: 0 });
    const shorts = new THREE.MeshStandardMaterial({ color: "#1c1d21", roughness: 0.8 });
    const iron = new THREE.MeshStandardMaterial({ color: "#1a1b1f", roughness: 0.3, metalness: 0.7 });
    const chrome = new THREE.MeshStandardMaterial({ color: "#c9ccd2", roughness: 0.2, metalness: 1 });
    const fibres = fibreTexture();
    const muscle = Object.fromEntries(
      MUSCLES.map((m) => [m, new THREE.MeshStandardMaterial({ color: SKIN.clone(), roughness: 0.55, emissive: new THREE.Color(0), bumpMap: fibres, bumpScale: 0.9 })]),
    ) as Record<Muscle, THREE.MeshStandardMaterial>;
    const line = new THREE.MeshBasicMaterial({ color: FORM, toneMapped: false, depthTest: false, transparent: true });
    const glow = new THREE.MeshBasicMaterial({ color: FORM, toneMapped: false, depthTest: false, transparent: true, opacity: 0.22 });
    return { skin, shorts, iron, chrome, muscle, line, glow };
  }, []);

  const va = useMemo(() => new THREE.Vector3(), []);
  const vp = useMemo(() => new THREE.Vector3(), []);
  const vb = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    const r = rig.current as Rig;
    if (!r.root || !r.spine) return;
    const now = state.clock.elapsedTime;
    if (current.current !== athlete.exercise) {
      current.current = athlete.exercise;
      t0.current = now;
    }
    const t = still ? 0.6 : now - t0.current;
    const pose = POSES[current.current](t);
    const move = MOVE_BY_EXERCISE[current.current];
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
    ease(r.root, "y", pose.yaw + (still ? 0 : state.pointer.x * 0.3));

    // keep the lower foot on the floor
    const drop = Math.max(
      legDrop(r.hip[0].rotation.x, r.knee[0].rotation.x, r.hip[0].rotation.z),
      legDrop(r.hip[1].rotation.x, r.knee[1].rotation.x, -r.hip[1].rotation.z),
    );
    r.root.position.y += (drop + 0.05 + pose.hop - r.root.position.y) * Math.min(1, dt * 14);

    // working muscles glow, the rest cool back to studio white
    const pulse = still ? 0.5 : 0.5 + 0.5 * Math.sin(now * 3.2);
    for (const m of MUSCLES) {
      const target = move.muscles.includes(m) ? 1 : 0;
      const h = (heat.current[m] += (target - heat.current[m]) * Math.min(1, dt * 5));
      const mat = mats.muscle[m];
      mat.color.copy(SKIN).lerp(HOT, h);
      mat.emissive.copy(HOT_GLOW).multiplyScalar(h * (0.18 + 0.22 * pulse));
    }

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

    // form-check line through a → pivot → b
    const g = lines.current;
    if (!g || !segA.current || !segB.current || !pivot.current) return;
    const legs = move.form.includes("knee") || move.form.includes("ankle");
    const sideIdx = legs ? (r.hip[0].rotation.x <= r.hip[1].rotation.x + 0.02 ? 0 : 1) : 0;
    const [ja, jp, jb] = move.form;
    const A = anchors.current[sideIdx][ja] ?? anchors.current[0][ja];
    const Pv = anchors.current[sideIdx][jp] ?? anchors.current[0][jp];
    const B = anchors.current[sideIdx][jb] ?? anchors.current[0][jb];
    if (!A || !Pv || !B) return;
    g.updateWorldMatrix(true, false);
    g.worldToLocal(A.getWorldPosition(va));
    g.worldToLocal(Pv.getWorldPosition(vp));
    g.worldToLocal(B.getWorldPosition(vb));
    const place = (seg: THREE.Group, from: THREE.Vector3, to: THREE.Vector3) => {
      tmp.subVectors(to, from);
      const len = tmp.length();
      seg.position.copy(from).addScaledVector(tmp, 0.5);
      seg.quaternion.setFromUnitVectors(UP, tmp.normalize());
      seg.scale.set(1, len, 1);
    };
    place(segA.current, vp, va);
    place(segB.current, vp, vb);
    pivot.current.position.copy(vp);
    pivot.current.scale.setScalar(1 + 0.25 * pulse);
    const a = tmp.subVectors(va, vp).angleTo(vb.clone().sub(vp));
    athlete.angle = Math.round(THREE.MathUtils.radToDeg(a));
  });

  const M = (m: Muscle, pos: [number, number, number], scale: [number, number, number], rot: [number, number, number] = [0, 0, 0]) => (
    <mesh geometry={sphere} material={mats.muscle[m]} position={pos} scale={scale} rotation={rot} castShadow />
  );
  const bone = (len: number, radius: number, mat: THREE.Material = mats.skin) => (
    <mesh material={mat} position={[0, -len / 2, 0]} castShadow>
      <capsuleGeometry args={[radius, len - radius * 2, 8, 16]} />
    </mesh>
  );
  const ball = (r: number, y = 0) => <mesh geometry={sphere} material={mats.skin} position={[0, y, 0]} scale={r} castShadow />;
  const anchor = (side: number, j: Joint, pos: [number, number, number] = [0, 0, 0]) => (
    <object3D position={pos} ref={(n) => void (anchors.current[side][j] = n)} />
  );
  const dumbbell = (key: string) => (
    <group ref={(n) => void (props.current[key] = n)} position={[0, -FORE - 0.03, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh material={mats.chrome}>
        <cylinderGeometry args={[0.016, 0.016, 0.22, 12]} />
      </mesh>
      {[-0.08, -0.05, 0.05, 0.08].map((y) => (
        <mesh key={y} material={mats.iron} position={[0, y, 0]} castShadow>
          <cylinderGeometry args={[Math.abs(y) > 0.06 ? 0.05 : 0.062, Math.abs(y) > 0.06 ? 0.05 : 0.062, 0.03, 24]} />
        </mesh>
      ))}
    </group>
  );

  return (
    <>
      <group
        ref={(n) => {
          if (n) rig.current.root = n;
        }}
        position={[0, THIGH + SHIN + 0.05, 0]}
        rotation={[0, -0.6, 0]}
      >
        {/* pelvis in training shorts, glutes on top */}
        <mesh material={mats.shorts} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.115, 0.13, 8, 18]} />
        </mesh>
        {M("glutes", [0.065, -0.03, -0.075], [0.085, 0.09, 0.07])}
        {M("glutes", [-0.065, -0.03, -0.075], [0.085, 0.09, 0.07])}

        {/* legs */}
        {[0, 1].map((i) => (
          <group key={`leg${i}`} position={[i === 0 ? 0.1 : -0.1, -0.02, 0]} ref={(n) => void (n && (rig.current.hip![i] = n))}>
            {anchor(i, "hip")}
            <mesh material={mats.shorts} position={[0, -0.06, 0]} castShadow>
              <cylinderGeometry args={[0.096, 0.09, 0.13, 20]} />
            </mesh>
            {bone(THIGH, 0.066)}
            {M("quads", [0, -0.22, 0.018], [0.074, 0.18, 0.066])}
            {M("hams", [0, -0.22, -0.02], [0.068, 0.17, 0.062])}
            <group position={[0, -THIGH, 0]} ref={(n) => void (n && (rig.current.knee![i] = n))}>
              {anchor(i, "knee")}
              {ball(0.054)}
              {bone(SHIN, 0.046)}
              {M("calves", [0, -0.13, -0.022], [0.053, 0.12, 0.052])}
              {anchor(i, "ankle", [0, -SHIN, 0])}
              <mesh material={mats.skin} position={[0, -SHIN - 0.012, 0.05]} castShadow>
                <capsuleGeometry args={[0.038, 0.12, 6, 12]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* torso, head, arms */}
        <group position={[0, 0.05, 0]} ref={(n) => void (n && (rig.current.spine = n))}>
          <mesh material={mats.skin} position={[0, 0.14, 0]} castShadow>
            <capsuleGeometry args={[0.112, 0.1, 10, 20]} />
          </mesh>
          <mesh geometry={sphere} material={mats.skin} position={[0, 0.35, -0.005]} scale={[0.17, 0.19, 0.115]} castShadow />
          {M("pecs", [0.072, 0.405, 0.068], [0.088, 0.068, 0.05], [0, 0, -0.18])}
          {M("pecs", [-0.072, 0.405, 0.068], [0.088, 0.068, 0.05], [0, 0, 0.18])}
          {[0.15, 0.21, 0.27].flatMap((y) =>
            [0.033, -0.033].map((x) => <mesh key={`${x}${y}`} geometry={sphere} material={mats.muscle.abs} position={[x, y, 0.098]} scale={[0.031, 0.027, 0.02]} />),
          )}
          {M("obliques", [0.098, 0.19, 0.035], [0.04, 0.085, 0.065])}
          {M("obliques", [-0.098, 0.19, 0.035], [0.04, 0.085, 0.065])}
          {M("lats", [0.115, 0.33, -0.035], [0.058, 0.13, 0.065], [0, 0, 0.2])}
          {M("lats", [-0.115, 0.33, -0.035], [0.058, 0.13, 0.065], [0, 0, -0.2])}
          {M("traps", [0, 0.49, -0.04], [0.13, 0.055, 0.07])}
          {anchor(0, "neck", [0, 0.55, 0])}
          {anchor(1, "neck", [0, 0.55, 0])}
          <mesh material={mats.skin} position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.05, 0.058, 0.1, 14]} />
          </mesh>
          <mesh geometry={sphere} material={mats.skin} position={[0, 0.675, 0.008]} scale={[0.092, 0.11, 0.1]} castShadow />
          {/* jaw, nose and ears so the head reads which way it faces */}
          <mesh geometry={sphere} material={mats.skin} position={[0, 0.625, 0.04]} scale={[0.07, 0.055, 0.07]} />
          <mesh geometry={sphere} material={mats.skin} position={[0, 0.672, 0.105]} scale={[0.016, 0.026, 0.02]} />
          <mesh geometry={sphere} material={mats.skin} position={[0.09, 0.67, 0]} scale={[0.014, 0.026, 0.018]} />
          <mesh geometry={sphere} material={mats.skin} position={[-0.09, 0.67, 0]} scale={[0.014, 0.026, 0.018]} />

          {/* goblet dumbbell held at the chest */}
          <group ref={(n) => void (props.current.goblet = n)} position={[0, 0.3, 0.21]}>
            <mesh material={mats.chrome}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 12]} />
            </mesh>
            {[-0.1, 0.1].map((y) => (
              <mesh key={y} material={mats.iron} position={[0, y, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
              </mesh>
            ))}
          </group>

          {[0, 1].map((i) => (
            <group key={`arm${i}`} position={[i === 0 ? SHOULDER_X : -SHOULDER_X, SHOULDER_Y, 0]} ref={(n) => void (n && (rig.current.sh![i] = n))}>
              {anchor(i, "shoulder")}
              {M("delts", [i === 0 ? 0.012 : -0.012, -0.03, 0], [0.074, 0.088, 0.078])}
              {bone(UPPER, 0.045)}
              {M("biceps", [0, -0.15, 0.018], [0.045, 0.095, 0.043])}
              {M("triceps", [0, -0.13, -0.02], [0.048, 0.11, 0.044])}
              <group position={[0, -UPPER, 0]} ref={(n) => void (n && (rig.current.el![i] = n))}>
                {anchor(i, "elbow")}
                {ball(0.042)}
                {bone(FORE, 0.037)}
                {M("forearms", [0, -0.09, 0.003], [0.044, 0.105, 0.041])}
                {anchor(i, "wrist", [0, -FORE, 0])}
                <mesh geometry={sphere} material={mats.skin} position={[0, -FORE - 0.03, 0]} scale={[0.04, 0.05, 0.035]} />
                {dumbbell(i === 0 ? "dbL" : "dbR")}
                {i === 0 ? (
                  <group ref={(n) => void (props.current.bell = n)} position={[-0.05, -FORE - 0.14, 0]}>
                    <mesh geometry={sphere} material={mats.iron} scale={0.1} castShadow />
                    <mesh material={mats.chrome} position={[0, 0.1, 0]}>
                      <torusGeometry args={[0.055, 0.014, 10, 24]} />
                    </mesh>
                  </group>
                ) : null}
              </group>
            </group>
          ))}
        </group>
      </group>

      {/* neon form-check line, drawn over the body */}
      <group ref={lines} renderOrder={10}>
        <group ref={segA}>
          <mesh material={mats.glow} renderOrder={10}>
            <cylinderGeometry args={[0.022, 0.022, 1, 10]} />
          </mesh>
          <mesh material={mats.line} renderOrder={11}>
            <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
          </mesh>
        </group>
        <group ref={segB}>
          <mesh material={mats.glow} renderOrder={10}>
            <cylinderGeometry args={[0.022, 0.022, 1, 10]} />
          </mesh>
          <mesh material={mats.line} renderOrder={11}>
            <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
          </mesh>
        </group>
        <mesh ref={pivot} material={mats.line} renderOrder={12}>
          <sphereGeometry args={[0.02, 14, 10]} />
        </mesh>
      </group>
    </>
  );
}

export default function Athlete3D({ active, still }: { active: boolean; still: boolean; dark?: boolean }) {
  return (
    <Canvas frameloop={active ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0.22, 4.05], fov: 30 }} gl={{ antialias: true, alpha: true }} shadows>
      <ambientLight intensity={0.45} />
      {/* soft key from the front-left, cool rim from behind for the silhouette */}
      <directionalLight position={[2.5, 4, 3.5]} intensity={2.3} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3, 2.5, -3]} intensity={2.2} color="#b9c8ff" />
      <directionalLight position={[3, 1, -2.5]} intensity={1.1} color="#ffffff" />
      <group position={[0, -0.9, 0]}>
        <Figure still={still} />
      </group>
      <ContactShadows position={[0, -0.9, 0]} opacity={0.75} scale={4} blur={2.4} far={2} resolution={512} color="#000000" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.6} position={[0, 4, 1]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[-3, 1, 2]} rotation-y={Math.PI / 2} scale={[3, 4, 1]} />
      </Environment>
    </Canvas>
  );
}
