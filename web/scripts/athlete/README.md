# Athlete model

`public/models/athlete.glb` is generated, not hand-made.

- **Source:** MakeHuman 1.x assets (base mesh, macro and muscle targets, default rig and weights). They were released as **CC0** in Sept 2020; see https://github.com/makehumancommunity/makehuman.
- **Body settings:** young male, muscle 0.82, weight 0.36, plus pectoral, lat, V-shape, abs and limb-muscle boosts.
- **Skeleton:** reduced to 52 bones (spine, neck, head, arms, legs and fingers). Bind frames carry translation only, so the site can pose the figure by limb direction (`src/components/home/athleteRig.ts`).
- **Extra vertex attributes:**
  - `_MUSCLE` holds two soft muscle-region weights per vertex.
  - `_CLOTH` holds the training-shorts mask.

To rebuild:

```
git clone --depth 1 https://github.com/makehumancommunity/makehuman.git /tmp/mh
pip install numpy scipy
python3 web/scripts/athlete/build_athlete.py /tmp/mh/makehuman/data web/public/models/athlete.glb
```
