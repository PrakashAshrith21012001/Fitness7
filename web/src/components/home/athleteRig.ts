import * as THREE from "three";
import type { Exercise, Joint, Muscle } from "@/lib/athlete";

/**
 * Poses the anatomy figure (public/models/athlete.glb — built from the CC0
 * MakeHuman body by scripts/athlete/build_athlete.py).
 *
 * The bones' bind frames are world-aligned, so each frame we work in "figure
 * space" (+y up, +z forward, +x the figure's left, floor at y = 0):
 *   1. an exercise curve gives hips, spine, gaze, foot and hand targets;
 *   2. two-bone IK places knees and elbows (with a pole for which way they bend),
 *      so planted feet stay planted while the hips travel;
 *   3. small human details — breathing, weight shift, follow-through — go on top;
 *   4. on an exercise change, the old pose crossfades into the new one.
 * Movements use real tempo: slower lowering, quicker lift, short holds.
 */

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const smooth = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
};
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x, 0, 1));

/** A rep as phases (seconds): lower → hold → lift → rest. Returns 0 (start) … 1 (end range). */
function rep(t: number, down: number, hold: number, up: number, rest: number) {
  const T = down + hold + up + rest;
  const u = ((t % T) + T) % T;
  if (u < down) return sine(u / down);
  if (u < down + hold) return 1;
  if (u < down + hold + up) return 1 - smooth((u - down - hold) / up);
  return 0;
}

type Side = 0 | 1; // 0 = left (+x), 1 = right
type LimbTarget = { pos: THREE.Vector3; pole: THREE.Vector3 };
type FootTarget = LimbTarget & { yaw: number; pitch: number };
type Pose = {
  hips: THREE.Vector3; // offset of the pelvis from rest, figure space
  tilt: number; // pelvis pitch, + leans forward
  hipYaw?: number;
  hipRoll?: number;
  bend: number; // spine flexion, + forward (spread across 5 vertebra bones)
  twist?: number;
  side?: number;
  gaze?: { pitch: number; yaw: number }; // head direction in figure space
  feet: [FootTarget, FootTarget]; // ankle targets, absolute figure space
  /** hand targets; `chest` = relative to the upper-chest bone and carried with it */
  hands: [LimbTarget & { frame?: "fig" | "chest" | "shoulder" }, LimbTarget & { frame?: "fig" | "chest" | "shoulder" }];
  grip: [number, number];
  wristFlex?: [number, number];
  yaw: number; // whole-figure turn towards the camera
};

export type RigProp = "goblet" | "bell" | "dumbbells" | "rowbell" | "bench";

export type Frame = {
  joints: [Record<Joint, THREE.Vector3>, Record<Joint, THREE.Vector3>];
  props: Record<RigProp, number>;
};

// ---------------------------------------------------------------- exercises

/** Rest landmarks (figure space, floor at 0) are filled in when the model loads. */
type Rest = {
  ankleH: number;
  ankleX: number;
  shoulder: [THREE.Vector3, THREE.Vector3];
  armLen: number;
};

const sideX = (s: Side) => (s === 0 ? 1 : -1);

function standingFeet(r: Rest, width: number, out = 0.25, zL = 0.02, zR = 0.02): [FootTarget, FootTarget] {
  return [0, 1].map((s) => ({
    pos: V(sideX(s as Side) * width, r.ankleH, s === 0 ? zL : zR),
    pole: V(sideX(s as Side) * 0.3, 0, 1),
    yaw: sideX(s as Side) * out,
    pitch: 0,
  })) as [FootTarget, FootTarget];
}

const EX: Record<Exercise, (t: number, r: Rest) => Pose> = {
  // goblet squat: 3 s down-hold-up, chest proud, knees track the toes
  squat: (t, r) => {
    const p = rep(t, 1.35, 0.25, 0.95, 0.75);
    const breath = Math.sin(t * 1.6) * 0.012 * (1 - p);
    return {
      hips: V(0, -0.43 * p, -0.2 * p),
      tilt: 0.62 * p,
      bend: 0.08 * p + breath,
      gaze: { pitch: -0.12 * p, yaw: 0 },
      feet: standingFeet(r, 0.21, 0.42),
      hands: [
        { frame: "chest", pos: V(0.055, -0.07, 0.25), pole: V(0.35, -1, -0.1) },
        { frame: "chest", pos: V(-0.055, -0.07, 0.25), pole: V(-0.35, -1, -0.1) },
      ],
      grip: [0.9, 0.9],
      yaw: -0.55,
    };
  },

  // jumping jacks: arms trace a full arc, soft landings
  jacks: (t, r) => {
    const T = 1.05;
    const j = 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / T); // 0 closed, 1 open
    const air = Math.abs(Math.sin((2 * Math.PI * t) / T)); // airborne mid-move
    const land = 1 - air;
    const hop = 0.055 * Math.pow(air, 1.5);
    const feet = standingFeet(r, 0.11 + 0.25 * j, 0.2 + 0.1 * j);
    feet.forEach((f) => (f.pos.y += hop));
    const arm = (s: Side) => {
      const th = 0.22 + 2.72 * j;
      return {
        frame: "shoulder" as const,
        pos: V(sideX(s) * Math.sin(th) * r.armLen * 0.97, -Math.cos(th) * r.armLen * 0.97, 0.04 + 0.06 * Math.sin(th)),
        pole: V(sideX(s) * 0.2, -1, -0.6),
      };
    };
    return {
      hips: V(0, hop - 0.05 * land * (0.4 + 0.6 * j), 0),
      tilt: 0.06 * land,
      bend: 0.02,
      gaze: { pitch: 0.05 * j, yaw: 0 },
      feet,
      hands: [arm(0), arm(1)],
      grip: [0.25, 0.25],
      yaw: -0.3,
    };
  },

  // kettlebell swing: a hip hinge — the hips snap, the arms just follow
  swing: (t, r) => {
    const T = 1.55;
    const u = (t % T) / T;
    // 1 = bell back between the legs, 0 = bell floating at chest height
    const s = u < 0.42 ? 1 - smooth(u / 0.42) : u < 0.55 ? 0 : smooth((u - 0.55) / 0.45);
    const phi = 1.42 - 1.82 * s; // arm angle from vertical, + forward
    const hand = (sx: number) => ({
      frame: "shoulder" as const,
      pos: V(-sx * 0.15, -Math.cos(phi) * r.armLen * 0.98, Math.sin(phi) * r.armLen * 0.98),
      pole: V(sx * 0.6, -0.4, -1),
    });
    return {
      hips: V(0, -0.15 * s, -0.17 * s),
      tilt: 1.02 * s,
      bend: 0.1 * s,
      gaze: { pitch: 0.55 * s, yaw: 0 },
      feet: standingFeet(r, 0.24, 0.35),
      hands: [hand(1), hand(-1)],
      grip: [1, 1],
      yaw: -1.05,
    };
  },

  // easy jog on the spot
  run: (t, r) => {
    const T = 0.7;
    const ph = (2 * Math.PI * t) / T;
    const foot = (s: Side): FootTarget => {
      const f = ph + (s === 0 ? 0 : Math.PI);
      const lift = Math.max(0, Math.sin(f));
      return {
        pos: V(sideX(s) * 0.12, r.ankleH + 0.2 * Math.pow(lift, 1.3), 0.04 + 0.12 * Math.cos(f)),
        pole: V(sideX(s) * 0.15, 0, 1),
        yaw: sideX(s) * 0.1,
        pitch: 0.5 * lift,
      };
    };
    const arm = (s: Side) => {
      const f = ph + (s === 0 ? Math.PI : 0);
      return { frame: "shoulder" as const, pos: V(sideX(s) * 0.03, -0.3 + 0.06 * Math.sin(f), 0.06 + 0.2 * Math.sin(f)), pole: V(sideX(s) * 0.2, -0.3, -1) };
    };
    const bounce = Math.abs(Math.cos(ph));
    return {
      hips: V(0, -0.045 - 0.03 * bounce, 0),
      tilt: 0.14,
      hipYaw: 0.08 * Math.sin(ph),
      bend: 0.04,
      twist: -0.12 * Math.sin(ph),
      gaze: { pitch: -0.08, yaw: 0 },
      feet: [foot(0), foot(1)],
      hands: [arm(0), arm(1)],
      grip: [0.6, 0.6],
      yaw: -1.25,
    };
  },

  // warrior II, breathing into it
  warrior: (t, r) => {
    const b = Math.sin((2 * Math.PI * t) / 4.5);
    const sink = 0.27 + 0.02 * b;
    return {
      hips: V(0.1, -sink, 0),
      tilt: 0,
      hipYaw: 0.12,
      bend: -0.04,
      gaze: { pitch: -0.05, yaw: 1.2 },
      feet: [
        { pos: V(0.56, r.ankleH, 0.02), pole: V(1, 0, 0.15), yaw: 1.45, pitch: 0 },
        { pos: V(-0.46, r.ankleH, -0.02), pole: V(-0.2, 0, 1), yaw: -0.3, pitch: 0 },
      ],
      hands: [
        { frame: "shoulder", pos: V(r.armLen * 0.985, 0.02 + 0.01 * b, 0), pole: V(0, -1, 0) },
        { frame: "shoulder", pos: V(-r.armLen * 0.985, 0.02 + 0.01 * b, 0), pole: V(0, -1, 0) },
      ],
      grip: [0, 0],
      yaw: -0.2,
    };
  },

  // reverse lunges with dumbbells, alternating legs
  lunge: (t, r) => {
    const T = 2.9;
    const lead: Side = Math.floor(t / T) % 2 === 0 ? 0 : 1;
    const back: Side = lead === 0 ? 1 : 0;
    const p = rep(t, 1.25, 0.2, 0.95, 0.5);
    const feet = standingFeet(r, 0.12, 0.12);
    const bf = feet[back];
    bf.pos.z = 0.02 - 0.74 * p;
    bf.pos.y = r.ankleH + 0.075 * p + 0.06 * Math.sin(Math.PI * p) * (1 - p);
    bf.pitch = 0.95 * p;
    bf.pole = V(sideX(back) * 0.1, -0.6, 1);
    return {
      hips: V(0, -0.38 * p, -0.32 * p),
      tilt: 0.12 * p,
      bend: 0.03,
      gaze: { pitch: -0.06, yaw: 0 },
      feet,
      hands: [
        { frame: "shoulder", pos: V(0.05, -r.armLen * 0.97, 0.02), pole: V(0.3, 0, -1) },
        { frame: "shoulder", pos: V(-0.05, -r.armLen * 0.97, 0.02), pole: V(-0.3, 0, -1) },
      ],
      grip: [1, 1],
      yaw: -1.15,
    };
  },

  // one-arm dumbbell row, free hand on the bench — like a coach's form-check video
  row: (t, r) => {
    const p = rep(t, 0.8, 0.35, 1.25, 0.35); // 1 = dumbbell at the hip
    const breath = Math.sin(t * 1.5) * 0.01;
    return {
      hips: V(0.02, -0.11, -0.14),
      tilt: 1.12,
      hipYaw: 0.04 * p,
      bend: 0.14 + breath,
      twist: -0.1 * p,
      gaze: { pitch: 0.85, yaw: 0 },
      feet: [
        { pos: V(0.17, r.ankleH, 0.12), pole: V(0.2, 0, 1), yaw: 0.1, pitch: 0 },
        { pos: V(-0.18, r.ankleH, -0.32), pole: V(-0.2, 0, 1), yaw: -0.25, pitch: 0 },
      ],
      hands: [
        { frame: "fig", pos: V(0.21, BENCH_TOP + 0.045, 0.62), pole: V(1, 0, -0.4) },
        {
          frame: "shoulder",
          pos: V(-0.02 - 0.02 * p, -r.armLen * 0.97 + 0.36 * p, 0.04 - 0.24 * p),
          pole: V(-0.25, 0.7, -1),
        },
      ],
      grip: [0.15, 1],
      wristFlex: [0.75, 0],
      yaw: -1.35,
    };
  },

  // jab–cross off a light bounce
  box: (t) => {
    const T = 1.7;
    const u = t % T;
    const punch = (start: number) => {
      const x = u - start;
      if (x < 0 || x > 0.42) return 0;
      return x < 0.13 ? smooth(x / 0.13) : 1 - smooth((x - 0.13) / 0.29);
    };
    const jab = punch(0.1);
    const cross = punch(0.62);
    const bounce = Math.abs(Math.sin((2 * Math.PI * t) / 0.58));
    const guard = (sx: number) => V(sx * 0.075, 0.13, 0.2);
    const reach = (sx: number) => V(sx * 0.04, 0.16, 0.62);
    return {
      hips: V(0, -0.07 - 0.02 * bounce, 0),
      tilt: 0.08,
      hipYaw: -0.12 - 0.42 * cross + 0.12 * jab,
      bend: 0.08,
      twist: -0.25 * cross + 0.15 * jab,
      gaze: { pitch: -0.08, yaw: -0.2 },
      feet: [
        { pos: V(0.15, 0.072 + 0.01 * bounce, 0.18), pole: V(0.3, 0, 1), yaw: 0.25, pitch: 0 },
        { pos: V(-0.17, 0.072 + 0.04 * cross + 0.01 * bounce, -0.2), pole: V(-0.3, 0, 1), yaw: -0.55 + 0.3 * cross, pitch: 0.45 * cross },
      ],
      hands: [
        { frame: "chest", pos: guard(1).lerp(reach(1), jab), pole: V(1, -1, -0.2) },
        { frame: "chest", pos: guard(-1).lerp(reach(-1), cross), pole: V(-1, -1, -0.2) },
      ],
      grip: [1, 1],
      yaw: -0.8,
    };
  },
};

/** Top of the row bench, figure space. */
export const BENCH_TOP = 0.56;

// ---------------------------------------------------------------- rig

const SPINE = ["spine05", "spine04", "spine03", "spine02", "spine01"] as const;
const SPINE_W = [0.16, 0.2, 0.22, 0.22, 0.2];
const FINGERS = [2, 3, 4, 5];
const sfx = (s: Side) => (s === 0 ? "_L" : "_R");

export class AthleteRig {
  readonly group = new THREE.Group();
  readonly mesh: THREE.SkinnedMesh;
  private bone: Record<string, THREE.Bone> = {};
  private restPos: Record<string, THREE.Vector3> = {}; // figure space heads
  private restDir: Record<string, THREE.Vector3> = {};
  private parent: Record<string, string | null> = {};
  private order: string[] = [];
  private rest: Rest;
  private floor: number;
  readonly heatAttr: THREE.BufferAttribute;
  private muscle: Float32Array; // per vertex: [region1, weight1, region2, weight2]
  private heat = new Float32Array(16);
  private regions: Muscle[];
  /** the material's pulse uniform, so the glow breathes with the heat */
  pulse: { value: number } | null = null;

  // blending
  private from: Record<string, THREE.Quaternion> | null = null;
  private fromRoot = V();
  private blendT = 1;
  private local: Record<string, THREE.Quaternion> = {};
  private rootOffset = V();

  constructor(scene: THREE.Object3D, regions: Muscle[]) {
    this.regions = regions;
    let mesh: THREE.SkinnedMesh | null = null;
    scene.traverse((o) => {
      if ((o as THREE.SkinnedMesh).isSkinnedMesh) mesh = o as THREE.SkinnedMesh;
      if ((o as THREE.Bone).isBone) this.bone[o.name] = o as THREE.Bone;
    });
    if (!mesh) throw new Error("athlete.glb has no skinned mesh");
    this.mesh = mesh;
    const m = this.mesh;
    m.frustumCulled = false;
    m.castShadow = true;
    m.receiveShadow = true;

    // rest positions in figure space (bind frames carry translation only)
    const box = new THREE.Box3().setFromBufferAttribute(m.geometry.getAttribute("position") as THREE.BufferAttribute);
    this.floor = box.min.y;
    const walk = (b: THREE.Bone, base: THREE.Vector3, parentName: string | null) => {
      const p = base.clone().add(b.position);
      this.restPos[b.name] = p.clone().setY(p.y - this.floor);
      const d = (b.userData?.dir as number[] | undefined) ?? [0, 0.05, 0];
      this.restDir[b.name] = V(d[0], d[1], d[2]);
      this.parent[b.name] = parentName;
      this.order.push(b.name);
      this.local[b.name] = new THREE.Quaternion();
      b.children.forEach((c) => (c as THREE.Bone).isBone && walk(c as THREE.Bone, p, b.name));
    };
    walk(this.bone.root, V(), null);

    const rp = this.restPos;
    const armLen = rp.lowerarm01_L.distanceTo(rp.upperarm01_L) + rp.wrist_L.distanceTo(rp.lowerarm01_L);
    this.rest = {
      ankleH: rp.foot_L.y,
      ankleX: rp.foot_L.x,
      shoulder: [rp.upperarm01_L.clone(), rp.upperarm01_R.clone()],
      armLen,
    };

    // muscle highlight attributes
    const g = m.geometry;
    this.muscle = (g.getAttribute("_muscle") as THREE.BufferAttribute).array as Float32Array;
    const n = this.muscle.length / 4;
    this.heatAttr = new THREE.BufferAttribute(new Float32Array(n), 1);
    this.heatAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("aHeat", this.heatAttr);
    g.setAttribute("aCloth", g.getAttribute("_cloth"));
    g.deleteAttribute("_muscle");
    g.deleteAttribute("_cloth");

    // floor at y = 0
    scene.position.y = -this.floor;
    this.group.add(scene);
  }

  /** Bone head position at rest, figure space (floor at 0). */
  restOf(name: string) {
    return this.restPos[name].clone();
  }

  /** Grip point and handle axis for a hand, in the hand bone's local frame. */
  gripOf(side: Side) {
    const s = sfx(side);
    const wrist = this.restPos[`wrist${s}`];
    const knuckle = this.restPos[`finger3-1${s}`];
    const axis = this.restPos[`finger5-1${s}`].clone().sub(this.restPos[`finger2-1${s}`]).normalize();
    const along = knuckle.clone().sub(wrist);
    const palm = along.clone().cross(axis).normalize().multiplyScalar(side === 0 ? -1 : 1);
    const centre = along.multiplyScalar(0.95).addScaledVector(palm, 0.035);
    return { centre, axis };
  }

  bonesFor(name: string) {
    return this.bone[name];
  }

  setHeat(target: Muscle[], dt: number, pulse: number) {
    if (this.pulse) this.pulse.value = pulse;
    const k = Math.min(1, dt * 4.5);
    let moved = false;
    this.regions.forEach((r, i) => {
      const want = target.includes(r) ? 1 : 0;
      const h = this.heat[i] + (want - this.heat[i]) * k;
      if (Math.abs(h - this.heat[i]) > 1e-4) moved = true;
      this.heat[i] = h;
    });
    if (!moved && pulse < 0) return;
    const a = this.heatAttr.array as Float32Array;
    const m = this.muscle;
    for (let v = 0; v < a.length; v++) {
      const o = v * 4;
      a[v] = Math.min(1, this.heat[m[o]] * m[o + 1] + this.heat[m[o + 2]] * m[o + 3]);
    }
    this.heatAttr.needsUpdate = true;
  }

  // ---- pose solving -------------------------------------------------------

  private Qf: Record<string, THREE.Quaternion> = {};
  private Pf: Record<string, THREE.Vector3> = {};

  private fk(name: string) {
    const p = this.parent[name];
    if (!p) return;
    const off = this.restPos[name].clone().sub(this.restPos[p]).applyQuaternion(this.Qf[p]);
    this.Pf[name] = this.Pf[p].clone().add(off);
  }

  private setLocal(name: string, qFig: THREE.Quaternion) {
    this.Qf[name] = qFig.clone();
    const p = this.parent[name];
    const l = p ? this.Qf[p].clone().invert().multiply(qFig) : qFig.clone();
    this.local[name].copy(l);
    this.fk(name);
  }

  private keep(name: string) {
    const p = this.parent[name];
    this.Qf[name] = p ? this.Qf[p].clone() : new THREE.Quaternion();
    this.local[name].identity();
    this.fk(name);
  }

  /** frame mapping (dirA, hingeA) onto (dirB, hingeB) */
  private static basis(dirA: THREE.Vector3, hA: THREE.Vector3, dirB: THREE.Vector3, hB: THREE.Vector3) {
    const a1 = dirA.clone().normalize();
    const a2 = hA.clone().sub(a1.clone().multiplyScalar(hA.dot(a1))).normalize();
    const a3 = a1.clone().cross(a2);
    const b1 = dirB.clone().normalize();
    const b2 = hB.clone().sub(b1.clone().multiplyScalar(hB.dot(b1))).normalize();
    const b3 = b1.clone().cross(b2);
    const A = new THREE.Matrix4().makeBasis(a1, a2, a3);
    const B = new THREE.Matrix4().makeBasis(b1, b2, b3);
    return new THREE.Quaternion().setFromRotationMatrix(B.multiply(A.transpose()));
  }

  /** two-bone IK for upper/lower (arm or leg); returns the solved joint points */
  private limb(upper: string, lower: string, end: string, target: THREE.Vector3, pole: THREE.Vector3, restPole: THREE.Vector3) {
    const S = this.Pf[upper];
    const a = this.restPos[lower].distanceTo(this.restPos[upper]);
    const b = this.restPos[end].distanceTo(this.restPos[lower]);
    const toT = target.clone().sub(S);
    const d = clamp(toT.length(), Math.abs(a - b) + 1e-3, a + b - 1e-4);
    const n = toT.normalize();
    const cosA = clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1);
    const m = pole.clone().sub(n.clone().multiplyScalar(pole.dot(n)));
    if (m.lengthSq() < 1e-8) m.set(0, 0, 1);
    m.normalize();
    const E = S.clone().addScaledVector(n, a * cosA).addScaledVector(m, a * Math.sqrt(1 - cosA * cosA));
    const W = S.clone().addScaledVector(n, d);

    // rest frame: limb direction + its bend direction
    const ru = this.restPos[lower].clone().sub(this.restPos[upper]).normalize();
    const rm = restPole.clone().sub(ru.clone().multiplyScalar(restPole.dot(ru))).normalize();
    const parentQ = this.Qf[this.parent[upper]!];
    const ruP = ru.clone().applyQuaternion(parentQ);
    const rmP = rm.clone().applyQuaternion(parentQ);
    const up = E.clone().sub(S).normalize();
    const mU = m.clone().sub(up.clone().multiplyScalar(m.dot(up))).normalize();
    const qU = AthleteRig.basis(ruP, rmP, up, mU).multiply(parentQ);
    this.setLocal(upper, qU);

    const rf = this.restPos[end].clone().sub(this.restPos[lower]).normalize().applyQuaternion(qU);
    const fd = W.clone().sub(E).normalize();
    const qL = new THREE.Quaternion().setFromUnitVectors(rf, fd).multiply(qU);
    this.setLocal(lower, qL);
    return { S, E, W };
  }

  private yaw = 0;
  private joints: Frame["joints"] = [{} as Record<Joint, THREE.Vector3>, {} as Record<Joint, THREE.Vector3>];

  /** Solve the pose for `exercise` at time `t`, blending after a switch. */
  update(exercise: Exercise, t: number, dt: number, idle: { still: boolean; pointerX: number }): Frame {
    const r = this.rest;
    const pose = EX[exercise](idle.still ? 0.9 : t, r);
    const life = idle.still ? 0 : t;

    // human noise: breathing + slow weight shift + tiny head drift
    const breathe = Math.sin(life * 1.25) * 0.008;
    const shift = Math.sin(life * 0.37) * 0.008;

    // pelvis
    const rootQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.tilt, pose.hipYaw ?? 0, pose.hipRoll ?? 0, "YXZ"));
    this.Qf.root = rootQ;
    this.local.root.copy(rootQ);
    this.rootOffset.copy(pose.hips).add(V(shift, 0, 0));
    this.Pf.root = this.restPos.root.clone().add(this.rootOffset);

    // spine
    SPINE.forEach((s, i) => {
      const w = SPINE_W[i];
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pose.bend * w + (i >= 3 ? -breathe : 0), (pose.twist ?? 0) * w, (pose.side ?? 0) * w, "YXZ"));
      this.setLocal(s, this.Qf[this.parent[s]!].clone().multiply(q));
    });

    // head and neck look where the pose says
    const gaze = pose.gaze ?? { pitch: 0, yaw: 0 };
    const look = new THREE.Quaternion().setFromEuler(new THREE.Euler(gaze.pitch + Math.sin(life * 0.53) * 0.02, gaze.yaw + Math.sin(life * 0.29) * 0.03, 0, "YXZ"));
    const rel = this.Qf.spine01.clone().invert().multiply(look);
    const neckL = new THREE.Quaternion().slerp(rel, 0.45);
    this.setLocal("neck01", this.Qf.spine01.clone().multiply(neckL));
    this.setLocal("head", look);

    // legs
    ([0, 1] as Side[]).forEach((s) => {
      const x = sfx(s);
      this.keep(`upperleg01${x}`);
      const f = pose.feet[s];
      const sol = this.limb(`upperleg01${x}`, `lowerleg01${x}`, `foot${x}`, f.pos, f.pole, V(0, 0, 1));
      const footQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(f.pitch, f.yaw, 0, "YXZ"));
      this.setLocal(`foot${x}`, footQ);
      this.joints[s].hip = sol.S.clone();
      this.joints[s].knee = sol.E.clone();
      this.joints[s].ankle = sol.W.clone();
    });

    // arms
    ([0, 1] as Side[]).forEach((s) => {
      const x = sfx(s);
      this.keep(`clavicle${x}`);
      this.fk(`upperarm01${x}`);
      const h = pose.hands[s];
      let target = h.pos.clone();
      if (h.frame === "chest") target = h.pos.clone().applyQuaternion(this.Qf.spine01).add(this.Pf.spine01);
      else if (h.frame === "shoulder") target = h.pos.clone().add(this.posOfShoulder(s));
      const restPole = this.restPos[`wrist${x}`].clone().sub(this.restPos[`lowerarm01${x}`]);
      const sol = this.limb(`upperarm01${x}`, `lowerarm01${x}`, `wrist${x}`, target, h.pole, restPole);
      const flex = pose.wristFlex?.[s] ?? 0;
      const wq = this.Qf[`lowerarm01${x}`].clone().multiply(new THREE.Quaternion().setFromAxisAngle(this.gripOf(s).axis, flex * (s === 0 ? -1 : 1)));
      this.setLocal(`wrist${x}`, wq);
      this.joints[s].shoulder = sol.S.clone();
      this.joints[s].elbow = sol.E.clone();
      this.joints[s].wrist = sol.W.clone();

      // fingers curl round the handle
      const g = pose.grip[s];
      const axis = this.gripOf(s).axis;
      const sign = s === 0 ? -1 : 1;
      for (const fi of FINGERS) {
        for (let k = 1; k <= 3; k++) {
          const nm = `finger${fi}-${k}${x}`;
          if (!this.bone[nm]) continue;
          const ang = g * (k === 1 ? 1.15 : k === 2 ? 1.45 : 0.9) + 0.12;
          const q = new THREE.Quaternion().setFromAxisAngle(axis, ang * sign);
          this.setLocal(nm, this.Qf[this.parent[nm]!].clone().multiply(q));
        }
      }
      for (let k = 1; k <= 3; k++) {
        const nm = `finger1-${k}${x}`;
        if (!this.bone[nm]) continue;
        const q = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), g * 0.35 * (s === 0 ? 1 : -1));
        this.setLocal(nm, this.Qf[this.parent[nm]!].clone().multiply(q));
      }
    });
    this.joints[0].neck = this.Pf.neck01.clone();
    this.joints[1].neck = this.Pf.neck01.clone();

    // crossfade after an exercise change, then write to the bones
    if (this.blendT < 1) {
      this.blendT = Math.min(1, this.blendT + dt / 0.75);
      const w = smooth(this.blendT);
      for (const nm of this.order) {
        if (this.from?.[nm]) this.local[nm].copy(this.from[nm].clone().slerp(this.local[nm], w));
      }
      this.rootOffset.copy(this.fromRoot.clone().lerp(this.rootOffset, w));
    }
    for (const nm of this.order) {
      const b = this.bone[nm];
      if (!b) continue;
      b.quaternion.copy(this.local[nm]);
    }
    const rootRest = this.restPos.root;
    this.bone.root.position.set(rootRest.x + this.rootOffset.x, rootRest.y + this.floor + this.rootOffset.y, rootRest.z + this.rootOffset.z);

    // turn the whole figure towards the camera
    const yawTarget = pose.yaw + (idle.still ? 0 : idle.pointerX * 0.3);
    this.yaw += (yawTarget - this.yaw) * Math.min(1, dt * 3);
    this.group.rotation.y = this.yaw;

    return {
      joints: this.joints,
      props: {
        goblet: exercise === "squat" ? 1 : 0,
        bell: exercise === "swing" ? 1 : 0,
        dumbbells: exercise === "lunge" ? 1 : 0,
        rowbell: exercise === "row" ? 1 : 0,
        bench: exercise === "row" ? 1 : 0,
      },
    };
  }

  private posOfShoulder(s: Side) {
    return this.Pf[`upperarm01${sfx(s)}`].clone();
  }

  /** call when the exercise changes, before the next update */
  beginBlend() {
    this.from = Object.fromEntries(this.order.map((n) => [n, this.bone[n]?.quaternion.clone() ?? new THREE.Quaternion()]));
    this.fromRoot.copy(this.rootOffset);
    this.blendT = 0;
  }
}

/**
 * Studio-white skin with black training shorts, and a red glow on the
 * working muscles (driven by the per-vertex `aHeat`).
 */
export function athleteMaterial() {
  const uniforms = {
    uHot: { value: new THREE.Color("#e8412a") },
    uGlow: { value: new THREE.Color("#ff2a10") },
    uCloth: { value: new THREE.Color("#18191c") },
    uPulse: { value: 0.5 },
  };
  const mat = new THREE.MeshStandardMaterial({ color: "#dcd8d1", roughness: 0.58, metalness: 0 });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aHeat;\nattribute float aCloth;\nvarying float vHeat;\nvarying float vCloth;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHeat = aHeat;\nvCloth = aCloth;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uHot;\nuniform vec3 uGlow;\nuniform vec3 uCloth;\nuniform float uPulse;\nvarying float vHeat;\nvarying float vCloth;")
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat cloth = smoothstep(0.35, 0.65, vCloth);\nfloat heat = smoothstep(0.18, 0.95, vHeat) * (1.0 - 0.92 * cloth);\ndiffuseColor.rgb = mix(diffuseColor.rgb, uCloth, cloth);\ndiffuseColor.rgb = mix(diffuseColor.rgb, uHot, heat * 0.88);",
      )
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.85, cloth);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlow * heat * (0.22 + 0.25 * uPulse);");
  };
  mat.customProgramCacheKey = () => "f7-athlete";
  return { material: mat, uniforms };
}

export const REGIONS = ["pecs", "abs", "obliques", "delts", "biceps", "triceps", "forearms", "lats", "traps", "glutes", "quads", "hams", "calves"] as const;

// ---------------------------------------------------------------- props

function dumbbellMesh(mats: { iron: THREE.Material; chrome: THREE.Material }, handle = 0.13, plateR = 0.058) {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, handle + 0.1, 16), mats.chrome);
  g.add(bar);
  for (const sgn of [-1, 1]) {
    for (const [off, r, w] of [
      [handle / 2 + 0.018, plateR, 0.034],
      [handle / 2 + 0.05, plateR * 0.85, 0.028],
    ] as const) {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 28), mats.iron);
      plate.position.y = sgn * off;
      plate.castShadow = true;
      g.add(plate);
    }
  }
  return g;
}

/**
 * Equipment that appears with each movement: goblet dumbbell, kettlebell,
 * a pair of dumbbells, the row dumbbell and its bench. Each scales in/out.
 */
export class AthleteProps {
  readonly group = new THREE.Group();
  private items: Record<RigProp, THREE.Object3D>;
  private grips: [THREE.Object3D, THREE.Object3D];
  private axis: [THREE.Vector3, THREE.Vector3];
  private tmpA = V();
  private tmpB = V();

  constructor(private rig: AthleteRig) {
    const iron = new THREE.MeshStandardMaterial({ color: "#1b1c20", roughness: 0.35, metalness: 0.6 });
    const chrome = new THREE.MeshStandardMaterial({ color: "#c8cbd1", roughness: 0.2, metalness: 1 });
    const pad = new THREE.MeshStandardMaterial({ color: "#202125", roughness: 0.75 });
    const mats = { iron, chrome };

    // grip anchors ride on the wrist bones
    const g0 = rig.gripOf(0);
    const g1 = rig.gripOf(1);
    this.axis = [g0.axis, g1.axis];
    this.grips = [new THREE.Object3D(), new THREE.Object3D()];
    this.grips[0].position.copy(g0.centre);
    this.grips[1].position.copy(g1.centre);
    rig.bonesFor("wrist_L").add(this.grips[0]);
    rig.bonesFor("wrist_R").add(this.grips[1]);

    const inHand = (side: 0 | 1, handle?: number, r?: number) => {
      const d = dumbbellMesh(mats, handle, r);
      d.quaternion.setFromUnitVectors(V(0, 1, 0), this.axis[side]);
      this.grips[side].add(d);
      return d;
    };
    const pair = new THREE.Group();
    const dL = inHand(0);
    const dR = inHand(1);
    pair.userData.parts = [dL, dR];

    const rowbell = inHand(1, 0.13, 0.068);

    const goblet = dumbbellMesh(mats, 0.16, 0.075);
    this.group.add(goblet);

    const bell = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.105, 32, 24), iron);
    body.scale.set(1, 0.95, 1);
    body.castShadow = true;
    const handleM = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.013, 12, 32, Math.PI * 1.25), chrome);
    handleM.rotation.z = -Math.PI * 0.125;
    handleM.position.y = 0.075;
    body.position.y = -0.06;
    bell.add(body, handleM);
    this.group.add(bell);

    // flat bench in front of the lifter, like a row set-up
    const bench = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.95), pad);
    top.position.set(0, BENCH_TOP - 0.035, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    bench.add(top);
    for (const z of [-0.36, 0.36]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, BENCH_TOP - 0.07, 0.06), chrome);
      leg.position.set(0, (BENCH_TOP - 0.07) / 2, z);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.07), iron);
      foot.position.set(0, 0.02, z);
      bench.add(leg, foot);
    }
    bench.position.set(0.22, 0, 0.98);
    rig.group.add(bench);

    this.items = { goblet, bell, dumbbells: pair, rowbell, bench };
    for (const o of Object.values(this.items)) o.scale.setScalar(0.0001);
    dL.scale.setScalar(0.0001);
    dR.scale.setScalar(0.0001);
    rig.group.add(this.group);
  }

  update(frame: Frame, dt: number) {
    const k = Math.min(1, dt * 7);
    const scaleTo = (o: THREE.Object3D, want: number) => {
      const s = o.scale.x + (want - o.scale.x) * k;
      o.scale.setScalar(Math.max(0.0001, s));
      o.visible = s > 0.02;
    };
    (Object.keys(this.items) as RigProp[]).forEach((key) => {
      const o = this.items[key];
      if (key === "dumbbells") (o.userData.parts as THREE.Object3D[]).forEach((p) => scaleTo(p, frame.props.dumbbells));
      else scaleTo(o, frame.props[key]);
    });

    // two-handed equipment sits between the hands
    this.rig.group.updateMatrixWorld(true);
    const a = this.grips[0].getWorldPosition(this.tmpA);
    const b = this.grips[1].getWorldPosition(this.tmpB);
    const mid = a.add(b).multiplyScalar(0.5);
    this.group.worldToLocal(mid);
    const goblet = this.items.goblet;
    goblet.position.copy(mid).add(V(0, -0.05, 0.02));
    goblet.rotation.set(0, 0, 0);

    const bell = this.items.bell;
    const sh = frame.joints[0].shoulder.clone().add(frame.joints[1].shoulder).multiplyScalar(0.5);
    const dir = mid.clone().sub(sh).normalize();
    bell.position.copy(mid).addScaledVector(dir, 0.02);
    bell.quaternion.setFromUnitVectors(V(0, 1, 0), dir.negate());
  }
}
