/**
 * Builds the image-prompt pack for every picture slot in the app.
 *   node web/scripts/image-prompts.js <dir-with-transpiled-shared>
 * Writes docs/image-prompts/IMAGE-PROMPTS.md and image-prompts.csv.
 *
 * v2 — one house style for the whole app: world-class campaign photography,
 * professional models, premium gym, HD masters (2K–4K) everywhere, and
 * brand-free food photos for all 1,900 foods + 146 plates.
 */
const fs = require("fs");
const path = require("path");
const c = require(path.resolve(process.argv[2], "index.js"));
const { genericName } = require("./food-generic");
const outDir = path.resolve(__dirname, "../../docs/image-prompts");
fs.mkdirSync(outDir, { recursive: true });

const rows = []; // {section, file, size, prompt, video?}
const md = [];
const add = (section, file, size, prompt, video) => rows.push({ section, file, size, prompt, video });

/* ------------------------------------------------------------------ */
/* house style — every prompt is built from these blocks              */
/* ------------------------------------------------------------------ */

/** HD master sizes (generate at the tool's highest setting, then export to these) */
const S = {
  "4:5": "2160×2700 (4:5)",
  "3:4": "2160×2880 (3:4)",
  "2:3": "2160×3240 (2:3)",
  "9:16": "2160×3840 (9:16)",
  "1:1": "2048×2048 (1:1)",
  "4:3": "2880×2160 (4:3)",
  "16:9": "3840×2160 (16:9)",
  "4:1": "3200×800 (4:1)",
  "16:7": "3200×1400 (16:7)",
};

const NO = "No text, letters, numbers, logos, watermarks or brand marks anywhere. No extra or missing fingers, no distorted limbs, no warped barbells, plates or cables, no duplicated people.";
const HD = "Ultra-high-definition commercial photograph, shot on a full-frame mirrorless camera with a prime lens, tack-sharp focus on the subject, real skin pores and fabric weave, clean noise-free shadows, crisp micro-detail, no AI artefacts, no plastic skin, no over-smoothing";
const GRADE = "Fitness 7 house grade — deep graphite-navy shadows (#0f1428), true-to-life midtones, warm clean highlights and one subtle hot-pink rim light (#ff3e6c) on the edge of the subject";
const GYM = "a world-class premium boutique gym — matte black rubber floor, black powder-coated racks and brushed-steel plates, warm linear LED strips in a dark ceiling, oak wall panels, floor-to-ceiling glass, architectural, immaculate and uncluttered";
const MODELS = "professionally cast fitness models (international editorial casting with a natural mix of backgrounds), athletic and defined but natural physiques, well groomed, confident, genuine expressions";
const KIT = "premium plain technical training apparel in black, graphite and bone-white with one muted accent colour, no logos or printed graphics";
const CAMPAIGN = "high-end sportswear campaign look, editorial composition, intentional negative space";
const PHOTO = `${HD}. ${GRADE}`;
const DARK_TOP = "Keep the top third clean and dark for a headline";
const DARK_BOTTOM = "Keep the bottom third clean and dark for a title";

/* ------------------------------------------------------------------ */
/* 0. photos the app uses today — replace in place, same file name     */
/* ------------------------------------------------------------------ */

const classScene = {
  strength: "a male athlete driving up out of a heavy barbell back squat in a power rack, chalked hands, braced core, a coach watching from the side",
  hiit: "three athletes mid-burpee and mid-kettlebell-swing in a fast circuit, sweat catching the light, motion frozen at the peak",
  crossfit: "a female athlete locking out a kettlebell snatch overhead beside a pull-up rig, rowers softly blurred behind",
  cardio: "a female athlete sprinting on a curved manual treadmill, side view, slight motion blur on the legs, focused face sharp",
  yoga: "a female model holding warrior II on a stone-grey mat in a calm studio with soft dawn window light, long clean lines",
  ladies: "two female athletes training together — one in a dumbbell row, one in a hip thrust — a female coach guiding with a hand gesture",
  personal: "a coach guiding a client through a dumbbell split squat, one-to-one, the coach's hand lightly cueing the client's hip",
  combat: "a male boxer throwing a straight right into a heavy bag, hand wraps, sweat spray at impact, a coach holding the bag",
};
for (const k of c.classes) {
  add("Live now · class photos (replace in place)", `mobile/assets/photos/${k.id}.jpg`, S["4:5"], `${k.name}: ${classScene[k.id]}, inside ${GYM}, ${MODELS}, ${KIT}, ${CAMPAIGN}, subject in the middle third. ${DARK_BOTTOM}. ${PHOTO}. ${NO}`);
}
add("Live now · gym & hero photos (replace in place)", "mobile/assets/photos/hero.jpg", S["2:3"], `Wide low-angle shot of ${GYM} at blue hour, empty except for one athlete in silhouette walking towards a lit rack, polished reflections on the floor, cinematic symmetry. ${DARK_TOP}. ${PHOTO}. ${NO}`);
add("Live now · gym & hero photos (replace in place)", "mobile/assets/photos/gym-floor.jpg", S["4:3"], `Architectural wide interior of ${GYM}, rows of racks and dumbbells receding in perfect perspective, nobody in frame, warm evening light through the glass. ${PHOTO}. ${NO}`);
add("Live now · gym & hero photos (replace in place)", "mobile/assets/photos/gym-weights.jpg", S["4:5"], `Close detail of a perfectly ordered black hex dumbbell rack with brushed-steel handles, shallow depth of field fading into ${GYM}, warm rim light on the steel. ${PHOTO}. ${NO}`);
add("Live now · gym & hero photos (replace in place)", "mobile/assets/photos/trek.jpg", S["16:9"], `A small group of hikers in premium outdoor shells walking a grassy ridge in the Shevaroy hills (Yercaud, Tamil Nadu) at sunrise, layers of misty blue ridgelines, golden backlight, people small in frame, epic scale. ${HD}, landscape-campaign grade with deep blue shadows and warm gold highlights. ${NO}`);

/* ------------------------------------------------------------------ */
/* 1. hero & feed images                                              */
/* ------------------------------------------------------------------ */

const hand = [
  // Home
  ["Home · hero carousel", "mobile/assets/photos/home/hero-bottle.jpg", S["4:5"], `A matte black insulated steel water bottle held at chest height by a male athlete in a black training tee, condensation beads on the steel, the bottle razor-sharp, ${GYM} falling into soft bokeh behind. ${DARK_TOP}. ${CAMPAIGN}. ${PHOTO}. ${NO}`],
  ["Home · hero carousel", "mobile/assets/photos/home/hero-trek.jpg", S["4:5"], `Eight hikers in premium outdoor shells walking up a grassy ridge at sunrise in the Shevaroy hills near Yercaud, seen from behind and slightly below, misty valleys, golden backlight, people small in frame. ${DARK_TOP}. ${HD}, landscape-campaign grade. ${NO}`],
  ["Home · hero carousel", "mobile/assets/photos/home/hero-pt.jpg", S["4:5"], `A personal coach spotting a female athlete on a dumbbell bench press, both locked in, ${GYM}, ${MODELS}, ${KIT}, subjects in the lower half. ${DARK_TOP}. ${PHOTO}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/yoga.jpg", S["3:4"], `A female model in a seated twist on a stone-grey yoga mat in a minimal studio with soft dawn window light, sage and sand tones, serene. ${MODELS}. ${PHOTO}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/treks.jpg", S["3:4"], `A winding trail through coffee estates in the Eastern Ghats of Tamil Nadu, morning mist, two hikers small on the path, lush deep greens. ${HD}, landscape-campaign grade. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/ladies.jpg", S["3:4"], `Two female athletes training together — one in a kettlebell goblet squat, the other encouraging — relaxed and strong, ${GYM}, ${MODELS}, ${KIT}. ${PHOTO}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/pt.jpg", S["3:4"], `A coach with a tablet explaining squat form to a young male client beside a rack, mentoring moment, ${GYM}, ${MODELS}, ${KIT}. ${PHOTO}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/weight-loss.jpg", S["3:4"], `A male athlete in his thirties finishing a treadmill run, light sweat, satisfied smile, bright hopeful window light, ${GYM}, ${MODELS}, ${KIT}. ${PHOTO}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/apparel.jpg", S["3:4"], `Precise flat-lay of plain unbranded training tees, joggers and a cap in black, olive and bone-white, folded with knife-sharp edges on light grey concrete, soft top light, fashion-catalogue styling. ${HD}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/accessories.jpg", S["3:4"], `Precise flat-lay of gym accessories — steel bottle, lifting straps, wrist wraps, speed rope, towel — on dark slate, soft top light, catalogue styling. ${HD}. ${NO}`],
  ["Home · discover tiles", "mobile/assets/photos/discover/shoes.jpg", S["3:4"], `A pair of plain white-and-grey training shoes with no logos, mid-air as if just kicked up, on a soft teal gradient, floating dust particles, product-campaign lighting. ${HD}. ${NO}`],
  ["Home · store strip", "mobile/assets/photos/home/store-strip.jpg", S["4:1"], `A premium fitness retail counter inside a gym — shelves of plain unlabelled tubs, shakers and bottles, warm spotlights with a soft purple-pink accent, shallow depth of field. ${HD}. ${NO}`],
  ["Home · FIT.EDIT videos (cover until real trainer clips)", "mobile/assets/photos/fitedit/strength-coach.jpg", S["4:5"], `Portrait of a strength coach in a black tee, chalk on his hands, beside a loaded barbell, eyes to camera with a slight smile, ${GYM}, ${MODELS}. ${PHOTO}. ${NO}`],
  ["Home · FIT.EDIT videos (cover until real trainer clips)", "mobile/assets/photos/fitedit/iron-levels.jpg", S["4:5"], `A female nutrition coach in a soft blush shirt holding a bowl of spinach and pomegranate, clean light studio backdrop, speaking to camera, warm and credible. ${MODELS}. ${PHOTO}. ${NO}`],
  ["Home · FIT.EDIT videos (cover until real trainer clips)", "mobile/assets/photos/fitedit/ladies-hour.jpg", S["4:5"], `A female athlete in a magenta tank resting between sets on a bench, towel on shoulder, morning light, candid, ${GYM}, ${MODELS}. ${PHOTO}. ${NO}`],
  ["Home · .fit Way article cards", "mobile/assets/photos/fitway/eat-better.jpg", S["4:3"], `Premium flat vector illustration with subtle grain: a kitchen shelf where chips and cola are swapped for sprouts, fruit, curd and idli with small arrows, warm beige background, bold geometric shapes, crisp vector edges, rendered at 4K. ${NO}`],
  ["Home · .fit Way article cards", "mobile/assets/photos/fitway/sleep.jpg", S["4:3"], `Premium flat vector illustration with subtle grain: a person sleeping peacefully under a crescent moon, a dumbbell resting by the bed, deep navy and lavender palette, minimal, crisp vector edges, rendered at 4K. ${NO}`],
  ["Home · recipes", "mobile/assets/photos/recipes/one-pot-hero.jpg", S["4:3"], `Overhead of a matte stoneware bowl of overnight oats topped with banana, blueberries, almonds and a honey drizzle on a deep teal backdrop, cookbook-cover styling, soft shadows. ${HD}. ${NO}`],
  ["Home · recipes", "mobile/assets/photos/recipes/kappi-tiramisu.jpg", S["1:1"], `Two small glass cups of layered filter-coffee tiramisu with cocoa dusting, a brushed-steel davara-tumbler of filter coffee beside them, warm light on dark walnut. ${HD}. ${NO}`],
  ["Home · recipes", "mobile/assets/photos/recipes/oats-bibimbap.jpg", S["1:1"], `Overhead of a matte charcoal bowl of savoury oats topped with a fried egg, sautéed spinach, carrot ribbons, sesame and chilli threads, bibimbap style, on dark stone. ${HD}. ${NO}`],
  ["Home · recipes", "mobile/assets/photos/recipes/ragi-dosa.jpg", S["1:1"], `Overhead of a thin crisp ragi dosa folded on a matte charcoal plate with coconut and tomato chutneys in small matte bowls, on dark stone. ${HD}. ${NO}`],
  ["Home · quote cards (illustration)", "mobile/assets/photos/quotes/patience.jpg", S["1:1"], `Cinematic flat vector illustration with subtle grain: a calm old master in a robe watching a young woman hold a deep lunge in a dark gym at night, tall window with a moon, purple and navy palette with warm orange accents, poster composition, crisp vector edges at 4K. Original characters only. ${NO}`],
  ["Home · quote cards (illustration)", "mobile/assets/photos/quotes/trainer.jpg", S["1:1"], `Cinematic flat vector illustration with subtle grain: a towering coach in a dark hooded cloak over a woman doing a kettlebell squat in a gym at night, pale moon in the window, navy and violet palette, playful drama, crisp vector edges at 4K. Original characters only. ${NO}`],
  ["Home · quote cards (illustration)", "mobile/assets/photos/quotes/never-give-up.jpg", S["1:1"], `Cinematic flat vector illustration with subtle grain: a friendly robot coach cheering a man finishing a pull-up in a moody gym, navy and teal palette with a pink glow, crisp vector edges at 4K. Original characters only. ${NO}`],
  ["Home · People of Fitness 7 (cover until real members)", "mobile/assets/photos/people/trekker.jpg", S["4:5"], `A smiling female hiker in a cap and premium shell jacket at a hill viewpoint, arms open, misty green valley behind. ${MODELS}. ${HD}, landscape-campaign grade. ${NO}`],
  ["Home · People of Fitness 7 (cover until real members)", "mobile/assets/photos/people/lifter.jpg", S["4:5"], `A male athlete in his late twenties standing proud beside a loaded deadlift bar, chalked hands, ${GYM}, ${MODELS}, ${KIT}. ${PHOTO}. ${NO}`],
  ["Login / welcome background", "mobile/assets/photos/welcome.jpg", S["9:16"], `${GYM} at 5 AM before opening — racks and dumbbells in blue pre-dawn window light, one warm light on, very dark and atmospheric, perfect perspective, empty top two-thirds for text. ${PHOTO}. ${NO}`],

  // Fitness tab
  ["Fitness · AT CENTER promo hero", "mobile/assets/photos/fitness/promo.jpg", S["4:5"], `A glowing orange neon grid tunnel with gold coins flying towards the camera, sci-fi sale-poster look, deep black and orange, centred depth, ultra-sharp 3D render at 4K, empty bottom third for text. ${NO}`],
  ["Fitness · Centers near you", "mobile/assets/photos/fitness/centre-ts-square.jpg", S["4:3"], `Architectural wide interior of ${GYM}, rows of racks and machines, nobody in frame, warm evening light, inviting. ${PHOTO}. ${NO}  (Best: a professional photo of the real TS Square floor shot to this brief.)`],
  ["Fitness · Centers near you", "mobile/assets/photos/fitness/centre-palacode.jpg", S["4:3"], `Reception and glass entrance of a premium boutique gym with a warm yellow accent wall, evening, glowing interior. ${PHOTO}. ${NO}  (Best: a professional photo of the real Palacode branch shot to this brief.)`],
  ["Fitness · Personal training", "mobile/assets/photos/fitness/pt-hero.jpg", S["4:3"], `A coach and client high-fiving after a set at a cable machine, both laughing, ${GYM}, ${MODELS}, ${KIT}. ${PHOTO}. ${NO}`],
  ["Fitness · Transform card", "mobile/assets/photos/fitness/transform.jpg", S["4:3"], `A yellow tape measure coiled around a red apple and a banana on a bright lime-green background, bold commercial still life, hard light, ${HD}. ${NO}`],
  ["Fitness · AT HOME hero", "mobile/assets/photos/fitness/home-hero.jpg", S["4:5"], `A mother and young daughter in a playful yoga stretch together on a mat in a bright minimal living room, pink and lilac soft light, joyful. ${MODELS}. ${PHOTO}. ${NO}`],
  ["Fitness · F7 pass thumbnails", "mobile/assets/photos/pass/elite.jpg", S["1:1"], `Abstract 3D render of a glowing pink-and-blue sneaker floating, holographic, dark background, studio-quality render at 4K. ${NO}`],
  ["Fitness · F7 pass thumbnails", "mobile/assets/photos/pass/pro.jpg", S["1:1"], `Abstract 3D render of a chrome dumbbell with cyan rim light on a dark background, studio-quality render at 4K. ${NO}`],
  ["Fitness · F7 pass thumbnails", "mobile/assets/photos/pass/play.jpg", S["1:1"], `Abstract 3D render of a lavender skipping rope looping in the air, soft glow, dark background, studio-quality render at 4K. ${NO}`],
  ["Fitness · F7 pass thumbnails", "mobile/assets/photos/pass/lux.jpg", S["1:1"], `Abstract 3D render of a gold kettlebell on a velvet plinth, warm spotlight, dark background, studio-quality render at 4K. ${NO}`],
  ["Fitness · F7 pass thumbnails", "mobile/assets/photos/pass/home.jpg", S["1:1"], `Abstract 3D render of a rolled green yoga mat with a small plant, soft studio light, dark background, studio-quality render at 4K. ${NO}`],

  // Treks tab
  ["Treks · tab hero", "mobile/assets/photos/treks/hero.jpg", S["4:5"], `Sunrise from a rocky summit in the Eastern Ghats — layers of blue hills fading into mist, a lone hiker silhouetted with trekking poles, gold and blue tones, epic scale. ${HD}, landscape-campaign grade. ${NO}`],
  ["Treks · trek cards (until real photos)", "mobile/assets/photos/treks/yercaud.jpg", S["16:9"], `Pagoda Point viewpoint in Yercaud at sunrise over coffee estates and the Shevaroy hills, soft golden mist. ${HD}, landscape-campaign grade. ${NO}`],
  ["Treks · trek cards (until real photos)", "mobile/assets/photos/treks/kolli-hills.jpg", S["16:9"], `Agaya Gangai waterfall in the Kolli Hills — tall white falls in a deep green forested gorge, stone steps leading down. ${HD}, landscape-campaign grade. ${NO}`],
  ["Treks · trek cards (until real photos)", "mobile/assets/photos/treks/sitheri.jpg", S["16:9"], `Night camp on a hilltop in the Sitheri hills — tents glowing with warm lanterns, a bonfire, a star-filled Milky Way sky, hikers with head torches. ${HD}, astro-landscape grade. ${NO}`],
  ["Treks · trek cards (until real photos)", "mobile/assets/photos/treks/kotagiri.jpg", S["16:9"], `Kotagiri ridge walk in the Nilgiris — rolling grassland, shola forest patches and tea gardens in cool blue mist, a line of hikers on the ridge. ${HD}, landscape-campaign grade. ${NO}`],

  // Transform tab
  ["Transform · hero (AT-HOME)", "mobile/assets/photos/transform/home.jpg", S["4:5"], `A fit man in a green tee eating a salad bowl at a desk while a laptop shows a video call with a female nutrition coach, warm home light, ${MODELS}. ${DARK_TOP}. ${PHOTO}. ${NO}`],
  ["Transform · hero (AT-CENTRE)", "mobile/assets/photos/transform/centre.jpg", S["4:5"], `A coach measuring a smiling client's waist with a tape inside ${GYM}, ${MODELS}, ${KIT}. ${DARK_TOP}. ${PHOTO}. ${NO}`],
  ["Transform · hero (ONLINE PT)", "mobile/assets/photos/transform/online.jpg", S["4:5"], `A female athlete doing squats in a bright minimal living room while following a coach on a phone propped on a chair, morning light. ${MODELS}, ${KIT}. ${DARK_TOP}. ${PHOTO}. ${NO}`],

  // Store
  ["Store · section tiles", "mobile/assets/photos/store/womens-new.jpg", S["3:4"], `A female model in a teal sports bra and navy tights posing on an outdoor court, confident, bright daylight, fashion e-commerce campaign. ${MODELS}. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/womens-tees.jpg", S["3:4"], `A female model in a plain blush training tee laughing against a soft pink wall, fashion e-commerce campaign. ${MODELS}. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/footwear-trainers.jpg", S["3:4"], `A plain white training shoe with no logo on a soft aqua cushion, studio product shot. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/footwear-runners.jpg", S["3:4"], `A runner's feet in plain grey running shoes mid-stride on a track, low angle, motion blur on the ground, shoes sharp. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/recovery-chair.jpg", S["3:4"], `A beige leather massage chair in a calm living-room corner, soft lamp light, interior-magazine styling. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/recovery-gun.jpg", S["3:4"], `A plain black massage gun pressed to a calf muscle, close-up, studio light. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/accessories-scale.jpg", S["3:4"], `A black glass smart scale on a dark rubber gym floor, top light. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/accessories-bottle.jpg", S["3:4"], `A sage-green steel bottle and a folded towel on a gym bench, morning light. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/cardio-walkpad.jpg", S["3:4"], `A slim black under-desk walking pad in a bright home office, a female model walking while working at a standing desk. ${MODELS}. ${HD}. ${NO}`],
  ["Store · section tiles", "mobile/assets/photos/store/cardio-treadmill.jpg", S["3:4"], `A modern black treadmill with no logos in a minimal home gym with a large window. ${HD}. ${NO}`],
  ["Store · Express band", "mobile/assets/photos/store/express.jpg", S["16:7"], `Premium flat illustration of a delivery van driving over a hill at dusk under stars, purple-pink sky, minimal, crisp vector edges at 4K. ${NO}`],
];
for (const [s, f, z, p] of hand) add(s, f, z, p);

/* ------------------------------------------------------------------ */
/* 2. classes — wide heroes for the class pages                       */
/* ------------------------------------------------------------------ */

for (const k of c.classes) {
  add("Classes · page hero (wide)", `mobile/assets/photos/classes/${k.id}-wide.jpg`, S["16:9"], `${k.name}: ${classScene[k.id]}, wide establishing shot, inside ${GYM}, ${MODELS}, ${KIT}, ${CAMPAIGN}. ${PHOTO}. ${NO}`);
}

/* ------------------------------------------------------------------ */
/* 3. trainers — real people, one standard studio setup               */
/* ------------------------------------------------------------------ */

for (const t of c.trainers) {
  add("Trainers · REAL PHOTO (do not generate)", `mobile/assets/photos/trainers/${t.id}.jpg`, S["4:5"], `SHOOT BRIEF — identical setup for every trainer so the set looks like one campaign: ${t.name}, ${t.role}. Plain black Fitness 7 tee, seamless charcoal paper backdrop (or the darkest clean wall in the gym), one large softbox 45° camera-left, a thin rim light behind camera-right, camera at chest height, chest-up framing, eyes to camera, relaxed confident half-smile, arms crossed. Shoot on a camera or a recent phone in its main 1× lens at the highest resolution (no Portrait-mode blur), RAW if possible. Retouch lightly (exposure, colour), never reshape faces. Do not use AI for a real trainer's face.`);
}

/* ------------------------------------------------------------------ */
/* 4. exercises — still + 6-second loop                               */
/* ------------------------------------------------------------------ */

const MODEL = "the same professional male fitness model in every exercise — late twenties, lean defined athletic build (not a bodybuilder), light-brown skin, short textured black hair with a clean fade, neatly groomed short beard, plain matte black sleeveless performance tee, black 7-inch training shorts, plain white-and-graphite training shoes with no logos";
const STUDIO = "in a seamless graphite infinity-cove studio (#141826) with a soft floor reflection, full body visible, centred with 12% margin, front three-quarter view, large soft key light, two thin cool rim lights outlining the body so every muscle and joint angle reads clearly, the look of a world-class fitness-app exercise library";
const move = {
  "lat-pulldown": ["seated at a lat pulldown machine gripping a wide bar overhead", "pulls the bar down to his upper chest, elbows driving down and back, then slowly returns arms straight"],
  "seated-row": ["seated at a cable row with feet on the platform, holding a V-handle", "pulls the handle to his stomach squeezing the shoulder blades, then extends the arms forward with a straight back"],
  "bb-row": ["hinged forward at the hips holding a barbell below the knees, flat back", "rows the bar to his lower ribs, then lowers it under control"],
  "db-pullover": ["lying across a flat bench holding one dumbbell with both hands above the chest", "lowers the dumbbell in an arc behind his head, then pulls it back over the chest"],
  "face-pull": ["standing at a cable machine holding a rope at face height", "pulls the rope to his forehead with elbows high and thumbs back, then returns"],
  superman: ["lying face down on a mat, arms extended forward", "lifts arms, chest and legs off the mat together, holds, then lowers"],
  "bb-curl": ["standing tall holding a barbell with an underhand grip at the thighs", "curls the bar to his shoulders with elbows pinned, then lowers slowly"],
  "db-tricep-ext": ["standing holding one dumbbell overhead with both hands", "lowers the dumbbell behind his head bending only the elbows, then extends back up"],
  "hammer-curl": ["standing with a dumbbell in each hand, palms facing in", "curls both dumbbells up with a neutral grip, then lowers slowly"],
  "kb-skull": ["lying on a flat bench holding a kettlebell by the horns above the chest", "bends the elbows to lower the kettlebell towards his forehead, then presses back up"],
  "waiter-hold": ["standing holding a weight plate flat on both palms in front of the chest, elbows at 90 degrees", "holds the position steady, breathing, slight tremble"],
  sphinx: ["in a forearm plank on a mat", "presses up from forearms onto palms into a high plank, then lowers back to forearms"],
  ohp: ["standing holding a barbell at the front of the shoulders", "presses the bar straight overhead to lockout, then lowers back to the shoulders"],
  "lateral-raise": ["standing holding light dumbbells at his sides", "raises the arms out to the sides to shoulder height leading with the elbows, then lowers"],
  arnold: ["seated on a bench holding dumbbells at chin height, palms facing him", "rotates the palms outward while pressing the dumbbells overhead, then reverses"],
  "rear-delt": ["bent forward at the hips holding light dumbbells under the chest", "raises the dumbbells out to the sides squeezing the upper back, then lowers"],
  "front-raise": ["standing holding a weight plate at the thighs with both hands", "raises the plate to eye level with straight arms, then lowers slowly"],
  shrug: ["standing holding heavy dumbbells at his sides", "shrugs the shoulders straight up towards the ears, holds, then lowers"],
  "goblet-squat": ["standing holding a dumbbell vertically at the chest, feet shoulder-width", "squats down until the elbows touch inside the knees, then stands up"],
  rdl: ["standing holding dumbbells at the thighs", "pushes the hips back with soft knees sliding the dumbbells down the legs to mid-shin, then drives the hips forward to stand"],
  "back-squat": ["standing in a squat rack with a barbell across the upper back", "squats to below parallel with a braced torso, then drives up"],
  "walking-lunge": ["standing holding dumbbells at his sides", "takes a long step forward into a lunge, back knee near the floor, then steps through into the next lunge"],
  "leg-ext": ["seated on a leg extension machine", "extends both legs straight, pauses at the top, then lowers"],
  "calf-raise": ["standing on the edge of a step holding a dumbbell", "rises high onto the toes, pauses, then lowers the heels below the step"],
  pushup: ["in a high plank on a mat, hands under shoulders", "lowers the chest to the floor with elbows at 45 degrees, then pushes back up"],
  "db-fly": ["lying on a flat bench with dumbbells above the chest, slight elbow bend", "opens the arms wide in an arc until a chest stretch, then hugs them back together"],
  bench: ["lying on a flat bench under a loaded barbell, feet planted", "lowers the bar to the lower chest, then presses it back up to lockout"],
  "incline-db": ["lying on a 30-degree incline bench with dumbbells at the chest", "presses the dumbbells up and slightly together, then lowers"],
  "cable-cross": ["standing between two high cable pulleys holding handles, one foot forward", "brings the handles down and together in front of the hips, squeezes, then returns"],
  dips: ["with hands on a bench behind him, legs extended forward", "bends the elbows to lower the hips towards the floor, then pushes back up"],
  plank: ["in a forearm plank on a mat, body in a straight line", "holds steady, breathing, core braced"],
  mountain: ["in a high plank on a mat", "drives the knees alternately towards the chest at a fast pace"],
  "kb-swing": ["standing with feet wide, a kettlebell between the feet", "hinges, hikes the kettlebell back, then snaps the hips to swing it to chest height"],
  "russian-twist": ["seated on a mat leaning back, feet lifted, holding a plate", "rotates the torso side to side touching the plate beside each hip"],
  burpee: ["standing", "drops to a push-up, chest to the floor, jumps the feet in and leaps up with arms overhead"],
  skip: ["standing holding a skipping rope", "skips lightly on the balls of the feet with the rope turning fast"],
};
for (const w of c.workouts) for (const b of w.blocks) for (const e of b.exercises) {
  const [pose, motion] = move[e.id] ?? ["in the start position", "performs one clean repetition"];
  add(
    `Exercises · ${w.focus} (${b.title})`,
    `mobile/assets/exercises/${e.id}.jpg`,
    `${S["16:9"]} still + 2048×2048 (1:1) crop for thumbnails`,
    `${e.name}: ${MODEL}, ${pose}, at the mid-point of the movement with textbook form, ${STUDIO}. Muscles worked: ${e.muscles.join(", ")}. ${HD}. ${NO}`,
    `${e.name}, 6-second seamless loop, locked-off camera, ${MODEL} ${STUDIO}. He starts ${pose} and ${motion}, two smooth repetitions with perfect technique, steady breathing, ending in the exact start pose so the clip loops. No music, no cuts, no camera movement. ${NO}  Render in 1080p or higher at 24–30 fps, sharp throughout with no flicker or morphing of hands, feet or equipment.  → save as mobile/assets/exercises/${e.id}.mp4 (1920×1080, H.264, about 3–5 MB)`,
  );
}

/* ------------------------------------------------------------------ */
/* 5. food — 1,900 foods + 146 plates, one standard set                */
/* ------------------------------------------------------------------ */

/** the Fitness 7 tableware set — every food photo uses only these */
const SET = {
  plate: "on a matte charcoal stoneware plate with a thin raw-clay rim",
  bowl: "in a matte charcoal stoneware bowl",
  katori: "in a small matte charcoal stoneware bowl",
  dip: "in a small matte charcoal dip bowl",
  glass: "in a clear straight-sided glass",
  cup: "in a matte charcoal ceramic cup on a matching saucer",
  leaf: "on a fresh banana-leaf square laid on a matte charcoal stoneware plate",
  loose: "resting directly on the graphite backdrop",
};
const OVERHEAD = "shot straight overhead (90°)";
const ANGLE = "shot at a 35° three-quarter angle so its height and layers read";
const foodStyle = (angle) => `Premium editorial food photography for a world-class nutrition app, ${angle}. One serving, centred with about 18% empty margin on every side, on a seamless matte graphite backdrop (#141826) with no texture and no props. Large soft diffused key light from the top-left, gentle fill, one soft natural shadow to the bottom-right, crisp micro-detail on every grain, crumb and droplet, true-to-life colour, natural sheen where there is oil or ghee, a wisp of steam only if served hot. Styled by a professional food stylist — neat, generous, appetising, nothing spilled. Shot on a medium-format camera with a 100 mm macro lens at f/8, focus-stacked, tack-sharp edge to edge. No text, labels, logos, branded packaging, hands, cutlery, napkins, extra garnish or props.`;

/** dishes whose look needs spelling out (vessel included where it is part of the dish) */
const look = {
  "filter-coffee": "frothy South Indian filter coffee in a brushed-steel davara-tumbler set",
  tea: "milky masala chai in a small clear glass", "tea-no-sugar": "milky tea in a small clear glass", "black-tea": "clear amber black tea in a glass cup",
  "ragi-mudde": "a smooth brown finger-millet ball with a little sambar beside it",
  puttu: "a cylinder of steamed rice puttu with grated-coconut layers, kadala curry beside it",
  idiyappam: "a nest of string hoppers (idiyappam) with a small bowl of coconut milk",
  adai: "a thick golden lentil adai pancake with jaggery and avial on the side",
  pesarattu: "a green moong-dal crepe with ginger chutney",
  appam: "a lacy bowl-shaped appam with a soft spongy centre",
  paniyaram: "golden round kuzhi paniyaram dumplings",
  "kal-dosa": "two soft thick kal dosas", "neer-dosa": "folded thin white neer dosas",
  kuzhambu: "tangy brown vegetable kuzhambu", "mor-kuzhambu": "yellow buttermilk mor kuzhambu with ash gourd",
  kootu: "thick vegetable and lentil kootu", avial: "white coconut-yoghurt avial with mixed vegetables", poriyal: "a dry vegetable stir-fry with grated coconut",
  sundal: "chickpea sundal tempered with mustard seeds, curry leaves and coconut",
  "kambu-koozh": "pearl-millet koozh with buttermilk in a small clay cup, shallots on the side",
  "ragi-kanji": "smooth brown ragi porridge in a brushed-steel tumbler",
  nannari: "pink nannari sarbath with lime and ice in a tall glass",
  buttermilk: "spiced buttermilk with curry leaves and green chilli in a clear glass",
  "nethili-fry": "crisp red masala-fried anchovies", squid: "golden fried squid rings",
  adhirasam: "dark brown jaggery adhirasam discs", "ellu-urundai": "sesame-jaggery balls",
  "banana-fritter": "golden pazham pori banana fritters", "nei-appam": "glossy dark nei appam",
  "appalam-sweet": "a golden sweet poli (obbattu)", kesari: "orange rava kesari with cashews",
  "sakkarai-pongal": "brown jaggery pongal with ghee and cashews", pongal: "creamy ven pongal with black pepper and cashews",
  "kothu-parotta": "chopped kothu parotta with egg and onions", parotta: "two flaky layered parottas",
  "egg-parotta": "egg-coated parotta", "egg-puff": "a flaky egg puff cut open",
  "veg-puff": "a flaky vegetable puff cut open", "coconut-chutney-podi-plate": "fried idli pieces tossed in podi",
  "roasted-chana": "roasted gram (pottukadalai)", "puffed-rice": "puffed rice (pori)",
  "dosa-batter": "white fermented dosa batter in a matte charcoal bowl",
  podi: "red idli podi with a small pool of sesame oil", water: "a glass of water with condensation",
  whisky: "a whisky glass with ice", beer: "a glass of lager",
  oil: "golden cooking oil in a small matte charcoal dip bowl", sugar: "white sugar in a small matte charcoal bowl",
  "boost-dry": "malted drink powder in a small matte charcoal bowl", "chocos-dry": "chocolate cereal puffs in a bowl, no milk",
  sweet: "three Indian sweets — a laddu, a piece of mysore pak and a barfi",
  "chicken-curry-cut-boiled": "boiled chicken pieces with skin",
  whey: "a mound of chocolate whey powder in a small bowl beside a filled matte black shaker",
  "protein-shake": "a tall glass of chocolate protein shake",
  "protein-bar": "an unwrapped protein bar cut in half",
};

const HOT_DRINK = /\b(coffee|tea|chai|latte|cappuccino|americano|mocha|macchiato|hot chocolate|horlicks|bournvita|kashayam|kanji|soup|rasam)\b/i;
const COLD = /\b(cold|iced|frapp|shake|smoothie|juice|soda|cola|lassi|sarbath|buttermilk|energy|sports drink)\b/i;
const TALL = /\b(cupcake|burger|sandwich|sub sandwich|sub\b|wrap|roll|cone|sundae|shake|smoothie|lassi|falooda|kulfi|cake|pastry|muffin|croissant|frapp|soda|juice|cola|parfait|glass|bottle|tumbler|cup\b)/i;
const RAW = /\b(raw|uncooked|dry\b|\(dry|flour|atta|powder|batter|seeds?)\b/i;

function foodShot(f) {
  const subject = look[f.id] ?? genericName(f);
  let portion = f.portion.label.replace(/\bkatori\b/i, "bowl").replace(/\s*×\s*/g, " ");
  if (/\b(pack|packet|pouch|box|bucket|can|bottle|sachet|tub|carton)\b/i.test(portion)) {
    const amt = portion.match(/\d+(?:\.\d+)?\s*(?:g|ml)\b/i);
    portion = amt ? `about ${amt[0]}` : /half|½/.test(portion) ? "half a single-serve portion" : "a single-serve portion";
  }
  let where = "";
  if (!look[f.id] || !/\b(in|on) (a|an|two)\b|davara|tumbler|beside/.test(subject)) {
    if (/powder/i.test(subject)) where = "as a neat mound of powder in a small matte charcoal stoneware bowl";
    else if (f.category === "drink" || f.unit === "glass") where = HOT_DRINK.test(subject) && !COLD.test(subject) ? SET.cup : SET.glass;
    else if (f.category === "condiment") where = SET.dip;
    else if (f.category === "nuts") where = `${SET.katori} with a few pieces scattered beside it`;
    else if (f.category === "fruit" && f.unit === "piece") where = `${SET.loose}, one whole and one cut open to show the inside`;
    else if (RAW.test(f.name)) where = `raw and uncooked, shown as an ingredient ${SET.katori}`;
    else if (/\b(meals|thali|banana leaf)\b/i.test(f.name)) where = SET.leaf;
    else if (f.unit === "plate" || /\bplate\b/i.test(f.portion.label)) where = `${SET.plate}, any curry, gravy or chutney in small matte charcoal bowls on the plate`;
    else if (f.unit === "katori" || ["dal", "veg", "north"].includes(f.category)) where = SET.katori;
    else if (f.unit === "bowl" || f.unit === "cup") where = SET.bowl;
    else if (/\b(meals|thali|banana leaf)\b/i.test(f.name)) where = SET.leaf;
    else where = SET.plate;
  }
  const brandNote = f.brand ? " Show only the food itself, out of any packaging — no wrapper, box, cup print or brand mark." : "";
  const angle = TALL.test(subject) || f.unit === "glass" || f.category === "drink" ? ANGLE : OVERHEAD;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${cap(subject)} — one serving: ${portion}${where ? `, ${where}` : ""}.${brandNote} ${foodStyle(angle)}`;
}

const CAT_ORDER = ["breakfast", "rice", "bread", "dal", "veg", "north", "nonveg", "egg", "snack", "fastfood", "sweet", "drink", "dairy", "fruit", "nuts", "protein", "condiment"];
const CAT_LABEL = { breakfast: "breakfast & tiffin", rice: "rice & biryani", bread: "breads & flours", dal: "dal & sambar", veg: "veg curries & sides", north: "North Indian", nonveg: "non-veg", egg: "eggs", snack: "snacks", fastfood: "fast food & chains", sweet: "sweets & desserts", drink: "drinks", dairy: "dairy", fruit: "fruit", nuts: "nuts & seeds", protein: "protein & supplements", condiment: "condiments & oils" };
const foods = [...c.FOODS].sort((a, b) => CAT_ORDER.indexOf(a.category) - CAT_ORDER.indexOf(b.category) || (b.pop ?? 0) - (a.pop ?? 0) || a.name.localeCompare(b.name));
for (const f of foods) {
  rows.push({ section: `Food · ${CAT_LABEL[f.category] ?? f.category}`, file: `mobile/assets/food/${f.id}.jpg`, size: S["1:1"], prompt: foodShot(f), priority: (f.pop ?? 0) >= 3 ? "1 — everyday" : (f.pop ?? 0) === 2 ? "2 — common" : "3 — long tail" });
}

const COMBO_LOOK = {
  "rice-sambar-plate": "a full South Indian meals spread — rice in the centre, sambar, rasam, poriyal, kootu, curd, papad and pickle",
  "nonveg-meals": "a non-veg meals spread — rice, chicken curry, rasam, poriyal, curd and papad",
};
for (const k of c.COMBOS) {
  const parts = k.parts.map((i) => c.FOOD_BY_ID[i.id]).filter(Boolean).map((f) => genericName(f).toLowerCase()).join(", ");
  const name = genericName({ name: k.name, brand: true });
  const subj = COMBO_LOOK[k.id] ?? `${name} — ${parts}, plated together as one meal`;
  const thali = /meals|thali|sapadu|saapadu|banana leaf/i.test(`${k.id} ${k.name}`);
  const where = thali ? "on a whole banana leaf laid on a large round matte charcoal plate, every item in its traditional place" : "on a large matte charcoal stoneware plate, curries and sides in small matte charcoal bowls on the plate";
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  rows.push({ section: "Food · plates (combos)", file: `mobile/assets/food/${k.id}.jpg`, size: S["1:1"], prompt: `${cap(subj)}, ${where}. ${foodStyle(OVERHEAD)}`, priority: "1 — everyday" });
}

/* ------------------------------------------------------------------ */
/* 6. store                                                           */
/* ------------------------------------------------------------------ */

const PACK = "Premium e-commerce packshot on a seamless pure white background (#ffffff), product centred with 12% margin, one soft contact shadow underneath, large softbox key light with a gentle rim, accurate material texture (matte plastic, brushed steel, knit fabric, rubber), ultra-sharp edge to edge, high-end product-photography retouch, 1:1, generate at 2048×2048 or higher. Plain unbranded packaging with a clean blank label area (the Fitness 7 logo is added later). No text, no letters, no other brands.";
const prodLook = {
  "whey-1kg": "a matte black 1 kg protein powder tub with a chocolate-brown band and a scoop of chocolate powder in front",
  "whey-2kg": "a matte black 2 kg protein powder tub with a cream band and a scoop of vanilla powder in front",
  creatine: "a small white supplement tub with a navy band and a scoop of white powder",
  "peanut-butter": "a clear jar of crunchy peanut butter with a wooden spoon",
  "protein-bar": "a protein bar in a plain dark wrapper with one half unwrapped showing chocolate and almonds",
  electrolyte: "a fan of yellow single-serve sachets next to a glass of lemon drink",
  oats: "a kraft-paper pouch of rolled oats with some oats spilled in front",
  bcaa: "a red supplement tub with a scoop of pink powder",
  shaker: "a black and lime shaker bottle with a mixing ball visible",
  "steel-bottle": "a matte black insulated steel bottle with a carry loop",
  sipper: "a pastel pink 1.5 L gym sipper with a straw lid",
  "massage-gun": "a matte black massage gun with four attachment heads beside it",
  "foam-roller": "a textured blue foam roller",
  posture: "a black adjustable posture corrector brace laid flat",
  "knee-sleeve": "a pair of black neoprene knee sleeves",
  "yoga-mat": "a rose-pink 6 mm yoga mat half rolled",
  "yoga-block": "two cork yoga blocks stacked",
  "yoga-strap": "a coiled beige cotton yoga strap with a metal D-ring",
  "db-5": "a pair of black rubber hex dumbbells",
  "kettlebell-12": "a black cast-iron kettlebell",
  "adj-db": "an adjustable dumbbell in its cradle with a selector dial",
  "wrist-wraps": "a pair of black and lime wrist wraps rolled",
  "lifting-belt": "a brown leather lifting belt with a steel buckle, rolled",
  "jump-rope": "a black speed skipping rope with aluminium handles, coiled",
  walkpad: "a slim black foldable walking pad treadmill, three-quarter view",
  "resistance-bands": "five loop resistance bands in graded colours fanned out",
  "tee-black": "a plain black crew-neck training tee, ghost-mannequin style",
  joggers: "plain charcoal tapered joggers, folded",
  shorts: "plain black 7-inch training shorts, flat lay",
  "sports-bra": "a teal high-support sports bra, ghost-mannequin style",
  tights: "black high-waist women's tights, flat lay",
  tank: "a lavender women's racerback tank, flat lay",
  "trainer-shoe": "a single white-and-grey cross-training shoe, side view, no logo",
  "runner-shoe": "a single light blue running shoe, side view, no logo",
  socks: "three pairs of white ankle socks fanned out",
  "gym-bag": "a black 35 L duffle bag with a shoe compartment",
  gloves: "a pair of black padded lifting gloves",
};
for (const p of c.products) add(`Store · products (${p.category}) — also used by Home "What's new" cards`, `mobile/assets/store/${p.image}.png`, S["1:1"], `${prodLook[p.id] ?? p.name}. ${PACK}`);
const catLook = {
  womens: "a female fitness model in a pink sports bra and black tights", mens: "a male fitness model in a plain navy training tee and black shorts", footwear: "a pair of orange training shoes",
  recovery: "a purple massage gun", cardio: "a green skipping rope and a step platform", weights: "a black kettlebell and plates",
  bottles: "a blue-and-white shaker bottle", yoga: "a rolled pink yoga mat with a cork block", nutrition: "a brown protein tub and a shaker",
};
for (const k of c.storeCategories) add("Store · category tiles", `mobile/assets/store/${k.image}.png`, S["4:5"], `${catLook[k.id]} on a solid pastel background colour ${k.tint}, soft studio light, centred, playful premium e-commerce category tile, ${HD}. ${NO}`);
for (const b of c.storeBanners) add("Store · hero banners", `mobile/assets/store/${b.image}.png`, S["16:9"], `Sale banner artwork (no text): ${b.id === "price-drop" ? "a pink yoga mat, a steel bottle, a blue foam roller and a pair of sneakers arranged on a sunny pastel podium with a big orange arrow shape" : b.id === "walkpad" ? "a female model walking on a slim black walking pad in a bright minimal room, light blue palette" : "a black protein tub, a shaker and a scoop of chocolate powder on a soft pink podium"}, background colour ${b.tint}, lots of empty space on the left for a headline, commercial product photography, ${HD}. ${NO}`);

/* ------------------------------------------------------------------ */
/* 7. memories — real                                                 */
/* ------------------------------------------------------------------ */

add("Memories / Moments · REAL PHOTOS (do not generate)", "uploaded per class by the coach", S["4:3"], "SHOOT BRIEF — same setup every time: after each batch, the coach takes one landscape group photo of the class in front of the Fitness 7 logo wall, everyone in frame with a little space above heads, phone held level at chest height with the main 1× lens at full resolution (no zoom, no flash, no filters, no Portrait mode), the gym's main lights on. Take three and keep the sharpest. These become each member's Moments and the squad feed photos.");

/* ------------------------------------------------------------------ */
/* write                                                              */
/* ------------------------------------------------------------------ */

const csvEsc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const csv = (list) => ["section,file,size,priority,image_prompt,video_prompt", ...list.map((r) => [r.section, r.file, r.size, r.priority ?? "", r.prompt, r.video].map(csvEsc).join(","))].join("\n");
const isFood = (r) => r.section.startsWith("Food");
const foodRows = rows.filter(isFood);
const otherRows = rows.filter((r) => !isFood(r));
fs.writeFileSync(path.join(outDir, "image-prompts.csv"), csv(rows));
fs.writeFileSync(path.join(outDir, "food-prompts.csv"), csv(foodRows));

const nVideo = rows.filter((r) => r.video).length;
const nEveryday = foodRows.filter((r) => r.priority?.startsWith("1")).length;
md.push(`# Fitness 7 app — image prompts (v2, HD house style)

Every picture slot in the app, with a ready-to-paste prompt and the exact file name to save it as: **${rows.length} images** (${otherRows.length} app & store images in this file + ${foodRows.length} food photos in [FOOD-PROMPTS.md](FOOD-PROMPTS.md)) and **${nVideo} exercise video loops**. Everything is also in \`image-prompts.csv\` (all) and \`food-prompts.csv\` (food only) for batch tools.

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
3. **Keep masters** (full-size JPG/PNG) in \`D:\\Fitness7gym\\design-masters\\\` and put the exported WebP/JPG at the app path shown. The app's current photos are only ~1000 px wide — the "Live now" section replaces them in place with HD versions: export those 12 as **JPG quality 85 with the exact same file name**, no code change needed.

## How to keep it consistent
1. **Make one "golden" image per family first** (one class tile, one food tile, one packshot, one exercise still). When you're happy, use it as the **style reference** (and keep the same seed where the tool allows) for the rest of that family.
2. **Exercises:** reuse the first exercise image as the **character reference** for all of them so it's the same model throughout.
3. **Food:** do the plates and the "1 — everyday" foods first (${nEveryday} of them) — they show up most in the calorie tracker. Then "2 — common", then the long tail.
4. **Save to the path shown** inside \`D:\\Fitness7gym\\\`. When a folder is filled, tell me and I'll wire it into the screens (food tiles, exercise rows, heroes) — the app keeps working with the current photos until then.
`);
const sections = [...new Set(otherRows.map((r) => r.section))];
const groups = [
  ["0. Live now — HD replacements for the photos the app already shows", (s) => s.startsWith("Live now")],
  ["1. Home, login & feed", (s) => s.startsWith("Home") || s.startsWith("Login")],
  ["2. Fitness tab", (s) => s.startsWith("Fitness")],
  ["3. Classes (class page heroes)", (s) => s.startsWith("Classes")],
  ["4. Trainers", (s) => s.startsWith("Trainers")],
  ["5. Treks", (s) => s.startsWith("Treks")],
  ["6. Transform", (s) => s.startsWith("Transform")],
  ["7. Exercises (still + 6-second loop for the exercise video screen)", (s) => s.startsWith("Exercises")],
  ["8. Store", (s) => s.startsWith("Store")],
  ["9. Moments & squad", (s) => s.startsWith("Memories")],
];
for (const [title, test] of groups) {
  const secs = sections.filter(test);
  const n = otherRows.filter((r) => test(r.section)).length;
  md.push(`\n## ${title}  ·  ${n} image${n === 1 ? "" : "s"}\n`);
  for (const s of secs) {
    md.push(`### ${s}\n`);
    for (const r of otherRows.filter((x) => x.section === s)) {
      md.push(`**\`${r.file}\`** — ${r.size}\n\n\`\`\`\n${r.prompt}\n\`\`\`\n`);
      if (r.video) md.push(`Video loop:\n\n\`\`\`\n${r.video}\n\`\`\`\n`);
    }
  }
}
md.push(`\n## 10. Food — calorie tracker tiles  ·  ${foodRows.length} images\n\nAll ${c.FOODS.length.toLocaleString("en-IN")} foods and ${c.COMBOS.length} plates are in **[FOOD-PROMPTS.md](FOOD-PROMPTS.md)** (and \`food-prompts.csv\`), grouped by category, most-eaten first.\n`);
fs.writeFileSync(path.join(outDir, "IMAGE-PROMPTS.md"), md.join("\n"));

/* food file */
const fm = [`# Fitness 7 — food photo prompts (${foodRows.length})

Every food and plate in the calorie tracker, ${c.FOODS.length.toLocaleString("en-IN")} foods + ${c.COMBOS.length} plates. One house style, so the tiles look like one set. Brand names never appear in a prompt — branded foods are described as the food itself.

**Order of work:** plates first, then priority **1 — everyday** (${nEveryday}), **2 — common**, **3 — long tail**. Within each category the list is already sorted most-eaten first.

**Size:** generate at 2048×2048 (or the tool's highest 1:1 setting), export WebP q85 ≤ 400 KB to the path shown.

**Golden tile:** make \`idli.jpg\` first. Once it looks right, use it as the style reference (same seed where possible) for every other food.
`];
const fsecs = [...new Set(foodRows.map((r) => r.section))].sort((a, b) => (a.includes("plates") ? -1 : b.includes("plates") ? 1 : 0));
for (const s of fsecs) {
  const list = foodRows.filter((r) => r.section === s);
  fm.push(`\n## ${s.replace("Food · ", "")}  ·  ${list.length}\n`);
  for (const r of list) fm.push(`**\`${r.file}\`** · priority ${r.priority}\n\n\`\`\`\n${r.prompt}\n\`\`\`\n`);
}
fs.writeFileSync(path.join(outDir, "FOOD-PROMPTS.md"), fm.join("\n"));

const by = {};
rows.forEach((r) => { const g = isFood(r) ? "10. Food" : groups.find(([, t]) => t(r.section))?.[0] ?? "?"; by[g] = (by[g] ?? 0) + 1; });
console.log(rows.length, by);
