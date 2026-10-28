"""
Build web/public/models/athlete.glb from the MakeHuman CC0 assets:
base.obj + macro targets (young, male, muscular, lean) + default rig weights.

Output: a skinned glTF with a reduced skeleton whose bind frames are world
aligned (bones carry translation only), so the site can pose it by limb
direction. Per-vertex `_MUSCLE` (region id) / `_GLOW` (belly weight) /
`_CLOTH` (shorts) attributes drive the highlight shader.

usage: python3 -I build_athlete.py <makehuman/data dir> <out.glb>
"""
import json, struct, sys, os
import numpy as np

DATA, OUT = sys.argv[1], sys.argv[2]

# ---------------- mesh ----------------
verts, faces, group = [], [], None
with open(os.path.join(DATA, "3dobjs/base.obj")) as f:
    for line in f:
        if line.startswith("v "):
            verts.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("g "):
            group = line.split()[1]
        elif line.startswith("f ") and group == "body":
            faces.append([int(p.split("/")[0]) - 1 for p in line.split()[1:]])
V = np.array(verts, dtype=np.float64)

def target(path, w):
    if w == 0:
        return
    with open(os.path.join(DATA, "targets", path)) as f:
        for line in f:
            if line.startswith("#") or not line.strip():
                continue
            i, dx, dy, dz = line.split()
            V[int(i)] += w * np.array([float(dx), float(dy), float(dz)])

MUSCLE, WEIGHT = 0.82, 0.36
mw = {"maxmuscle": (MUSCLE - 0.5) * 2, "averagemuscle": 1 - (MUSCLE - 0.5) * 2}
ww = {"minweight": (0.5 - WEIGHT) * 2, "averageweight": 1 - (0.5 - WEIGHT) * 2}
for m, a in mw.items():
    for w, b in ww.items():
        target(f"macrodetails/universal-male-young-{m}-{w}.target", a * b)
        target(f"macrodetails/proportions/male-young-{m}-{w}-idealproportions.target", a * b * 0.6)
for race in ("african", "asian", "caucasian"):
    target(f"macrodetails/{race}-male-young.target", 1 / 3)
target("torso/torso-muscle-pectoral-incr.target", 0.55)
target("torso/torso-muscle-dorsi-incr.target", 0.5)
target("torso/torso-vshape-incr.target", 0.45)
target("stomach/stomach-tone-incr.target", 0.8)
for s in "lr":
    for part, w in (("upperarm-muscle", 0.5), ("upperarm-shoulder-muscle", 0.55), ("lowerarm-muscle", 0.35), ("upperleg-muscle", 0.45), ("lowerleg-muscle", 0.45)):
        target(f"armslegs/{s}-{part}-incr.target", w)

V *= 0.1  # decimetres → metres

# ---------------- skeleton ----------------
skel = json.load(open(os.path.join(DATA, "rigs/default.mhskel")))
bones = skel["bones"]
jpos = {j: V[idx].mean(axis=0) for j, idx in skel["joints"].items()}

def keep(n):
    if n in ("root", "spine05", "spine04", "spine03", "spine02", "spine01", "neck01", "head"):
        return True
    base = n.split(".")[0]
    if base in ("clavicle", "upperarm01", "lowerarm01", "wrist", "upperleg01", "lowerleg01", "foot"):
        return True
    if base.startswith("finger"):
        return True  # all finger phalanges incl. thumb
    return False

KEEP = [n for n in bones if keep(n)]
def kept_ancestor(n):
    while n is not None and n not in KEEP:
        n = bones[n]["parent"]
    return n

# order parents first
order, seen = [], set()
def visit(n):
    if n in seen:
        return
    p = kept_ancestor(bones[n]["parent"]) if bones[n]["parent"] else None
    if p:
        visit(p)
    seen.add(n)
    order.append(n)
for n in KEEP:
    visit(n)
parent = {n: (kept_ancestor(bones[n]["parent"]) if bones[n]["parent"] else None) for n in order}
head = {n: jpos[bones[n]["head"]] for n in order}

# tail of a kept bone = tail of the deepest merged descendant along its chain
def chain_tail(n):
    t = bones[n]["tail"]
    cur = n
    while True:
        kids = [c for c, b in bones.items() if b["parent"] == cur and c not in KEEP and not any(s in c for s in ("finger", "metacarpal", "toe", "breast", "eye", "jaw", "tongue", "oris", "levator", "oculi", "temporalis", "risorius", "special"))]
        if len(kids) != 1:
            return jpos[t]
        cur = kids[0]
        t = bones[cur]["tail"]
tail = {n: chain_tail(n) for n in order}

# ---------------- weights ----------------
wraw = json.load(open(os.path.join(DATA, "rigs/default_weights.mhw")))["weights"]
bi = {n: i for i, n in enumerate(order)}
W = {}
for b, lst in wraw.items():
    k = kept_ancestor(b) or "root"
    for v, w in lst:
        W.setdefault(v, {}).setdefault(bi[k], 0.0)
        W[v][bi[k]] += w

used = sorted({i for f in faces for i in f})
remap = {v: i for i, v in enumerate(used)}
P = V[used].astype(np.float32)
tris = []
for f in faces:
    g = [remap[i] for i in f]
    tris.append([g[0], g[1], g[2]])
    if len(g) == 4:
        tris.append([g[0], g[2], g[3]])
T = np.array(tris, dtype=np.uint16)

N = np.zeros_like(P)
fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
for k in range(3):
    np.add.at(N, T[:, k], fn)
N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12

J = np.zeros((len(used), 4), dtype=np.uint8)
WW = np.zeros((len(used), 4), dtype=np.float32)
dom = np.zeros(len(used), dtype=np.int32)
domw = np.zeros(len(used), dtype=np.float32)
for i, v in enumerate(used):
    items = sorted(W.get(v, {bi["root"]: 1.0}).items(), key=lambda x: -x[1])[:4]
    s = sum(w for _, w in items)
    for k, (b, w) in enumerate(items):
        J[i, k] = b
        WW[i, k] = w / s
    dom[i], domw[i] = items[0][0], items[0][1] / s

# ---------------- regions ----------------
# MakeHuman faces +z, +x is the figure's left. Each muscle is a soft field:
# bone membership x side (front/back) x a belly profile along the bone, then
# diffused over the mesh so edges fade like the reference renders.
names = order
REG = ["pecs", "abs", "obliques", "delts", "biceps", "triceps", "forearms", "lats", "traps", "glutes", "quads", "hams", "calves"]
rid = {r: i for i, r in enumerate(REG)}
nv = len(used)
F = np.zeros((len(REG), nv), dtype=np.float64)

def hy(n):
    return head[n][1]
shoulder_y = hy("clavicle.L")
navel_y = hy("spine04")
chest_y = hy("spine02")
hip_y = hy("upperleg01.L")

def along(i, bone):
    h, t = head[bone], tail[bone]
    ax = t - h
    return float(np.dot(P[i] - h, ax) / np.dot(ax, ax))

def belly(t, a, b):
    if t <= a or t >= b:
        return 0.0
    return float(np.sin(np.pi * (t - a) / (b - a)) ** 0.7)

ss = lambda e0, e1, x: float(np.clip((x - e0) / (e1 - e0), 0, 1) ** 2 * (3 - 2 * np.clip((x - e0) / (e1 - e0), 0, 1)))
sideof = lambda x: "L" if x >= 0 else "R"
C = np.zeros(nv, dtype=np.float64)
waist = navel_y - 0.045
for i in range(nv):
    bn = names[dom[i]]
    b = bn.split(".")[0]
    x, y, z = P[i]
    nx, ny, nz = N[i]
    ax = abs(x)
    S = sideof(x)
    arm = b in ("upperarm01", "lowerarm01", "wrist") or b.startswith("finger") or b == "clavicle" and ax > 0.17
    if b == "upperleg01":
        t = along(i, bn)
        F[rid["quads"], i] = ss(-0.35, 0.25, nz) * belly(t, -0.05, 1.02)
        F[rid["hams"], i] = ss(0.15, -0.45, nz) * belly(t, 0.0, 0.95)
        F[rid["glutes"], i] = ss(0.0, -0.5, nz) * belly(t, -0.5, 0.25)
    elif b == "root":
        F[rid["glutes"], i] = ss(0.0, -0.5, nz) * ss(0.12, 0.0, y - hip_y) * ss(-0.2, -0.08, y - hip_y)
    elif b == "lowerleg01":
        t = along(i, bn)
        F[rid["calves"], i] = ss(0.15, -0.35, nz) * belly(t, -0.02, 0.65)
    elif b in ("spine05", "spine04", "spine03"):
        F[rid["abs"], i] = ss(0.3, 0.6, nz) * ss(0.095, 0.06, ax) * ss(hip_y + 0.04, hip_y + 0.1, y) * ss(chest_y + 0.02, chest_y - 0.04, y)
        F[rid["obliques"], i] = ss(-0.35, 0.1, nz) * ss(0.07, 0.11, ax) * ss(hip_y + 0.0, hip_y + 0.08, y) * ss(chest_y + 0.02, chest_y - 0.06, y)
        F[rid["lats"], i] = ss(0.0, -0.45, nz) * ss(0.03, 0.08, ax) * ss(navel_y - 0.02, navel_y + 0.06, y)
    elif b in ("spine02", "spine01"):
        F[rid["pecs"], i] = ss(0.2, 0.55, nz) * ss(shoulder_y + 0.0, shoulder_y - 0.06, y) * ss(chest_y - 0.08, chest_y - 0.0, y)
        F[rid["lats"], i] = ss(0.0, -0.45, nz) * ss(0.04, 0.1, ax) * ss(shoulder_y - 0.02, shoulder_y - 0.1, y)
        F[rid["traps"], i] = ss(0.0, -0.4, nz) * ss(0.13, 0.05, ax) * ss(chest_y - 0.02, chest_y + 0.08, y)
    elif b in ("clavicle", "neck01"):
        F[rid["traps"], i] = ss(0.1, -0.35, nz) * (1.0 if b == "clavicle" else ss(0.02, 0.05, ax))
    if b == "upperarm01":
        t = along(i, bn)
        F[rid["delts"], i] = belly(t, -0.4, 0.42)
        F[rid["biceps"], i] = ss(-0.2, 0.35, nz) * belly(t, 0.2, 1.0)
        F[rid["triceps"], i] = ss(0.15, -0.4, nz) * belly(t, 0.12, 0.95)
    elif b == "lowerarm01":
        t = along(i, bn)
        F[rid["forearms"], i] = belly(t, -0.08, 0.72)
    # shorts: waist band down to mid-thigh
    if not arm:
        hip = head["upperleg01." + S]
        thigh = tail["upperleg01." + S] - hip
        t = float(np.dot(P[i] - hip, thigh) / np.dot(thigh, thigh))
        hem = np.clip((0.4 - t) / 0.05 + 0.5, 0, 1)
        band = np.clip((waist - y) / 0.02 + 0.5, 0, 1)
        C[i] = min(hem, band)

# diffuse over the mesh
import scipy.sparse as sp
rows = np.concatenate([T[:, 0], T[:, 1], T[:, 2], T[:, 1], T[:, 2], T[:, 0]]).astype(np.int64)
cols = np.concatenate([T[:, 1], T[:, 2], T[:, 0], T[:, 0], T[:, 1], T[:, 2]]).astype(np.int64)
A = sp.coo_matrix((np.ones(len(rows)), (rows, cols)), shape=(nv, nv)).tocsr()
A.data[:] = 1
deg = np.asarray(A.sum(axis=1)).ravel()
Dinv = sp.diags(1 / np.maximum(deg, 1))
L = Dinv @ A
for _ in range(6):
    F = 0.5 * F + 0.5 * (L @ F.T).T
for _ in range(3):
    C = 0.5 * C + 0.5 * (L @ C)
for r in range(len(REG)):
    m = F[r].max()
    if m > 0:
        F[r] = np.clip(F[r] / (m * 0.85), 0, 1)
top = np.argsort(-F, axis=0)[:2]
M1 = top[0].astype(np.float32)
M2 = top[1].astype(np.float32)
W1 = F[top[0], np.arange(nv)].astype(np.float32)
W2 = F[top[1], np.arange(nv)].astype(np.float32)
C = C.astype(np.float32)
M = M1
G = W1

# ---------------- glTF ----------------
buf = bytearray()
views, accessors = [], []
def add(arr, target=None, comp=None, typ=None, minmax=False):
    global buf
    while len(buf) % 4:
        buf += b"\0"
    data = arr.tobytes()
    views.append({"buffer": 0, "byteOffset": len(buf), "byteLength": len(data), **({"target": target} if target else {})})
    buf += data
    acc = {"bufferView": len(views) - 1, "componentType": comp, "count": int(arr.shape[0]), "type": typ}
    if minmax:
        acc["min"] = arr.min(axis=0).tolist()
        acc["max"] = arr.max(axis=0).tolist()
    accessors.append(acc)
    return len(accessors) - 1

aP = add(P, 34962, 5126, "VEC3", True)
aN = add(N.astype(np.float32), 34962, 5126, "VEC3")
aJ = add(J, 34962, 5121, "VEC4")
aW = add(WW, 34962, 5126, "VEC4")
aM = add(np.stack([M1, W1, M2, W2], axis=1).astype(np.float32), 34962, 5126, "VEC4")
aC = add(C.reshape(-1, 1), 34962, 5126, "SCALAR")
aI = add(T.reshape(-1), 34963, 5123, "SCALAR")

ibm = np.zeros((len(order), 16), dtype=np.float32)
for i, n in enumerate(order):
    m = np.eye(4, dtype=np.float32)
    m[:3, 3] = -head[n]
    ibm[i] = m.T.reshape(-1)  # column-major
aIBM = add(ibm, None, 5126, "MAT4")

nodes = [{"name": "Athlete", "mesh": 0, "skin": 0}]
bone_node = {}
for n in order:
    bone_node[n] = len(nodes)
    p = parent[n]
    t = head[n] - (head[p] if p else 0)
    d = tail[n] - head[n]
    nodes.append({"name": n.replace(".", "_"), "translation": [float(v) for v in t], "extras": {"dir": [float(v) for v in d]}})
for n in order:
    kids = [bone_node[c] for c in order if parent[c] == n]
    if kids:
        nodes[bone_node[n]]["children"] = kids
scene_nodes = [0, bone_node["root"]]

# eye centres, for small eyeballs added at runtime
eyes = {s: [float(v) for v in V[skel["joints"]["eye." + s + "____head"]].mean(axis=0)] if ("eye." + s + "____head") in skel["joints"] else None for s in "LR"}

gltf = {
    "asset": {"version": "2.0", "generator": "fitness7 build_athlete.py (MakeHuman CC0 assets)", "copyright": "MakeHuman base mesh, targets and rig — CC0 1.0"},
    "scene": 0,
    "scenes": [{"nodes": scene_nodes}],
    "nodes": nodes,
    "meshes": [{"name": "body", "primitives": [{"attributes": {"POSITION": aP, "NORMAL": aN, "JOINTS_0": aJ, "WEIGHTS_0": aW, "_MUSCLE": aM, "_CLOTH": aC}, "indices": aI, "material": 0}]}],
    "materials": [{"name": "skin", "pbrMetallicRoughness": {"baseColorFactor": [0.87, 0.85, 0.82, 1], "metallicFactor": 0, "roughnessFactor": 0.6}}],
    "skins": [{"joints": [bone_node[n] for n in order], "inverseBindMatrices": aIBM, "skeleton": bone_node["root"]}],
    "accessors": accessors,
    "bufferViews": views,
    "buffers": [{"byteLength": len(buf)}],
    "extras": {"regions": REG, "eyes": eyes},
}
js = json.dumps(gltf, separators=(",", ":")).encode()
while len(js) % 4:
    js += b" "
while len(buf) % 4:
    buf += b"\0"
out = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(buf))
out += struct.pack("<II", len(js), 0x4E4F534A) + js + struct.pack("<II", len(buf), 0x004E4942) + bytes(buf)
open(OUT, "wb").write(out)
counts = {r: int((F[i] > 0.3).sum()) for r, i in rid.items()}
print("verts", len(used), "tris", len(T), "bones", len(order), "bytes", len(out))
print("height", P[:, 1].max() - P[:, 1].min(), "min y", P[:, 1].min(), "front z max", P[:, 2].max(), P[:, 2].min())
print(counts, "cloth", int(C.sum()))
print("eyes", eyes)
print(order)
