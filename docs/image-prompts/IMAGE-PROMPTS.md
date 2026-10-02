# Fitness 7 app — image prompts (v2, HD house style)

Every picture slot in the app, with a ready-to-paste prompt and the exact file name to save it as: **2211 images** (165 app & store images in this file + 2046 food photos in [FOOD-PROMPTS.md](FOOD-PROMPTS.md)) and **36 exercise video loops**. Everything is also in `image-prompts.csv` (all) and `food-prompts.csv` (food only) for batch tools.

## The Fitness 7 house style — applies to every image
One look across the whole app, like a world-class fitness brand's campaign. Nothing generic, nothing amateur.

- **People:** professionally cast fitness models with international editorial casting, athletic and defined but natural, well groomed, genuine expressions. Plain premium training kit (black, graphite, bone-white + one muted accent), **no logos**. Never "random gym-goer" snapshots.
- **Place:** a world-class boutique gym — matte black rubber floor, black racks, brushed-steel plates, warm linear LED strips, oak panels, floor-to-ceiling glass. Immaculate, uncluttered, architectural.
- **Light & grade:** deep graphite-navy shadows (#0f1428), true-to-life midtones, warm highlights, one subtle hot-pink rim light (#ff3e6c). Darker edges where white text sits on top.
- **Food:** overhead (or 35° for drinks, burgers and tall desserts) on a seamless matte graphite backdrop (#141826), served only in the Fitness 7 tableware set — matte charcoal stoneware plates and bowls, clear straight glasses, matte charcoal cups, banana leaf for South Indian meals. Food-stylist neat, focus-stacked macro sharpness. **No brands, packaging or logos** — branded foods are shown as the food itself.
- **Store:** white-background packshots with plain unbranded packaging; pastel category tiles.
- **Exercises:** one consistent professional model in a graphite infinity-cove studio with rim lights, so every movement reads clearly.
- **Real people stay real:** trainers and class Moments are shoot briefs with one fixed setup, never AI faces.

## HD standard
| Use | Master size to generate / export | App export |
|---|---|---|
| Portrait heroes, class tiles | 2160×2700 (4:5) · 2160×3240 (2:3) · 2160×3840 (9:16) | WebP q85, ≤ 600 KB |
| Wide heroes, treks | 3840×2160 (16:9) · 2880×2160 (4:3) | WebP q85, ≤ 700 KB |
| Food tiles, thumbnails, packshots | 2048×2048 (1:1) | WebP q85 (packshots PNG), ≤ 400 KB |
| Exercise loops | 1920×1080, 24–30 fps, H.264 | MP4 3–5 MB |

1. **Generate at the tool's highest resolution** (the 2K/4K setting where the tool has one — e.g. Imagen 4 Ultra in Gemini/Flow, Midjourney, Flux Pro Ultra). If a tool tops out lower, upscale 2× with a detail-preserving upscaler (Topaz Gigapixel, Magnific, Krea Enhance) — never a plain resize.
2. **Reject** anything soft, noisy, with warped hands/feet/equipment, melted text-like shapes or plastic skin. Zoom to 100% before accepting.
3. **Keep masters** (full-size JPG/PNG) in `D:\Fitness7gym\design-masters\` and put the exported WebP/JPG at the app path shown. The app's current photos are only ~1000 px wide — the "Live now" section replaces them in place with HD versions: export those 12 as **JPG quality 85 with the exact same file name**, no code change needed.

## How to keep it consistent
1. **Make one "golden" image per family first** (one class tile, one food tile, one packshot, one exercise still). When you're happy, use it as the **style reference** (and keep the same seed where the tool allows) for the rest of that family.
2. **Exercises:** reuse the first exercise image as the **character reference** for all of them so it's the same model throughout.
3. **Food:** do the plates and the "1 — everyday" foods first (169 of them) — they show up most in the calorie tracker. Then "2 — common", then the long tail.
4. **Save to the path shown** inside `D:\Fitness7gym\`. When a folder is filled, tell me and I'll wire it into the screens (food tiles, exercise rows, heroes) — the app keeps working with the current photos until then.


## 0. Live now — HD replacements for the photos the app already shows  ·  12 images

### Live now · class photos (replace in place)

**`mobile/assets/photos/strength.jpg`** — 2160×2700 (4:5)

```
Strength & Conditioning: a male athlete driving up out of a heavy barbell back squat in a power rack, chalked hands, braced core, a coach watching from the side, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/hiit.jpg`** — 2160×2700 (4:5)

```
HIIT Burn: three athletes mid-burpee and mid-kettlebell-swing in a fast circuit, sweat catching the light, motion frozen at the peak, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/crossfit.jpg`** — 2160×2700 (4:5)

```
Functional Training: a female athlete locking out a kettlebell snatch overhead beside a pull-up rig, rowers softly blurred behind, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/cardio.jpg`** — 2160×2700 (4:5)

```
Cardio Floor: a female athlete sprinting on a curved manual treadmill, side view, slight motion blur on the legs, focused face sharp, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/yoga.jpg`** — 2160×2700 (4:5)

```
Yoga & Mobility: a female model holding warrior II on a stone-grey mat in a calm studio with soft dawn window light, long clean lines, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/ladies.jpg`** — 2160×2700 (4:5)

```
Ladies-Only Hours: two female athletes training together — one in a dumbbell row, one in a hip thrust — a female coach guiding with a hand gesture, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/personal.jpg`** — 2160×2700 (4:5)

```
Personal Training: a coach guiding a client through a dumbbell split squat, one-to-one, the coach's hand lightly cueing the client's hip, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/combat.jpg`** — 2160×2700 (4:5)

```
Boxing & Combat Fit: a male boxer throwing a straight right into a heavy bag, hand wraps, sweat spray at impact, a coach holding the bag, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space, subject in the middle third. Keep the bottom third clean and dark for a title. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Live now · gym & hero photos (replace in place)

**`mobile/assets/photos/hero.jpg`** — 2160×3240 (2:3)

```
Wide low-angle shot of a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered at blue hour, empty except for one athlete in silhouette walking towards a lit rack, polished reflections on the floor, cinematic symmetry. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/gym-floor.jpg`** — 2880×2160 (4:3)

```
Architectural wide interior of a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, rows of racks and dumbbells receding in perfect perspective, nobody in frame, warm evening light through the glass. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/gym-weights.jpg`** — 2160×2700 (4:5)

```
Close detail of a perfectly ordered black hex dumbbell rack with brushed-steel handles, shallow depth of field fading into a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, warm rim light on the steel. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/trek.jpg`** — 3840×2160 (16:9)

```
A small group of hikers in premium outdoor shells walking a grassy ridge in the Shevaroy hills (Yercaud, Tamil Nadu) at sunrise, layers of misty blue ridgelines, golden backlight, people small in frame, epic scale. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade with deep blue shadows and warm gold highlights. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 1. Home, login & feed  ·  27 images

### Home · hero carousel

**`mobile/assets/photos/home/hero-bottle.jpg`** — 2160×2700 (4:5)

```
A matte black insulated steel water bottle held at chest height by a male athlete in a black training tee, condensation beads on the steel, the bottle razor-sharp, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered falling into soft bokeh behind. Keep the top third clean and dark for a headline. high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/home/hero-trek.jpg`** — 2160×2700 (4:5)

```
Eight hikers in premium outdoor shells walking up a grassy ridge at sunrise in the Shevaroy hills near Yercaud, seen from behind and slightly below, misty valleys, golden backlight, people small in frame. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/home/hero-pt.jpg`** — 2160×2700 (4:5)

```
A personal coach spotting a female athlete on a dumbbell bench press, both locked in, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, subjects in the lower half. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · discover tiles

**`mobile/assets/photos/discover/yoga.jpg`** — 2160×2880 (3:4)

```
A female model in a seated twist on a stone-grey yoga mat in a minimal studio with soft dawn window light, sage and sand tones, serene. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/treks.jpg`** — 2160×2880 (3:4)

```
A winding trail through coffee estates in the Eastern Ghats of Tamil Nadu, morning mist, two hikers small on the path, lush deep greens. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/ladies.jpg`** — 2160×2880 (3:4)

```
Two female athletes training together — one in a kettlebell goblet squat, the other encouraging — relaxed and strong, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/pt.jpg`** — 2160×2880 (3:4)

```
A coach with a tablet explaining squat form to a young male client beside a rack, mentoring moment, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/weight-loss.jpg`** — 2160×2880 (3:4)

```
A male athlete in his thirties finishing a treadmill run, light sweat, satisfied smile, bright hopeful window light, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/apparel.jpg`** — 2160×2880 (3:4)

```
Precise flat-lay of plain unbranded training tees, joggers and a cap in black, olive and bone-white, folded with knife-sharp edges on light grey concrete, soft top light, fashion-catalogue styling. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/accessories.jpg`** — 2160×2880 (3:4)

```
Precise flat-lay of gym accessories — steel bottle, lifting straps, wrist wraps, speed rope, towel — on dark slate, soft top light, catalogue styling. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/discover/shoes.jpg`** — 2160×2880 (3:4)

```
A pair of plain white-and-grey training shoes with no logos, mid-air as if just kicked up, on a soft teal gradient, floating dust particles, product-campaign lighting. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · store strip

**`mobile/assets/photos/home/store-strip.jpg`** — 3200×800 (4:1)

```
A premium fitness retail counter inside a gym — shelves of plain unlabelled tubs, shakers and bottles, warm spotlights with a soft purple-pink accent, shallow depth of field. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · FIT.EDIT videos (cover until real trainer clips)

**`mobile/assets/photos/fitedit/strength-coach.jpg`** — 2160×2700 (4:5)

```
Portrait of a strength coach in a black tee, chalk on his hands, beside a loaded barbell, eyes to camera with a slight smile, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/fitedit/iron-levels.jpg`** — 2160×2700 (4:5)

```
A female nutrition coach in a soft blush shirt holding a bowl of spinach and pomegranate, clean light studio backdrop, speaking to camera, warm and credible. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/fitedit/ladies-hour.jpg`** — 2160×2700 (4:5)

```
A female athlete in a magenta tank resting between sets on a bench, towel on shoulder, morning light, candid, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · .fit Way article cards

**`mobile/assets/photos/fitway/eat-better.jpg`** — 2880×2160 (4:3)

```
Premium flat vector illustration with subtle grain: a kitchen shelf where chips and cola are swapped for sprouts, fruit, curd and idli with small arrows, warm beige background, bold geometric shapes, crisp vector edges, rendered at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/fitway/sleep.jpg`** — 2880×2160 (4:3)

```
Premium flat vector illustration with subtle grain: a person sleeping peacefully under a crescent moon, a dumbbell resting by the bed, deep navy and lavender palette, minimal, crisp vector edges, rendered at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · recipes

**`mobile/assets/photos/recipes/one-pot-hero.jpg`** — 2880×2160 (4:3)

```
Overhead of a matte stoneware bowl of overnight oats topped with banana, blueberries, almonds and a honey drizzle on a deep teal backdrop, cookbook-cover styling, soft shadows. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/recipes/kappi-tiramisu.jpg`** — 2048×2048 (1:1)

```
Two small glass cups of layered filter-coffee tiramisu with cocoa dusting, a brushed-steel davara-tumbler of filter coffee beside them, warm light on dark walnut. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/recipes/oats-bibimbap.jpg`** — 2048×2048 (1:1)

```
Overhead of a matte charcoal bowl of savoury oats topped with a fried egg, sautéed spinach, carrot ribbons, sesame and chilli threads, bibimbap style, on dark stone. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/recipes/ragi-dosa.jpg`** — 2048×2048 (1:1)

```
Overhead of a thin crisp ragi dosa folded on a matte charcoal plate with coconut and tomato chutneys in small matte bowls, on dark stone. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · quote cards (illustration)

**`mobile/assets/photos/quotes/patience.jpg`** — 2048×2048 (1:1)

```
Cinematic flat vector illustration with subtle grain: a calm old master in a robe watching a young woman hold a deep lunge in a dark gym at night, tall window with a moon, purple and navy palette with warm orange accents, poster composition, crisp vector edges at 4K. Original characters only. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/quotes/trainer.jpg`** — 2048×2048 (1:1)

```
Cinematic flat vector illustration with subtle grain: a towering coach in a dark hooded cloak over a woman doing a kettlebell squat in a gym at night, pale moon in the window, navy and violet palette, playful drama, crisp vector edges at 4K. Original characters only. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/quotes/never-give-up.jpg`** — 2048×2048 (1:1)

```
Cinematic flat vector illustration with subtle grain: a friendly robot coach cheering a man finishing a pull-up in a moody gym, navy and teal palette with a pink glow, crisp vector edges at 4K. Original characters only. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Home · People of Fitness 7 (cover until real members)

**`mobile/assets/photos/people/trekker.jpg`** — 2160×2700 (4:5)

```
A smiling female hiker in a cap and premium shell jacket at a hill viewpoint, arms open, misty green valley behind. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/people/lifter.jpg`** — 2160×2700 (4:5)

```
A male athlete in his late twenties standing proud beside a loaded deadlift bar, chalked hands, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Login / welcome background

**`mobile/assets/photos/welcome.jpg`** — 2160×3840 (9:16)

```
a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered at 5 AM before opening — racks and dumbbells in blue pre-dawn window light, one warm light on, very dark and atmospheric, perfect perspective, empty top two-thirds for text. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 2. Fitness tab  ·  11 images

### Fitness · AT CENTER promo hero

**`mobile/assets/photos/fitness/promo.jpg`** — 2160×2700 (4:5)

```
A glowing orange neon grid tunnel with gold coins flying towards the camera, sci-fi sale-poster look, deep black and orange, centred depth, ultra-sharp 3D render at 4K, empty bottom third for text. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Fitness · Centers near you

**`mobile/assets/photos/fitness/centre-ts-square.jpg`** — 2880×2160 (4:3)

```
Architectural wide interior of a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, rows of racks and machines, nobody in frame, warm evening light, inviting. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  (Best: a professional photo of the real TS Square floor shot to this brief.)
```

**`mobile/assets/photos/fitness/centre-palacode.jpg`** — 2880×2160 (4:3)

```
Reception and glass entrance of a premium boutique gym with a warm yellow accent wall, evening, glowing interior. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  (Best: a professional photo of the real Palacode branch shot to this brief.)
```

### Fitness · Personal training

**`mobile/assets/photos/fitness/pt-hero.jpg`** — 2880×2160 (4:3)

```
A coach and client high-fiving after a set at a cable machine, both laughing, a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Fitness · Transform card

**`mobile/assets/photos/fitness/transform.jpg`** — 2880×2160 (4:3)

```
A yellow tape measure coiled around a red apple and a banana on a bright lime-green background, bold commercial still life, hard light, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Fitness · AT HOME hero

**`mobile/assets/photos/fitness/home-hero.jpg`** — 2160×2700 (4:5)

```
A mother and young daughter in a playful yoga stretch together on a mat in a bright minimal living room, pink and lilac soft light, joyful. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Fitness · F7 pass thumbnails

**`mobile/assets/photos/pass/elite.jpg`** — 2048×2048 (1:1)

```
Abstract 3D render of a glowing pink-and-blue sneaker floating, holographic, dark background, studio-quality render at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/pass/pro.jpg`** — 2048×2048 (1:1)

```
Abstract 3D render of a chrome dumbbell with cyan rim light on a dark background, studio-quality render at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/pass/play.jpg`** — 2048×2048 (1:1)

```
Abstract 3D render of a lavender skipping rope looping in the air, soft glow, dark background, studio-quality render at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/pass/lux.jpg`** — 2048×2048 (1:1)

```
Abstract 3D render of a gold kettlebell on a velvet plinth, warm spotlight, dark background, studio-quality render at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/pass/home.jpg`** — 2048×2048 (1:1)

```
Abstract 3D render of a rolled green yoga mat with a small plant, soft studio light, dark background, studio-quality render at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 3. Classes (class page heroes)  ·  8 images

### Classes · page hero (wide)

**`mobile/assets/photos/classes/strength-wide.jpg`** — 3840×2160 (16:9)

```
Strength & Conditioning: a male athlete driving up out of a heavy barbell back squat in a power rack, chalked hands, braced core, a coach watching from the side, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/hiit-wide.jpg`** — 3840×2160 (16:9)

```
HIIT Burn: three athletes mid-burpee and mid-kettlebell-swing in a fast circuit, sweat catching the light, motion frozen at the peak, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/crossfit-wide.jpg`** — 3840×2160 (16:9)

```
Functional Training: a female athlete locking out a kettlebell snatch overhead beside a pull-up rig, rowers softly blurred behind, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/cardio-wide.jpg`** — 3840×2160 (16:9)

```
Cardio Floor: a female athlete sprinting on a curved manual treadmill, side view, slight motion blur on the legs, focused face sharp, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/yoga-wide.jpg`** — 3840×2160 (16:9)

```
Yoga & Mobility: a female model holding warrior II on a stone-grey mat in a calm studio with soft dawn window light, long clean lines, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/ladies-wide.jpg`** — 3840×2160 (16:9)

```
Ladies-Only Hours: two female athletes training together — one in a dumbbell row, one in a hip thrust — a female coach guiding with a hand gesture, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/personal-wide.jpg`** — 3840×2160 (16:9)

```
Personal Training: a coach guiding a client through a dumbbell split squat, one-to-one, the coach's hand lightly cueing the client's hip, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/classes/combat-wide.jpg`** — 3840×2160 (16:9)

```
Boxing & Combat Fit: a male boxer throwing a straight right into a heavy bag, hand wraps, sweat spray at impact, a coach holding the bag, wide establishing shot, inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics, high-end sportswear campaign look, editorial composition, intentional negative space. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 4. Trainers  ·  2 images

### Trainers · REAL PHOTO (do not generate)

**`mobile/assets/photos/trainers/karthick.jpg`** — 2160×2700 (4:5)

```
SHOOT BRIEF — identical setup for every trainer so the set looks like one campaign: Karthick, Head Trainer. Plain black Fitness 7 tee, seamless charcoal paper backdrop (or the darkest clean wall in the gym), one large softbox 45° camera-left, a thin rim light behind camera-right, camera at chest height, chest-up framing, eyes to camera, relaxed confident half-smile, arms crossed. Shoot on a camera or a recent phone in its main 1× lens at the highest resolution (no Portrait-mode blur), RAW if possible. Retouch lightly (exposure, colour), never reshape faces. Do not use AI for a real trainer's face.
```

**`mobile/assets/photos/trainers/durai.jpg`** — 2160×2700 (4:5)

```
SHOOT BRIEF — identical setup for every trainer so the set looks like one campaign: Durai, Trainer. Plain black Fitness 7 tee, seamless charcoal paper backdrop (or the darkest clean wall in the gym), one large softbox 45° camera-left, a thin rim light behind camera-right, camera at chest height, chest-up framing, eyes to camera, relaxed confident half-smile, arms crossed. Shoot on a camera or a recent phone in its main 1× lens at the highest resolution (no Portrait-mode blur), RAW if possible. Retouch lightly (exposure, colour), never reshape faces. Do not use AI for a real trainer's face.
```


## 5. Treks  ·  5 images

### Treks · tab hero

**`mobile/assets/photos/treks/hero.jpg`** — 2160×2700 (4:5)

```
Sunrise from a rocky summit in the Eastern Ghats — layers of blue hills fading into mist, a lone hiker silhouetted with trekking poles, gold and blue tones, epic scale. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Treks · trek cards (until real photos)

**`mobile/assets/photos/treks/yercaud.jpg`** — 3840×2160 (16:9)

```
Pagoda Point viewpoint in Yercaud at sunrise over coffee estates and the Shevaroy hills, soft golden mist. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/treks/kolli-hills.jpg`** — 3840×2160 (16:9)

```
Agaya Gangai waterfall in the Kolli Hills — tall white falls in a deep green forested gorge, stone steps leading down. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/treks/sitheri.jpg`** — 3840×2160 (16:9)

```
Night camp on a hilltop in the Sitheri hills — tents glowing with warm lanterns, a bonfire, a star-filled Milky Way sky, hikers with head torches. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, astro-landscape grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/treks/kotagiri.jpg`** — 3840×2160 (16:9)

```
Kotagiri ridge walk in the Nilgiris — rolling grassland, shola forest patches and tea gardens in cool blue mist, a line of hikers on the ridge. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing, landscape-campaign grade. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 6. Transform  ·  3 images

### Transform · hero (AT-HOME)

**`mobile/assets/photos/transform/home.jpg`** — 2160×2700 (4:5)

```
A fit man in a green tee eating a salad bowl at a desk while a laptop shows a video call with a female nutrition coach, warm home light, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Transform · hero (AT-CENTRE)

**`mobile/assets/photos/transform/centre.jpg`** — 2160×2700 (4:5)

```
A coach measuring a smiling client's waist with a tape inside a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered, professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Transform · hero (ONLINE PT)

**`mobile/assets/photos/transform/online.jpg`** — 2160×2700 (4:5)

```
A female athlete doing squats in a bright minimal living room while following a coach on a phone propped on a chair, morning light. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions, premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics. Keep the top third clean and dark for a headline. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 7. Exercises (still + 6-second loop for the exercise video screen)  ·  36 images

### Exercises · Back (Dynamic Development)

**`mobile/assets/exercises/lat-pulldown.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Lat Pulldown: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, seated at a lat pulldown machine gripping a wide bar overhead, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: lats, biceps. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Lat Pulldown, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts seated at a lat pulldown machine gripping a wide bar overhead and pulls the bar down to his upper chest, elbows driving down and back, then slowly returns arms straight, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/lat-pulldown.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/seated-row.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Seated Cable Row: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, seated at a cable row with feet on the platform, holding a V-handle, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: upper-back, lats. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Seated Cable Row, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts seated at a cable row with feet on the platform, holding a V-handle and pulls the handle to his stomach squeezing the shoulder blades, then extends the arms forward with a straight back, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/seated-row.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Back (Prime)

**`mobile/assets/exercises/bb-row.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Barbell Bent-over Row: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, hinged forward at the hips holding a barbell below the knees, flat back, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: upper-back, lats, lower-back. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Barbell Bent-over Row, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts hinged forward at the hips holding a barbell below the knees, flat back and rows the bar to his lower ribs, then lowers it under control, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/bb-row.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/db-pullover.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Pullover: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying across a flat bench holding one dumbbell with both hands above the chest, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: lats, chest. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Pullover, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying across a flat bench holding one dumbbell with both hands above the chest and lowers the dumbbell in an arc behind his head, then pulls it back over the chest, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/db-pullover.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Back (Pump)

**`mobile/assets/exercises/face-pull.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Face Pulls: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing at a cable machine holding a rope at face height, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: upper-back, shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Face Pulls, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing at a cable machine holding a rope at face height and pulls the rope to his forehead with elbows high and thumbs back, then returns, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/face-pull.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/superman.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Superman Hold: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying face down on a mat, arms extended forward, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: lower-back, glutes. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Superman Hold, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying face down on a mat, arms extended forward and lifts arms, chest and legs off the mat together, holds, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/superman.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Arms (Dynamic Development)

**`mobile/assets/exercises/bb-curl.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
BB Biceps Curl: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing tall holding a barbell with an underhand grip at the thighs, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: biceps, forearms. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
BB Biceps Curl, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing tall holding a barbell with an underhand grip at the thighs and curls the bar to his shoulders with elbows pinned, then lowers slowly, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/bb-curl.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/db-tricep-ext.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Tricep Extensions: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding one dumbbell overhead with both hands, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: triceps. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Tricep Extensions, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding one dumbbell overhead with both hands and lowers the dumbbell behind his head bending only the elbows, then extends back up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/db-tricep-ext.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Arms (Prime)

**`mobile/assets/exercises/hammer-curl.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Hammer Curl: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing with a dumbbell in each hand, palms facing in, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: biceps, forearms. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Hammer Curl, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing with a dumbbell in each hand, palms facing in and curls both dumbbells up with a neutral grip, then lowers slowly, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/hammer-curl.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/kb-skull.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Lying KB Skull Crusher: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying on a flat bench holding a kettlebell by the horns above the chest, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: triceps. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Lying KB Skull Crusher, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying on a flat bench holding a kettlebell by the horns above the chest and bends the elbows to lower the kettlebell towards his forehead, then presses back up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/kb-skull.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Arms (Pump)

**`mobile/assets/exercises/waiter-hold.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
BP Waiter's Hold: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding a weight plate flat on both palms in front of the chest, elbows at 90 degrees, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: biceps, forearms. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
BP Waiter's Hold, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding a weight plate flat on both palms in front of the chest, elbows at 90 degrees and holds the position steady, breathing, slight tremble, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/waiter-hold.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/sphinx.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Sphinx Pushups: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, in a forearm plank on a mat, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: triceps, chest. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Sphinx Pushups, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts in a forearm plank on a mat and presses up from forearms onto palms into a high plank, then lowers back to forearms, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/sphinx.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Shoulders (Dynamic Development)

**`mobile/assets/exercises/ohp.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Overhead Press: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding a barbell at the front of the shoulders, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: shoulders, triceps. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Overhead Press, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding a barbell at the front of the shoulders and presses the bar straight overhead to lockout, then lowers back to the shoulders, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/ohp.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/lateral-raise.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Lateral Raise: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding light dumbbells at his sides, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Lateral Raise, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding light dumbbells at his sides and raises the arms out to the sides to shoulder height leading with the elbows, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/lateral-raise.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Shoulders (Prime)

**`mobile/assets/exercises/arnold.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Arnold Press: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, seated on a bench holding dumbbells at chin height, palms facing him, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Arnold Press, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts seated on a bench holding dumbbells at chin height, palms facing him and rotates the palms outward while pressing the dumbbells overhead, then reverses, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/arnold.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/rear-delt.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Rear Delt Fly: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, bent forward at the hips holding light dumbbells under the chest, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: shoulders, upper-back. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Rear Delt Fly, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts bent forward at the hips holding light dumbbells under the chest and raises the dumbbells out to the sides squeezing the upper back, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/rear-delt.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Shoulders (Pump)

**`mobile/assets/exercises/front-raise.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Plate Front Raise: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding a weight plate at the thighs with both hands, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Plate Front Raise, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding a weight plate at the thighs with both hands and raises the plate to eye level with straight arms, then lowers slowly, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/front-raise.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/shrug.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Shrugs: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding heavy dumbbells at his sides, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: upper-back. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Shrugs, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding heavy dumbbells at his sides and shrugs the shoulders straight up towards the ears, holds, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/shrug.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Legs (Dynamic Development)

**`mobile/assets/exercises/goblet-squat.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Goblet Squat: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding a dumbbell vertically at the chest, feet shoulder-width, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: quads, glutes. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Goblet Squat, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding a dumbbell vertically at the chest, feet shoulder-width and squats down until the elbows touch inside the knees, then stands up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/goblet-squat.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/rdl.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Romanian Deadlift: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding dumbbells at the thighs, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: hamstrings, glutes, lower-back. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Romanian Deadlift, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding dumbbells at the thighs and pushes the hips back with soft knees sliding the dumbbells down the legs to mid-shin, then drives the hips forward to stand, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/rdl.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Legs (Prime)

**`mobile/assets/exercises/back-squat.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Barbell Back Squat: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing in a squat rack with a barbell across the upper back, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: quads, glutes, hamstrings. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Barbell Back Squat, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing in a squat rack with a barbell across the upper back and squats to below parallel with a braced torso, then drives up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/back-squat.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/walking-lunge.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Walking Lunges: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding dumbbells at his sides, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: quads, glutes. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Walking Lunges, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding dumbbells at his sides and takes a long step forward into a lunge, back knee near the floor, then steps through into the next lunge, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/walking-lunge.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Legs (Pump)

**`mobile/assets/exercises/leg-ext.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Leg Extension: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, seated on a leg extension machine, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: quads. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Leg Extension, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts seated on a leg extension machine and extends both legs straight, pauses at the top, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/leg-ext.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/calf-raise.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Standing Calf Raise: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing on the edge of a step holding a dumbbell, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: calves. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Standing Calf Raise, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing on the edge of a step holding a dumbbell and rises high onto the toes, pauses, then lowers the heels below the step, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/calf-raise.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Chest (Dynamic Development)

**`mobile/assets/exercises/pushup.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Push-ups: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, in a high plank on a mat, hands under shoulders, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: chest, triceps. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Push-ups, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts in a high plank on a mat, hands under shoulders and lowers the chest to the floor with elbows at 45 degrees, then pushes back up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/pushup.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/db-fly.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
DB Chest Fly: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying on a flat bench with dumbbells above the chest, slight elbow bend, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: chest. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
DB Chest Fly, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying on a flat bench with dumbbells above the chest, slight elbow bend and opens the arms wide in an arc until a chest stretch, then hugs them back together, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/db-fly.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Chest (Prime)

**`mobile/assets/exercises/bench.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Barbell Bench Press: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying on a flat bench under a loaded barbell, feet planted, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: chest, triceps, shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Barbell Bench Press, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying on a flat bench under a loaded barbell, feet planted and lowers the bar to the lower chest, then presses it back up to lockout, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/bench.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/incline-db.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Incline DB Press: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, lying on a 30-degree incline bench with dumbbells at the chest, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: chest, shoulders. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Incline DB Press, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts lying on a 30-degree incline bench with dumbbells at the chest and presses the dumbbells up and slightly together, then lowers, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/incline-db.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Chest (Pump)

**`mobile/assets/exercises/cable-cross.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Cable Crossover: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing between two high cable pulleys holding handles, one foot forward, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: chest. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Cable Crossover, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing between two high cable pulleys holding handles, one foot forward and brings the handles down and together in front of the hips, squeezes, then returns, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/cable-cross.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/dips.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Bench Dips: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, with hands on a bench behind him, legs extended forward, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: triceps, chest. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Bench Dips, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts with hands on a bench behind him, legs extended forward and bends the elbows to lower the hips towards the floor, then pushes back up, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/dips.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Core (Dynamic Development)

**`mobile/assets/exercises/plank.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Plank: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, in a forearm plank on a mat, body in a straight line, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: abs, lower-back. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Plank, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts in a forearm plank on a mat, body in a straight line and holds steady, breathing, core braced, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/plank.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/mountain.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Mountain Climbers: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, in a high plank on a mat, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: abs, quads. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Mountain Climbers, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts in a high plank on a mat and drives the knees alternately towards the chest at a fast pace, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/mountain.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Core (Prime)

**`mobile/assets/exercises/kb-swing.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Kettlebell Swing: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing with feet wide, a kettlebell between the feet, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: glutes, hamstrings, abs. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Kettlebell Swing, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing with feet wide, a kettlebell between the feet and hinges, hikes the kettlebell back, then snaps the hips to swing it to chest height, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/kb-swing.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/russian-twist.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Russian Twists: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, seated on a mat leaning back, feet lifted, holding a plate, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: obliques, abs. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Russian Twists, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts seated on a mat leaning back, feet lifted, holding a plate and rotates the torso side to side touching the plate beside each hip, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/russian-twist.mp4 (1920×1080, H.264, about 3–5 MB)
```

### Exercises · Core (Pump)

**`mobile/assets/exercises/burpee.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Burpees: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: quads, chest, abs. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Burpees, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing and drops to a push-up, chest to the floor, jumps the feet in and leaps up with arms overhead, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/burpee.mp4 (1920×1080, H.264, about 3–5 MB)
```

**`mobile/assets/exercises/skip.jpg`** — 3840×2160 (16:9) still + 2048×2048 (1:1) crop for thumbnails

```
Skipping: the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos, standing holding a skipping rope, at the mid-point of the movement with textbook form, in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. Muscles worked: calves. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

Video loop:

```
Skipping, 6-second seamless loop, locked-off camera, the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library. He starts standing holding a skipping rope and skips lightly on the balls of the feet with the rope turning fast, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/skip.mp4 (1920×1080, H.264, about 3–5 MB)
```


## 8. Store  ·  60 images

### Store · section tiles

**`mobile/assets/photos/store/womens-new.jpg`** — 2160×2880 (3:4)

```
A female model in a teal sports bra and navy tights posing on an outdoor court, confident, bright daylight, fashion e-commerce campaign. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/womens-tees.jpg`** — 2160×2880 (3:4)

```
A female model in a plain blush training tee laughing against a soft pink wall, fashion e-commerce campaign. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/footwear-trainers.jpg`** — 2160×2880 (3:4)

```
A plain white training shoe with no logo on a soft aqua cushion, studio product shot. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/footwear-runners.jpg`** — 2160×2880 (3:4)

```
A runner's feet in plain grey running shoes mid-stride on a track, low angle, motion blur on the ground, shoes sharp. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/recovery-chair.jpg`** — 2160×2880 (3:4)

```
A beige leather massage chair in a calm living-room corner, soft lamp light, interior-magazine styling. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/recovery-gun.jpg`** — 2160×2880 (3:4)

```
A plain black massage gun pressed to a calf muscle, close-up, studio light. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/accessories-scale.jpg`** — 2160×2880 (3:4)

```
A black glass smart scale on a dark rubber gym floor, top light. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/accessories-bottle.jpg`** — 2160×2880 (3:4)

```
A sage-green steel bottle and a folded towel on a gym bench, morning light. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/cardio-walkpad.jpg`** — 2160×2880 (3:4)

```
A slim black under-desk walking pad in a bright home office, a female model walking while working at a standing desk. professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/photos/store/cardio-treadmill.jpg`** — 2160×2880 (3:4)

```
A modern black treadmill with no logos in a minimal home gym with a large window. Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Store · Express band

**`mobile/assets/photos/store/express.jpg`** — 3200×1400 (16:7)

```
Premium flat illustration of a delivery van driving over a hill at dusk under stars, purple-pink sky, minimal, crisp vector edges at 4K. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Store · products (nutrition) — also used by Home "What's new" cards

**`mobile/assets/store/p-whey.png`** — 2048×2048 (1:1)

```
a matte black 1 kg protein powder tub with a chocolate-brown band and a scoop of chocolate powder in front. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-whey-vanilla.png`** — 2048×2048 (1:1)

```
a matte black 2 kg protein powder tub with a cream band and a scoop of vanilla powder in front. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-creatine.png`** — 2048×2048 (1:1)

```
a small white supplement tub with a navy band and a scoop of white powder. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-peanut.png`** — 2048×2048 (1:1)

```
a clear jar of crunchy peanut butter with a wooden spoon. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-bar.png`** — 2048×2048 (1:1)

```
a protein bar in a plain dark wrapper with one half unwrapped showing chocolate and almonds. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-electrolyte.png`** — 2048×2048 (1:1)

```
a fan of yellow single-serve sachets next to a glass of lemon drink. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-oats.png`** — 2048×2048 (1:1)

```
a kraft-paper pouch of rolled oats with some oats spilled in front. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-bcaa.png`** — 2048×2048 (1:1)

```
a red supplement tub with a scoop of pink powder. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (bottles) — also used by Home "What's new" cards

**`mobile/assets/store/p-shaker.png`** — 2048×2048 (1:1)

```
a black and lime shaker bottle with a mixing ball visible. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-bottle.png`** — 2048×2048 (1:1)

```
a matte black insulated steel bottle with a carry loop. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-sipper.png`** — 2048×2048 (1:1)

```
a pastel pink 1.5 L gym sipper with a straw lid. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (recovery) — also used by Home "What's new" cards

**`mobile/assets/store/p-massagegun.png`** — 2048×2048 (1:1)

```
a matte black massage gun with four attachment heads beside it. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-roller.png`** — 2048×2048 (1:1)

```
a textured blue foam roller. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-posture.png`** — 2048×2048 (1:1)

```
a black adjustable posture corrector brace laid flat. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-knee.png`** — 2048×2048 (1:1)

```
a pair of black neoprene knee sleeves. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (yoga) — also used by Home "What's new" cards

**`mobile/assets/store/p-mat.png`** — 2048×2048 (1:1)

```
a rose-pink 6 mm yoga mat half rolled. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-block.png`** — 2048×2048 (1:1)

```
two cork yoga blocks stacked. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-strap.png`** — 2048×2048 (1:1)

```
a coiled beige cotton yoga strap with a metal D-ring. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (weights) — also used by Home "What's new" cards

**`mobile/assets/store/p-dumbbell.png`** — 2048×2048 (1:1)

```
a pair of black rubber hex dumbbells. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-kettlebell.png`** — 2048×2048 (1:1)

```
a black cast-iron kettlebell. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-adjdb.png`** — 2048×2048 (1:1)

```
an adjustable dumbbell in its cradle with a selector dial. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-wraps.png`** — 2048×2048 (1:1)

```
a pair of black and lime wrist wraps rolled. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-belt.png`** — 2048×2048 (1:1)

```
a brown leather lifting belt with a steel buckle, rolled. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-gloves.png`** — 2048×2048 (1:1)

```
a pair of black padded lifting gloves. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (cardio) — also used by Home "What's new" cards

**`mobile/assets/store/p-rope.png`** — 2048×2048 (1:1)

```
a black speed skipping rope with aluminium handles, coiled. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-walkpad.png`** — 2048×2048 (1:1)

```
a slim black foldable walking pad treadmill, three-quarter view. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-bands.png`** — 2048×2048 (1:1)

```
five loop resistance bands in graded colours fanned out. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (mens) — also used by Home "What's new" cards

**`mobile/assets/store/p-tee.png`** — 2048×2048 (1:1)

```
a plain black crew-neck training tee, ghost-mannequin style. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-joggers.png`** — 2048×2048 (1:1)

```
plain charcoal tapered joggers, folded. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-shorts.png`** — 2048×2048 (1:1)

```
plain black 7-inch training shorts, flat lay. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-bag.png`** — 2048×2048 (1:1)

```
a black 35 L duffle bag with a shoe compartment. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (womens) — also used by Home "What's new" cards

**`mobile/assets/store/p-bra.png`** — 2048×2048 (1:1)

```
a teal high-support sports bra, ghost-mannequin style. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-tights.png`** — 2048×2048 (1:1)

```
black high-waist women's tights, flat lay. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-tank.png`** — 2048×2048 (1:1)

```
a lavender women's racerback tank, flat lay. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · products (footwear) — also used by Home "What's new" cards

**`mobile/assets/store/p-shoe.png`** — 2048×2048 (1:1)

```
a single white-and-grey cross-training shoe, side view, no logo. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-runner.png`** — 2048×2048 (1:1)

```
a single light blue running shoe, side view, no logo. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

**`mobile/assets/store/p-socks.png`** — 2048×2048 (1:1)

```
three pairs of white ankle socks fanned out. Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.
```

### Store · category tiles

**`mobile/assets/store/cat-womens.png`** — 2160×2700 (4:5)

```
a female fitness model in a pink sports bra and black tights on a solid pastel background colour #f8d7e8, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-mens.png`** — 2160×2700 (4:5)

```
a male fitness model in a plain navy training tee and black shorts on a solid pastel background colour #cfe4ff, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-footwear.png`** — 2160×2700 (4:5)

```
a pair of orange training shoes on a solid pastel background colour #ffe3c9, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-recovery.png`** — 2160×2700 (4:5)

```
a purple massage gun on a solid pastel background colour #e0d8ff, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-cardio.png`** — 2160×2700 (4:5)

```
a green skipping rope and a step platform on a solid pastel background colour #d5f5e3, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-weights.png`** — 2160×2700 (4:5)

```
a black kettlebell and plates on a solid pastel background colour #e9ecf5, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-bottles.png`** — 2160×2700 (4:5)

```
a blue-and-white shaker bottle on a solid pastel background colour #d8f0ff, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-yoga.png`** — 2160×2700 (4:5)

```
a rolled pink yoga mat with a cork block on a solid pastel background colour #ffd9d9, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/cat-nutrition.png`** — 2160×2700 (4:5)

```
a brown protein tub and a shaker on a solid pastel background colour #fff2c9, soft studio light, centred, playful premium e-commerce category tile, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

### Store · hero banners

**`mobile/assets/store/banner-price-drop.png`** — 3840×2160 (16:9)

```
Sale banner artwork (no text): a pink yoga mat, a steel bottle, a blue foam roller and a pair of sneakers arranged on a sunny pastel podium with a big orange arrow shape, background colour #f5e6c8, lots of empty space on the left for a headline, commercial product photography, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/banner-walkpad.png`** — 3840×2160 (16:9)

```
Sale banner artwork (no text): a female model walking on a slim black walking pad in a bright minimal room, light blue palette, background colour #e0eaff, lots of empty space on the left for a headline, commercial product photography, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```

**`mobile/assets/store/banner-whey.png`** — 3840×2160 (16:9)

```
Sale banner artwork (no text): a black protein tub, a shaker and a scoop of chocolate powder on a soft pink podium, background colour #fde4ec, lots of empty space on the left for a headline, commercial product photography, Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing. No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.
```


## 9. Moments & squad  ·  1 image

### Memories / Moments · REAL PHOTOS (do not generate)

**`uploaded per class by the coach`** — 2880×2160 (4:3)

```
SHOOT BRIEF — same setup every time: after each batch, the coach takes one landscape group photo of the class in front of the Fitness 7 logo wall, everyone in frame with a little space above heads, phone held level at chest height with the main 1× lens at full resolution (no zoom, no flash, no filters, no Portrait mode), the gym's main lights on. Take three and keep the sharpest. These become each member's Moments and the squad feed photos.
```


## 10. Food — calorie tracker tiles  ·  2046 images

All 1,900 foods and 146 plates are in **[FOOD-PROMPTS.md](FOOD-PROMPTS.md)** (and `food-prompts.csv`), grouped by category, most-eaten first.
