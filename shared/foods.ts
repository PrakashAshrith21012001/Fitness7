/**
 * Indian food table for the Food screen — South-Indian first.
 *
 * Every row: energy and macros PER 100 g (or 100 ml for drinks) plus one
 * common portion in grams. Values follow the ICMR-NIN Indian Food Composition
 * Tables (IFCT 2017) for raw and simple foods; cooked dishes vary by kitchen,
 * so those are recipe-standardised estimates and carry `estimate: true`. The
 * UI shows the source and a confidence for every number, never a bare fact.
 *
 * `matchFood` / `parseLocal` turn "2 idli sambar oru coffee" into items with
 * grams and kcal without calling any model. Only what they cannot match goes
 * to Claude (web/src/app/api/food/parse).
 */

export type FoodCategory =
  | "breakfast"
  | "rice"
  | "bread"
  | "dal"
  | "veg"
  | "nonveg"
  | "egg"
  | "snack"
  | "sweet"
  | "drink"
  | "fruit"
  | "dairy"
  | "protein"
  | "nuts"
  | "fastfood"
  | "north"
  | "condiment";

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  /** per 100 g (100 ml for drinks) */
  per100: { kcal: number; protein: number; carbs: number; fat: number };
  /** one common portion */
  portion: { label: string; grams: number };
  aliases: string[];
  /** true = recipe-standardised estimate, not an IFCT raw-food value */
  estimate?: boolean;
  /** how a bare count is read: "2 idli" → 2 × portion.grams (piece) vs "2 rice" → 2 × portion (serving) */
  unit?: "piece" | "cup" | "katori" | "glass" | "plate" | "bowl" | "serving";
};

// id, name, category, kcal, protein, carbs, fat, portion label, portion g, aliases, estimate, unit
type Row = [string, string, FoodCategory, number, number, number, number, string, number, string[], boolean?, Food["unit"]?];

const R: Row[] = [
  /* ---------------- breakfast / tiffin ---------------- */
  ["idli", "Idli", "breakfast", 132, 3.9, 27.9, 0.4, "1 idli", 40, ["idly", "idlis", "idlies", "idlee", "rava idli"], false, "piece"],
  ["mini-idli", "Mini idli", "breakfast", 132, 3.9, 27.9, 0.4, "1 mini idli", 12, ["mini idly", "small idli", "button idli", "14 idli", "kutty idli"], true, "piece"],
  ["dosa", "Dosa", "breakfast", 168, 3.9, 27.5, 4.9, "1 dosa", 80, ["dosai", "dosas", "plain dosa", "sada dosa", "thosai", "roast dosa", "paper roast"], true, "piece"],
  ["masala-dosa", "Masala dosa", "breakfast", 170, 3.8, 26.3, 5.6, "1 masala dosa", 160, ["masal dosa", "masala dosai", "mysore masala dosa"], true, "piece"],
  ["set-dosa", "Set dosa", "breakfast", 160, 4.2, 28.0, 3.4, "1 set dosa", 60, ["set dosai", "sponge dosa", "set dose"], true, "piece"],
  ["ghee-roast", "Ghee roast dosa", "breakfast", 205, 3.8, 27.0, 9.2, "1 ghee roast", 90, ["ghee dosa", "nei dosai", "ghee roast"], true, "piece"],
  ["rava-dosa", "Rava dosa", "breakfast", 195, 3.5, 29.0, 7.0, "1 rava dosa", 90, ["rava dosai", "sooji dosa", "onion rava dosa"], true, "piece"],
  ["egg-dosa", "Egg dosa", "breakfast", 185, 8.0, 22.0, 7.2, "1 egg dosa", 130, ["muttai dosai", "mutta dosa", "egg dosai"], true, "piece"],
  ["uthappam", "Uthappam", "breakfast", 158, 4.4, 26.0, 4.0, "1 uthappam", 120, ["uttapam", "uthapam", "onion uthappam", "oothappam", "tomato uthappam"], true, "piece"],
  ["pesarattu", "Pesarattu", "breakfast", 150, 7.5, 22.0, 3.5, "1 pesarattu", 90, ["moong dosa", "green gram dosa", "pesarat"], true, "piece"],
  ["adai", "Adai", "breakfast", 178, 7.8, 26.0, 4.8, "1 adai", 90, ["adai dosai", "adai dosa", "lentil dosa"], true, "piece"],
  ["appam", "Appam", "breakfast", 120, 2.6, 24.0, 1.2, "1 appam", 60, ["aappam", "hoppers", "palappam", "appams"], true, "piece"],
  ["idiyappam", "Idiyappam", "breakfast", 110, 2.0, 25.0, 0.3, "1 idiyappam", 50, ["string hoppers", "sevai", "idiappam", "nool puttu", "santhagai"], true, "piece"],
  ["puttu", "Puttu", "breakfast", 160, 3.0, 33.0, 1.5, "1 puttu", 120, ["pittu", "rice puttu", "wheat puttu"], true, "piece"],
  ["pongal", "Ven pongal", "breakfast", 140, 4.0, 22.0, 4.2, "1 cup pongal", 200, ["ven pongal", "khara pongal", "ghee pongal", "pongal rice", "kara pongal"], true, "cup"],
  ["sakkarai-pongal", "Sakkarai pongal", "sweet", 210, 3.0, 40.0, 4.5, "1 cup", 150, ["sweet pongal", "chakkara pongal", "sarkarai pongal"], true, "cup"],
  ["upma", "Rava upma", "breakfast", 125, 3.0, 20.0, 3.8, "1 cup upma", 180, ["uppuma", "rava uppuma", "sooji upma", "semolina upma", "uppumavu", "upma rava"], true, "cup"],
  ["kichadi", "Rava kichadi", "breakfast", 130, 2.8, 20.0, 4.5, "1 cup kichadi", 180, ["khichdi rava", "rava khichdi", "kichdi", "kitchadi"], true, "cup"],
  ["semiya-upma", "Semiya upma", "breakfast", 135, 3.2, 22.0, 3.8, "1 cup", 180, ["vermicelli upma", "semiya", "seviyan upma"], true, "cup"],
  ["poha", "Poha", "breakfast", 130, 2.5, 24.0, 2.8, "1 cup poha", 150, ["aval upma", "aval", "kanda poha", "flattened rice upma", "avalakki"], true, "cup"],
  ["poori", "Poori", "bread", 315, 6.5, 40.0, 14.5, "1 poori", 35, ["puri", "pooris", "puris", "poori masala"], true, "piece"],
  ["poori-masala", "Poori masala (potato)", "veg", 95, 2.0, 14.0, 3.5, "1 katori", 120, ["potato masala", "aloo masala", "urulai masala", "masala for poori", "poori kizhangu"], true, "katori"],
  ["chapati", "Chapati", "bread", 240, 7.5, 46.0, 2.8, "1 chapati", 40, ["chapathi", "roti", "chappathi", "phulka", "chapatis", "rotis", "chapatti", "wheat roti", "sapathi"], false, "piece"],
  ["chapati-ghee", "Chapati with ghee", "bread", 290, 7.3, 45.0, 8.5, "1 chapati", 42, ["ghee roti", "ghee chapati", "nei chapathi"], true, "piece"],
  ["parotta", "Parotta", "bread", 330, 7.0, 45.0, 13.5, "1 parotta", 90, ["porotta", "barotta", "paratha kerala", "parota", "parottas", "bun parotta", "coin parotta"], true, "piece"],
  ["kothu-parotta", "Kothu parotta", "bread", 210, 7.5, 24.0, 9.5, "1 plate", 300, ["kothu", "kothu porotta", "kothu barotta", "chicken kothu parotta", "veg kothu"], true, "plate"],
  ["kal-dosa", "Kal dosa", "breakfast", 150, 4.0, 28.0, 2.3, "1 kal dosa", 70, ["kal dosai", "kallu dosa", "thick dosa"], true, "piece"],
  ["neer-dosa", "Neer dosa", "breakfast", 120, 2.2, 25.0, 1.0, "1 neer dosa", 45, ["neer dosai"], true, "piece"],
  ["aloo-paratha", "Aloo paratha", "north", 240, 5.5, 34.0, 9.0, "1 paratha", 120, ["alu paratha", "potato paratha", "stuffed paratha"], true, "piece"],
  ["paratha", "Plain paratha", "north", 300, 6.5, 40.0, 12.5, "1 paratha", 70, ["lachha paratha", "wheat paratha", "tawa paratha", "parantha"], true, "piece"],
  ["bread", "Bread (white)", "bread", 265, 8.0, 50.0, 3.0, "1 slice", 25, ["white bread", "bread slice", "bread slices", "slice bread", "toast"], false, "piece"],
  ["brown-bread", "Bread (brown / wheat)", "bread", 250, 9.0, 45.0, 3.5, "1 slice", 25, ["wheat bread", "whole wheat bread", "brown bread slice", "multigrain bread"], false, "piece"],
  ["bread-omelette", "Bread omelette", "egg", 215, 9.5, 24.0, 9.0, "1 bread omelette", 150, ["omelette bread", "bread omlet", "bread omelet"], true, "piece"],
  ["oats", "Oats (cooked with milk)", "breakfast", 95, 3.8, 14.0, 2.6, "1 bowl", 250, ["oatmeal", "oats porridge", "masala oats", "oats kanji", "oats with milk"], true, "bowl"],
  ["cornflakes", "Cornflakes with milk", "breakfast", 100, 3.5, 17.0, 2.0, "1 bowl", 200, ["corn flakes", "cereal", "chocos", "muesli with milk"], true, "bowl"],
  ["ragi-kanji", "Ragi kanji", "drink", 60, 1.5, 12.0, 0.6, "1 glass", 250, ["ragi porridge", "ragi koozh", "kezhvaragu kanji", "ragi malt", "keppai koozh", "koozh"], true, "glass"],
  ["ragi-dosa", "Ragi dosa", "breakfast", 150, 4.5, 26.0, 3.2, "1 ragi dosa", 80, ["ragi dosai", "kezhvaragu dosai", "finger millet dosa"], true, "piece"],
  ["ragi-mudde", "Ragi mudde", "rice", 118, 2.4, 25.5, 0.6, "1 ball", 150, ["ragi ball", "ragi kali", "kali", "mudde"], true, "piece"],
  ["kambu-koozh", "Kambu koozh", "drink", 55, 1.8, 10.5, 0.7, "1 glass", 250, ["bajra porridge", "kambu kanji", "pearl millet porridge"], true, "glass"],
  ["sevai", "Rice sevai (lemon)", "breakfast", 150, 2.8, 30.0, 2.5, "1 cup", 150, ["lemon sevai", "sevai upma", "rice noodles", "coconut sevai"], true, "cup"],

  /* ---------------- rice ---------------- */
  ["rice", "White rice (cooked)", "rice", 130, 2.7, 28.0, 0.3, "1 cup", 150, ["cooked rice", "plain rice", "sadam", "saadam", "boiled rice", "steamed rice", "white rice", "rice bowl", "annam", "choru", "sapadu rice"], false, "cup"],
  ["brown-rice", "Brown rice (cooked)", "rice", 123, 2.7, 25.6, 1.0, "1 cup", 150, ["red rice", "hand pounded rice", "kerala matta rice", "matta rice", "sivappu arisi"], false, "cup"],
  ["curd-rice", "Curd rice", "rice", 115, 3.5, 17.0, 3.5, "1 cup", 200, ["thayir sadam", "thair sadam", "yogurt rice", "curd rice bowl", "bagala bath", "daddojanam", "thayir saadam", "curd sadam"], true, "cup"],
  ["sambar-rice", "Sambar rice", "rice", 120, 3.8, 20.0, 2.5, "1 cup", 250, ["sambar sadam", "sambhar rice", "sambar saadam", "bisi bele bath", "bisibelebath"], true, "cup"],
  ["rasam-rice", "Rasam rice", "rice", 105, 2.6, 21.0, 1.0, "1 cup", 220, ["rasam sadam", "rasam saadam"], true, "cup"],
  ["lemon-rice", "Lemon rice", "rice", 160, 3.0, 27.0, 4.5, "1 cup", 180, ["elumichai sadam", "chitranna", "lemon sadam", "elumichai saadam"], true, "cup"],
  ["tamarind-rice", "Tamarind rice", "rice", 170, 3.2, 28.0, 5.0, "1 cup", 180, ["puliyodharai", "puliyogare", "puli sadam", "pulihora", "puliodarai", "puliyotharai"], true, "cup"],
  ["coconut-rice", "Coconut rice", "rice", 175, 3.0, 26.0, 6.5, "1 cup", 180, ["thengai sadam", "thengai saadam"], true, "cup"],
  ["tomato-rice", "Tomato rice", "rice", 150, 3.0, 25.0, 4.2, "1 cup", 180, ["thakkali sadam", "tomato bath", "thakkali saadam"], true, "cup"],
  ["vegetable-pulao", "Vegetable pulao", "rice", 150, 3.5, 24.0, 4.5, "1 cup", 180, ["veg pulao", "pulav", "pulao", "veg pulav", "peas pulao"], true, "cup"],
  ["jeera-rice", "Jeera rice", "rice", 155, 2.8, 27.0, 4.0, "1 cup", 180, ["cumin rice", "jeera pulao", "ghee rice", "nei sadam"], true, "cup"],
  ["fried-rice", "Vegetable fried rice", "fastfood", 165, 3.5, 26.0, 5.5, "1 plate", 300, ["veg fried rice", "fried rice"], true, "plate"],
  ["egg-fried-rice", "Egg fried rice", "fastfood", 175, 6.0, 25.0, 6.0, "1 plate", 300, ["muttai fried rice", "egg rice"], true, "plate"],
  ["chicken-fried-rice", "Chicken fried rice", "fastfood", 185, 9.0, 24.0, 6.0, "1 plate", 300, ["chicken rice", "chic fried rice"], true, "plate"],
  ["veg-biryani", "Vegetable biryani", "rice", 160, 3.8, 24.0, 5.5, "1 plate", 300, ["veg biryani", "veg biriyani", "vegetable biriyani", "veg dum biryani"], true, "plate"],
  ["chicken-biryani", "Chicken biryani", "nonveg", 175, 9.5, 21.0, 6.0, "1 plate", 350, ["chicken biriyani", "biryani", "biriyani", "briyani", "chicken dum biryani", "kozhi biryani", "ambur biryani", "dindigul biryani", "thalappakatti biryani", "hyderabadi biryani"], true, "plate"],
  ["mutton-biryani", "Mutton biryani", "nonveg", 195, 10.5, 21.0, 7.5, "1 plate", 350, ["mutton biriyani", "goat biryani", "aatu biryani", "aattu biryani"], true, "plate"],
  ["egg-biryani", "Egg biryani", "nonveg", 165, 6.5, 22.0, 5.5, "1 plate", 300, ["muttai biryani", "egg biriyani", "anda biryani"], true, "plate"],
  ["prawn-biryani", "Prawn biryani", "nonveg", 165, 9.0, 22.0, 5.0, "1 plate", 300, ["eral biryani", "shrimp biryani"], true, "plate"],
  ["fish-biryani", "Fish biryani", "nonveg", 170, 9.5, 21.0, 5.5, "1 plate", 300, ["meen biryani"], true, "plate"],
  ["khichdi", "Moong dal khichdi", "rice", 120, 4.5, 20.0, 2.5, "1 cup", 200, ["khichadi", "kichdi", "dal khichdi", "kichadi dal"], true, "cup"],
  ["millet-rice", "Millet (cooked)", "rice", 120, 3.5, 24.0, 1.2, "1 cup", 150, ["samai", "thinai", "varagu", "kuthiraivali", "little millet", "foxtail millet", "kodo millet", "millet sadam", "siruthaniyam"], true, "cup"],
  ["quinoa", "Quinoa (cooked)", "rice", 120, 4.4, 21.3, 1.9, "1 cup", 150, ["quinoa bowl"], false, "cup"],

  /* ---------------- dal / gravies ---------------- */
  ["sambar", "Sambar", "dal", 65, 3.0, 9.5, 1.6, "1 katori", 150, ["sambhar", "sambaar", "sambar katori", "sambar bowl", "saambar", "vegetable sambar", "tiffin sambar", "sambar for idli", "sambar katori"], true, "katori"],
  ["rasam", "Rasam", "dal", 25, 1.0, 4.0, 0.6, "1 katori", 150, ["rasam soup", "tomato rasam", "pepper rasam", "milagu rasam", "paruppu rasam", "garlic rasam", "poondu rasam", "lemon rasam"], true, "katori"],
  ["dal", "Dal (toor, cooked)", "dal", 95, 5.5, 14.0, 2.0, "1 katori", 150, ["dal", "paruppu", "dal tadka", "dal fry", "toor dal", "arhar dal", "thuvaram paruppu", "yellow dal", "dhal", "dal curry", "parippu"], true, "katori"],
  ["moong-dal", "Moong dal (cooked)", "dal", 90, 6.0, 13.5, 1.5, "1 katori", 150, ["pasi paruppu", "green gram dal", "moong", "yellow moong", "payatham paruppu"], true, "katori"],
  ["masoor-dal", "Masoor dal (cooked)", "dal", 95, 6.2, 14.5, 1.6, "1 katori", 150, ["red lentil dal", "mysore paruppu", "masoor"], true, "katori"],
  ["chana-dal", "Chana dal (cooked)", "dal", 120, 6.5, 17.0, 2.8, "1 katori", 150, ["kadalai paruppu", "bengal gram dal"], true, "katori"],
  ["dal-makhani", "Dal makhani", "north", 140, 6.0, 15.0, 6.5, "1 katori", 150, ["dal makhni", "makhani dal"], true, "katori"],
  ["kuzhambu", "Kuzhambu (vegetable)", "dal", 70, 2.0, 8.0, 3.5, "1 katori", 150, ["kulambu", "kuzambu", "vatha kuzhambu", "vathal kuzhambu", "puli kuzhambu", "kara kuzhambu", "kathirikai kuzhambu", "brinjal kuzhambu", "tamarind gravy"], true, "katori"],
  ["mor-kuzhambu", "Mor kuzhambu", "dal", 60, 2.5, 5.0, 3.2, "1 katori", 150, ["more kulambu", "mor kulambu", "buttermilk kuzhambu", "majjige huli", "kadhi"], true, "katori"],
  ["kootu", "Kootu (vegetable with dal)", "veg", 75, 3.5, 9.0, 2.8, "1 katori", 150, ["kutu", "keerai kootu", "poosanikai kootu", "chow chow kootu", "kootu curry"], true, "katori"],
  ["keerai", "Keerai (spinach) poriyal", "veg", 55, 3.0, 5.0, 2.8, "1 katori", 100, ["keerai", "keerai poriyal", "spinach", "palak", "keerai masiyal", "ponnanganni", "murungai keerai", "greens", "keerai kadaiyal", "palak sabzi"], true, "katori"],
  ["poriyal", "Poriyal (vegetable stir-fry)", "veg", 85, 2.5, 9.0, 4.5, "1 katori", 100, ["poriyal", "poriyal veg", "beans poriyal", "carrot poriyal", "cabbage poriyal", "beetroot poriyal", "kovakkai poriyal", "vegetable fry", "curry veg", "thoran", "palya", "vazhakkai poriyal", "sabzi", "sabji", "dry vegetable"], true, "katori"],
  ["avial", "Avial", "veg", 90, 2.2, 8.0, 5.5, "1 katori", 150, ["aviyal", "avial curry"], true, "katori"],
  ["potato-fry", "Potato fry", "veg", 150, 2.2, 20.0, 7.0, "1 katori", 100, ["urulai fry", "urulaikizhangu fry", "aloo fry", "potato roast", "urulai varuval", "potato poriyal", "aloo sabzi"], true, "katori"],
  ["sundal", "Sundal (chickpea)", "snack", 140, 7.0, 20.0, 3.5, "1 cup", 100, ["kondakadalai sundal", "chana sundal", "pattani sundal", "channa sundal"], true, "cup"],
  ["chole", "Chole (chana masala)", "north", 145, 6.5, 19.0, 5.0, "1 katori", 150, ["chana masala", "channa masala", "chickpea curry", "chole masala", "kondakadalai kuzhambu"], true, "katori"],
  ["rajma", "Rajma", "north", 130, 6.5, 19.0, 3.5, "1 katori", 150, ["rajma masala", "kidney bean curry", "rajma chawal"], true, "katori"],
  ["paneer-butter-masala", "Paneer butter masala", "north", 210, 8.5, 9.0, 16.0, "1 katori", 150, ["paneer masala", "butter paneer", "paneer gravy", "shahi paneer", "paneer tikka masala", "kadai paneer", "paneer curry"], true, "katori"],
  ["palak-paneer", "Palak paneer", "north", 150, 8.0, 6.0, 10.5, "1 katori", 150, ["saag paneer", "spinach paneer"], true, "katori"],
  ["paneer", "Paneer (plain)", "dairy", 265, 18.3, 1.2, 20.8, "1 katori cubes", 100, ["cottage cheese", "paneer cubes", "raw paneer", "paneer pieces", "paneer bhurji"], false, "katori"],
  ["veg-kurma", "Vegetable kurma", "veg", 110, 3.0, 10.0, 6.5, "1 katori", 150, ["kurma", "korma", "veg korma", "kuruma", "vegetable korma", "chapati kurma", "kuruma for parotta", "salna", "vegetable salna", "chicken salna"], true, "katori"],
  ["channa-kurma", "Channa kurma", "veg", 130, 6.0, 15.0, 5.5, "1 katori", 150, ["chana kurma", "kondakadalai kurma", "white channa gravy"], true, "katori"],
  ["mushroom-masala", "Mushroom masala", "veg", 90, 3.5, 7.0, 5.5, "1 katori", 150, ["mushroom gravy", "mushroom curry", "kalan masala", "mushroom fry"], true, "katori"],
  ["bhindi", "Bhindi (okra) fry", "veg", 110, 2.2, 8.5, 7.5, "1 katori", 100, ["vendakkai poriyal", "vendakkai fry", "okra", "ladies finger fry", "bhindi masala", "vendakkai"], true, "katori"],
  ["brinjal-curry", "Brinjal curry", "veg", 95, 1.8, 8.0, 6.5, "1 katori", 120, ["kathirikai curry", "baingan", "ennai kathirikai", "kathirikkai", "brinjal fry", "vankaya"], true, "katori"],
  ["cabbage-poriyal", "Cabbage poriyal", "veg", 70, 2.0, 7.0, 4.0, "1 katori", 100, ["muttaikose poriyal", "cabbage fry", "cabbage sabzi"], true, "katori"],
  ["beans-poriyal", "Beans poriyal", "veg", 75, 2.2, 7.5, 4.2, "1 katori", 100, ["beans fry", "beans curry", "green beans poriyal", "beans paruppu usili"], true, "katori"],
  ["mixed-veg-curry", "Mixed vegetable curry", "veg", 95, 2.5, 9.0, 5.5, "1 katori", 150, ["mixed veg", "veg curry", "vegetable curry", "mix veg", "veg gravy", "vegetable gravy"], true, "katori"],
  ["aloo-gobi", "Aloo gobi", "north", 105, 2.5, 13.0, 5.0, "1 katori", 150, ["gobi masala", "cauliflower curry", "gobi fry", "cauliflower poriyal"], true, "katori"],
  ["gobi-65", "Gobi 65", "snack", 210, 4.0, 22.0, 12.0, "1 plate", 150, ["cauliflower 65", "gobi manchurian", "cauliflower fry"], true, "plate"],
  ["salad", "Salad (vegetable)", "veg", 30, 1.2, 5.5, 0.4, "1 bowl", 150, ["salad", "veg salad", "cucumber salad", "green salad", "kosambari", "salad bowl", "onion salad", "carrot salad"], true, "bowl"],
  ["sprouts", "Sprouts (moong)", "protein", 50, 4.5, 7.0, 0.5, "1 cup", 100, ["moong sprouts", "sprout salad", "mulai payaru", "sprouted moong"], false, "cup"],
  ["boiled-vegetables", "Boiled vegetables", "veg", 45, 2.0, 8.0, 0.4, "1 bowl", 150, ["steamed vegetables", "boiled veg", "steamed veg"], true, "bowl"],
  ["sweet-potato", "Sweet potato (boiled)", "veg", 95, 1.3, 22.0, 0.2, "1 medium", 130, ["sakkaravalli kizhangu", "boiled sweet potato", "shakarkand"], false, "piece"],
  ["potato-boiled", "Potato (boiled)", "veg", 85, 1.8, 19.0, 0.1, "1 medium", 120, ["boiled potato", "urulai kizhangu", "aloo boiled"], false, "piece"],
  ["corn", "Sweet corn (boiled)", "veg", 100, 3.4, 21.0, 1.4, "1 cup", 150, ["corn", "boiled corn", "corn cup", "makka cholam", "cholam"], false, "cup"],
  ["papad", "Papad / appalam (fried)", "snack", 420, 16.0, 45.0, 19.0, "1 papad", 12, ["appalam", "papadum", "papadam", "pappadam", "appala", "fried papad", "papads"], true, "piece"],
  ["pickle", "Pickle", "condiment", 110, 1.5, 8.0, 8.0, "1 tsp", 10, ["oorugai", "urugai", "mango pickle", "lime pickle", "achar", "pickles"], true, "piece"],
  ["chutney", "Coconut chutney", "condiment", 140, 2.5, 6.0, 12.0, "2 tbsp", 40, ["thengai chutney", "coconut chutny", "chutney", "chutni", "thengai thuvaiyal", "chutneys"], true, "katori"],
  ["tomato-chutney", "Tomato chutney", "condiment", 85, 1.5, 9.0, 5.0, "2 tbsp", 40, ["thakkali chutney", "onion chutney", "kara chutney", "red chutney", "vengaya chutney", "onion tomato chutney"], true, "katori"],
  ["mint-chutney", "Mint chutney", "condiment", 60, 2.0, 7.0, 3.0, "2 tbsp", 40, ["pudina chutney", "green chutney", "coriander chutney", "kothamalli chutney"], true, "katori"],
  ["podi", "Idli podi with oil", "condiment", 480, 18.0, 35.0, 30.0, "1 tbsp", 15, ["idli podi", "milagai podi", "gunpowder", "molaga podi", "podi", "paruppu podi", "chutney powder", "podi with oil"], true, "piece"],
  ["ghee", "Ghee", "condiment", 900, 0, 0, 100, "1 tsp", 5, ["nei", "clarified butter", "spoon ghee", "desi ghee"], false, "piece"],
  ["butter", "Butter", "dairy", 730, 0.5, 0.5, 81.0, "1 tsp", 5, ["amul butter", "vennai", "salted butter"], false, "piece"],
  ["oil", "Cooking oil", "condiment", 900, 0, 0, 100, "1 tsp", 5, ["ennai", "sunflower oil", "groundnut oil", "coconut oil", "gingelly oil", "sesame oil", "nallennai", "olive oil"], false, "piece"],
  ["sugar", "Sugar", "condiment", 400, 0, 100, 0, "1 tsp", 5, ["sakkarai", "white sugar", "sugar spoon", "cheeni"], false, "piece"],
  ["jaggery", "Jaggery", "condiment", 380, 0.4, 95.0, 0.1, "1 small piece", 15, ["vellam", "gud", "nattu sakkarai", "karupatti", "palm jaggery", "bellam"], false, "piece"],
  ["honey", "Honey", "condiment", 320, 0.3, 80.0, 0, "1 tsp", 7, ["then", "thaen", "spoon honey"], false, "piece"],
  ["peanut-butter", "Peanut butter", "nuts", 590, 25.0, 20.0, 50.0, "1 tbsp", 16, ["pb", "peanut butter spoon", "groundnut butter"], false, "piece"],
  ["mayonnaise", "Mayonnaise", "condiment", 680, 1.0, 2.5, 75.0, "1 tbsp", 15, ["mayo"], false, "piece"],
  ["tomato-ketchup", "Tomato ketchup", "condiment", 110, 1.2, 26.0, 0.2, "1 tbsp", 17, ["ketchup", "sauce", "tomato sauce"], false, "piece"],
  ["raita", "Raita", "dairy", 55, 3.0, 5.0, 2.5, "1 katori", 100, ["onion raita", "cucumber raita", "boondi raita", "vellarikkai pachadi", "pachadi", "thayir pachadi"], true, "katori"],

  /* ---------------- non-veg ---------------- */
  ["chicken-curry", "Chicken curry", "nonveg", 145, 14.0, 4.0, 8.0, "1 katori", 150, ["kozhi kuzhambu", "chicken gravy", "chicken kulambu", "chicken masala", "kozhi curry", "chicken kuzhambu", "pepper chicken", "chicken chettinad", "chettinad chicken", "chicken kurma", "chicken salna", "chicken kolambu"], true, "katori"],
  ["chicken-fry", "Chicken fry", "nonveg", 235, 22.0, 5.0, 14.0, "1 plate", 150, ["chicken 65", "chicken varuval", "kozhi varuval", "pepper chicken fry", "chicken roast", "fried chicken", "chicken lollipop", "chicken tikka", "chilli chicken", "chicken pakoda", "chicken 65 plate", "kfc"], true, "plate"],
  ["chicken-breast", "Chicken breast (grilled / boiled)", "protein", 165, 31.0, 0, 3.6, "1 breast", 150, ["grilled chicken", "boiled chicken", "chicken breast", "chicken grilled", "chicken boiled", "tandoori chicken", "roasted chicken breast", "chicken pieces boiled", "baked chicken"], false, "piece"],
  ["chicken-leg", "Chicken leg / thigh (cooked)", "protein", 215, 26.0, 0, 12.0, "1 leg piece", 120, ["chicken leg piece", "chicken thigh", "leg piece", "drumstick chicken", "chicken drumstick", "tangdi"], false, "piece"],
  ["mutton-curry", "Mutton curry", "nonveg", 175, 15.0, 4.0, 11.0, "1 katori", 150, ["mutton kuzhambu", "aatu kari kuzhambu", "mutton gravy", "mutton kulambu", "goat curry", "mutton masala", "aattu kari", "mutton chettinad", "mutton kolambu", "kari kuzhambu"], true, "katori"],
  ["mutton-fry", "Mutton fry", "nonveg", 260, 24.0, 4.0, 17.0, "1 plate", 120, ["mutton varuval", "mutton chukka", "mutton sukka", "aatu kari varuval", "mutton roast", "mutton pepper fry"], true, "plate"],
  ["fish-curry", "Fish curry", "nonveg", 120, 14.0, 4.0, 5.5, "1 katori", 150, ["meen kuzhambu", "meen kulambu", "fish gravy", "fish kuzhambu", "meen curry", "fish kulambu", "meen kolambu", "chettinad fish curry"], true, "katori"],
  ["fish-fry", "Fish fry", "nonveg", 200, 21.0, 6.0, 10.0, "1 piece", 100, ["meen varuval", "fish tawa fry", "vanjaram fry", "fried fish", "meen fry", "fish 65", "fish pieces"], true, "piece"],
  ["fish-grilled", "Fish (grilled / steamed)", "protein", 130, 22.0, 0, 4.5, "1 piece", 120, ["grilled fish", "steamed fish", "baked fish", "fish grilled", "salmon", "tuna", "rohu", "seer fish", "vanjaram"], false, "piece"],
  ["prawn-masala", "Prawn masala", "nonveg", 130, 17.0, 5.0, 5.0, "1 katori", 120, ["eral masala", "prawn fry", "prawn curry", "eral thokku", "shrimp curry", "prawns", "eral varuval", "prawn thokku"], true, "katori"],
  ["crab-masala", "Crab masala", "nonveg", 110, 14.0, 4.0, 4.5, "1 katori", 150, ["nandu masala", "crab curry", "nandu"], true, "katori"],
  ["squid", "Squid fry", "nonveg", 160, 17.0, 6.0, 7.5, "1 plate", 100, ["kanava fry", "calamari", "squid masala", "kanava"], true, "plate"],
  ["chicken-shawarma", "Chicken shawarma", "fastfood", 210, 13.0, 22.0, 8.0, "1 roll", 250, ["shawarma", "shawarma roll", "chicken roll"], true, "piece"],
  ["chicken-kebab", "Chicken kebab", "nonveg", 190, 22.0, 4.0, 9.5, "1 plate", 120, ["seekh kebab", "kebab", "kabab", "chicken seekh", "reshmi kebab", "malai kebab"], true, "plate"],
  ["liver-fry", "Liver fry (chicken)", "nonveg", 180, 22.0, 4.0, 8.5, "1 katori", 100, ["chicken liver", "eeral fry", "liver pepper fry", "eeral"], true, "katori"],
  ["nethili-fry", "Nethili (anchovy) fry", "nonveg", 230, 24.0, 8.0, 11.0, "1 plate", 80, ["nethili", "anchovy fry", "nethili varuval", "nethili meen fry"], true, "plate"],
  ["chicken-soup", "Chicken soup", "nonveg", 40, 4.5, 2.0, 1.5, "1 bowl", 200, ["kozhi soup", "chicken clear soup", "mutton soup", "aatu kaal soup", "bone soup", "mutton bone soup", "paya"], true, "bowl"],

  /* ---------------- egg ---------------- */
  ["egg", "Egg (boiled)", "egg", 155, 13.0, 1.1, 11.0, "1 egg", 50, ["boiled egg", "muttai", "mutta", "eggs", "boiled eggs", "hard boiled egg", "anda", "full egg", "whole egg", "egg boiled", "half boil", "half boiled egg"], false, "piece"],
  ["egg-white", "Egg white (boiled)", "egg", 52, 11.0, 0.7, 0.2, "1 egg white", 33, ["egg whites", "white of egg", "boiled egg white", "only whites", "egg white boiled", "whites"], false, "piece"],
  ["omelette", "Omelette (1 egg, oil)", "egg", 190, 12.5, 1.5, 15.0, "1 omelette", 65, ["omelet", "omlet", "omelete", "muttai omelette", "egg omelette", "masala omelette", "onion omelette", "2 egg omelette", "cheese omelette"], true, "piece"],
  ["egg-bhurji", "Egg bhurji / podimas", "egg", 180, 12.0, 3.0, 13.0, "1 katori", 100, ["muttai podimas", "egg podimas", "scrambled eggs", "scrambled egg", "anda bhurji", "egg scramble", "bhurji"], true, "katori"],
  ["egg-curry", "Egg curry", "egg", 135, 8.5, 4.5, 9.5, "1 katori (2 eggs)", 200, ["muttai kuzhambu", "egg kuzhambu", "egg masala", "egg gravy", "muttai masala", "egg kulambu", "anda curry", "muttai kolambu"], true, "katori"],
  ["egg-fry", "Egg fry (masala)", "egg", 200, 12.5, 2.0, 16.0, "1 egg", 60, ["muttai varuval", "egg roast", "egg masala fry", "egg fry masala", "muttai fry", "egg pepper fry", "bullseye", "bulls eye", "fried egg", "sunny side up", "egg poach"], true, "piece"],
  ["egg-puff", "Egg puff", "snack", 300, 8.0, 27.0, 18.0, "1 puff", 80, ["egg puffs", "muttai puff"], true, "piece"],

  /* ---------------- dairy / protein ---------------- */
  ["milk", "Milk (full cream)", "dairy", 67, 3.2, 4.4, 4.1, "1 glass", 250, ["full milk", "paal", "cow milk", "whole milk", "hot milk", "warm milk", "milk glass", "aavin milk", "milk plain"], false, "glass"],
  ["toned-milk", "Milk (toned)", "dairy", 58, 3.0, 4.7, 3.0, "1 glass", 250, ["toned milk", "skimmed milk", "skim milk", "low fat milk", "double toned", "aavin green"], false, "glass"],
  ["curd", "Curd", "dairy", 60, 3.1, 3.0, 4.0, "1 katori", 100, ["thayir", "dahi", "yogurt", "yoghurt", "curd bowl", "plain curd", "home curd", "thair", "curd cup"], false, "katori"],
  ["greek-yogurt", "Greek yogurt", "protein", 60, 10.0, 3.6, 0.4, "1 cup", 150, ["epigamia", "high protein yogurt", "greek curd", "greek yoghurt"], false, "cup"],
  ["buttermilk", "Buttermilk", "drink", 20, 1.0, 1.5, 1.0, "1 glass", 250, ["mor", "moru", "neer mor", "chaas", "chas", "majjiga", "spiced buttermilk", "sambaram", "neer moru", "butter milk"], false, "glass"],
  ["lassi", "Lassi (sweet)", "drink", 85, 2.5, 13.0, 2.5, "1 glass", 250, ["sweet lassi", "mango lassi", "lassi glass", "salt lassi"], true, "glass"],
  ["cheese", "Cheese (processed)", "dairy", 330, 20.0, 3.0, 26.0, "1 slice", 20, ["cheese slice", "amul cheese", "cheese cube", "cheddar", "mozzarella"], false, "piece"],
  ["whey", "Whey protein (1 scoop, water)", "protein", 400, 75.0, 10.0, 5.0, "1 scoop", 30, ["whey", "whey protein", "protein powder", "protein scoop", "whey scoop", "scoop of whey", "protein shake water", "isolate", "whey isolate", "protein", "scoop"], false, "piece"],
  ["protein-shake", "Protein shake (scoop + milk)", "protein", 105, 12.0, 6.5, 3.5, "1 shake", 280, ["protein shake", "whey with milk", "protein milk", "shake", "post workout shake", "protein shake milk", "mass gainer shake"], true, "glass"],
  ["protein-bar", "Protein bar", "protein", 380, 30.0, 40.0, 11.0, "1 bar", 60, ["protein bars", "ritebite bar", "max protein bar", "yoga bar protein"], true, "piece"],
  ["soya-chunks", "Soya chunks (cooked)", "protein", 130, 16.0, 11.0, 2.5, "1 katori", 100, ["soya", "soy chunks", "meal maker", "soya curry", "soya chunk curry", "soya fry", "soya nuggets", "nutrela"], true, "katori"],
  ["tofu", "Tofu", "protein", 76, 8.1, 1.9, 4.8, "1 katori", 100, ["soya paneer", "tofu cubes", "bean curd"], false, "katori"],
  ["boiled-chana", "Boiled chana (chickpeas)", "protein", 165, 8.9, 27.4, 2.6, "1 cup", 150, ["boiled chickpeas", "kondakadalai", "chana boiled", "kabuli chana", "chickpeas", "chana", "white chana", "kala chana boiled", "black chana"], false, "cup"],
  ["rajma-boiled", "Boiled rajma", "protein", 127, 8.7, 22.8, 0.5, "1 cup", 150, ["kidney beans boiled", "boiled kidney beans"], false, "cup"],
  ["peanuts", "Peanuts (roasted)", "nuts", 585, 26.0, 16.0, 49.0, "1 handful", 30, ["groundnut", "verkadalai", "roasted peanuts", "kadalai", "peanut", "boiled peanuts", "groundnuts", "moongfali", "nilakadalai", "masala peanuts"], false, "piece"],
  ["almonds", "Almonds", "nuts", 610, 21.0, 10.0, 54.0, "10 almonds", 12, ["badam", "almond", "badam nuts", "soaked almonds", "5 almonds"], false, "piece"],
  ["cashews", "Cashew nuts", "nuts", 595, 19.0, 22.0, 47.0, "10 cashews", 15, ["cashew", "mundiri", "kaju", "cashewnut"], false, "piece"],
  ["walnuts", "Walnuts", "nuts", 690, 15.0, 11.0, 65.0, "3 walnuts", 12, ["walnut", "akhrot"], false, "piece"],
  ["mixed-nuts", "Mixed nuts", "nuts", 600, 18.0, 18.0, 50.0, "1 handful", 30, ["dry fruits", "nuts", "trail mix", "dryfruits", "dry fruit mix", "nuts mix"], true, "piece"],
  ["dates", "Dates", "fruit", 315, 2.5, 75.0, 0.4, "3 dates", 25, ["pericham pazham", "khajoor", "date", "kharjura", "pericham"], false, "piece"],
  ["raisins", "Raisins", "fruit", 305, 2.5, 74.0, 0.3, "1 tbsp", 15, ["kismis", "dry grapes", "ular dhiratchai", "kishmish"], false, "piece"],
  ["chia-seeds", "Chia seeds", "nuts", 485, 17.0, 42.0, 31.0, "1 tbsp", 12, ["chia", "chia seed", "chia water", "sabja seeds", "basil seeds"], false, "piece"],
  ["flax-seeds", "Flax seeds", "nuts", 530, 18.0, 29.0, 42.0, "1 tbsp", 10, ["flaxseed", "ali vidhai", "alsi"], false, "piece"],
  ["groundnut-chikki", "Groundnut chikki", "sweet", 480, 14.0, 60.0, 21.0, "1 piece", 25, ["chikki", "peanut chikki", "kadalai mittai", "kadalai mittai bar", "peanut bar", "groundnut candy", "chikkis", "kadalai urundai", "peanut brittle"], true, "piece"],
  ["ellu-urundai", "Sesame ball (ellu urundai)", "sweet", 500, 12.0, 50.0, 28.0, "1 ball", 25, ["ellu urundai", "til laddu", "sesame laddu", "ellu mittai"], true, "piece"],

  /* ---------------- drinks ---------------- */
  ["filter-coffee", "Filter coffee (milk & sugar)", "drink", 52, 1.3, 8.0, 1.6, "1 cup", 120, ["coffee", "kaapi", "kapi", "degree coffee", "filter kaapi", "coffee with sugar", "coffee with milk", "one coffee", "cup coffee", "milk coffee", "instant coffee", "nescafe", "bru", "coffee cup", "kumbakonam coffee", "coffe", "cofee", "kaapi cup"], true, "cup"],
  ["coffee-no-sugar", "Coffee, no sugar (milk)", "drink", 35, 1.5, 3.0, 1.6, "1 cup", 120, ["coffee without sugar", "sugarless coffee", "coffee no sugar", "unsweetened coffee", "coffee sugar illama"], true, "cup"],
  ["black-coffee", "Black coffee", "drink", 2, 0.1, 0, 0, "1 cup", 150, ["black coffee no sugar", "americano", "espresso", "black kaapi", "plain black coffee", "black coffee without sugar"], false, "cup"],
  ["tea", "Tea (milk & sugar)", "drink", 45, 1.2, 7.0, 1.4, "1 cup", 120, ["chai", "tea with sugar", "milk tea", "tea with milk", "one tea", "cup tea", "tea cup", "masala chai", "masala tea", "ginger tea", "elaichi tea", "tea sugar", "chaya", "chaai", "teh"], true, "cup"],
  ["tea-no-sugar", "Tea, no sugar (milk)", "drink", 28, 1.3, 2.5, 1.4, "1 cup", 120, ["tea without sugar", "sugarless tea", "tea no sugar", "unsweetened tea", "tea sugar illama"], true, "cup"],
  ["black-tea", "Black tea / green tea", "drink", 1, 0, 0.2, 0, "1 cup", 150, ["green tea", "lemon tea", "black tea no sugar", "herbal tea", "plain tea", "tea without milk", "sulaimani", "kahwa", "green tea cup", "chamomile tea"], false, "cup"],
  ["boost", "Boost / Horlicks milk", "drink", 95, 3.5, 13.0, 3.2, "1 glass", 250, ["horlicks", "bournvita", "complan", "boost milk", "milo", "malt drink", "health drink", "horlicks milk", "bournvita milk"], true, "glass"],
  ["badam-milk", "Badam milk", "drink", 100, 3.8, 12.0, 4.2, "1 glass", 250, ["almond milk sweet", "badam paal", "badam kheer drink", "masala milk", "rose milk", "milk with badam"], true, "glass"],
  ["coconut-milk", "Coconut milk (thin, for idiyappam)", "dairy", 85, 1.0, 4.0, 7.5, "1 katori", 100, ["coconut milk", "thengai paal", "coconut milk sweet", "thengai pal", "sweetened coconut milk"], true, "katori"],
  ["tender-coconut", "Tender coconut water", "drink", 19, 0.2, 4.0, 0.1, "1 coconut", 300, ["coconut water", "elaneer", "ilaneer", "nariyal pani", "tender coconut", "elaneer water", "coconut"], false, "glass"],
  ["nannari", "Nannari sarbath", "drink", 45, 0, 11.0, 0, "1 glass", 250, ["sarbath", "sharbat", "nannari sharbat", "rose sarbath", "jigarthanda"], true, "glass"],
  ["lime-juice", "Lime juice (with sugar)", "drink", 30, 0.1, 7.5, 0, "1 glass", 250, ["lemon juice", "nimbu pani", "lime soda", "lemon soda", "elumichai juice", "lime water", "lemon water sugar", "sweet lime juice", "lime juice sugar"], true, "glass"],
  ["lime-water", "Lime water (no sugar)", "drink", 3, 0, 0.8, 0, "1 glass", 250, ["lemon water", "warm lemon water", "lime water no sugar", "nimbu water", "lemon water without sugar", "lemon water honey"], false, "glass"],
  ["fruit-juice", "Fruit juice (fresh, sweetened)", "drink", 55, 0.4, 13.0, 0.1, "1 glass", 250, ["juice", "orange juice", "watermelon juice", "grape juice", "mosambi juice", "sweet lime juice glass", "apple juice", "pineapple juice", "mixed fruit juice", "juice glass", "pomegranate juice", "musk melon juice", "fresh juice"], true, "glass"],
  ["mango-juice", "Mango juice / Maaza", "drink", 60, 0.2, 15.0, 0.1, "1 glass", 250, ["maaza", "slice", "frooti", "mango drink", "mango juice glass", "mango shake"], true, "glass"],
  ["banana-milkshake", "Banana milkshake", "drink", 95, 2.8, 17.0, 2.0, "1 glass", 300, ["banana shake", "milkshake", "chocolate milkshake", "milk shake", "oreo shake", "banana smoothie", "fruit milkshake", "vanilla milkshake"], true, "glass"],
  ["smoothie", "Fruit smoothie (yogurt)", "drink", 80, 2.5, 15.0, 1.2, "1 glass", 300, ["fruit smoothie", "berry smoothie", "green smoothie", "oats smoothie", "yogurt smoothie"], true, "glass"],
  ["soft-drink", "Soft drink (cola)", "drink", 42, 0, 10.6, 0, "1 can / glass", 300, ["coke", "pepsi", "cola", "thums up", "thumbs up", "sprite", "7up", "cool drink", "cooldrink", "fanta", "mirinda", "limca", "soda", "coca cola", "cold drink", "colddrink"], false, "glass"],
  ["diet-drink", "Diet soft drink", "drink", 0.5, 0, 0.1, 0, "1 can", 300, ["diet coke", "coke zero", "pepsi black", "zero sugar drink", "diet pepsi", "sprite zero"], false, "glass"],
  ["energy-drink", "Energy drink", "drink", 45, 0, 11.0, 0, "1 can", 250, ["red bull", "monster", "sting", "energy drink can", "predator"], false, "glass"],
  ["beer", "Beer", "drink", 43, 0.5, 3.6, 0, "1 bottle", 650, ["kingfisher", "beer bottle", "pint", "lager", "beer pint", "beer can"], false, "glass"],
  ["whisky", "Whisky / spirits", "drink", 250, 0, 0, 0, "1 peg", 60, ["whiskey", "rum", "vodka", "brandy", "peg", "large peg", "small peg", "gin", "scotch"], false, "piece"],
  ["water", "Water", "drink", 0, 0, 0, 0, "1 glass", 250, ["thanni", "plain water", "thanneer", "pani", "glass of water", "water bottle", "mineral water", "warm water", "hot water", "ors"], false, "glass"],
  ["sugarcane-juice", "Sugarcane juice", "drink", 65, 0.2, 16.0, 0, "1 glass", 250, ["karumbu juice", "cane juice", "ganne ka ras", "karumbu"], true, "glass"],
  ["oats-milk", "Oats with milk (drink)", "drink", 70, 2.8, 10.5, 1.8, "1 glass", 250, ["oats kanji", "oats milk", "oats drink", "oats porridge drink"], true, "glass"],
  ["black-coffee-sugar", "Black coffee with sugar", "drink", 18, 0.1, 4.5, 0, "1 cup", 150, ["black coffee sugar", "black coffee with sugar", "sugar black coffee"], true, "cup"],

  /* ---------------- fruit ---------------- */
  ["banana", "Banana", "fruit", 90, 1.2, 22.0, 0.3, "1 medium", 100, ["vazhaipazham", "vazhapazham", "kela", "bananas", "banana fruit", "yelakki", "elakki banana", "poovan", "morris banana", "robusta", "banana medium", "vazha pazham", "one banana", "nendran"], false, "piece"],
  ["apple", "Apple", "fruit", 55, 0.3, 13.5, 0.3, "1 medium", 150, ["apples", "green apple", "apple fruit", "red apple", "seb", "one apple"], false, "piece"],
  ["orange", "Orange", "fruit", 45, 0.8, 10.5, 0.2, "1 medium", 130, ["oranges", "orange fruit", "kamala orange", "santra", "nagpur orange"], false, "piece"],
  ["mosambi", "Sweet lime (mosambi)", "fruit", 40, 0.7, 9.0, 0.2, "1 medium", 150, ["sathukudi", "sweet lime", "mosambi fruit", "sathukkudi", "musambi"], false, "piece"],
  ["guava", "Guava", "fruit", 60, 1.4, 12.0, 0.6, "1 medium", 120, ["koyya", "koyya pazham", "guavas", "amrood", "guava fruit"], false, "piece"],
  ["papaya", "Papaya", "fruit", 35, 0.5, 8.0, 0.2, "1 cup pieces", 150, ["pappali", "papaya pieces", "papaya bowl", "papaya cup", "papita"], false, "cup"],
  ["watermelon", "Watermelon", "fruit", 25, 0.5, 5.5, 0.2, "1 cup pieces", 200, ["tharpoosani", "tharbooza", "watermelon pieces", "watermelon bowl", "watermelon cup", "melon"], false, "cup"],
  ["muskmelon", "Muskmelon", "fruit", 30, 0.7, 6.5, 0.2, "1 cup pieces", 150, ["musk melon", "kirni pazham", "cantaloupe", "kharbuja", "kirni"], false, "cup"],
  ["mango", "Mango", "fruit", 65, 0.6, 15.5, 0.4, "1 medium", 200, ["mangoes", "maampazham", "mambazham", "alphonso", "banganapalli", "mango pieces", "mango fruit", "aam", "mango cup"], false, "piece"],
  ["grapes", "Grapes", "fruit", 65, 0.6, 16.0, 0.3, "1 cup", 100, ["dhiratchai", "green grapes", "black grapes", "grape", "angoor", "grapes cup", "grapes bowl"], false, "cup"],
  ["pomegranate", "Pomegranate", "fruit", 70, 1.2, 15.0, 0.5, "1 cup arils", 150, ["madhulai", "mathulai", "anar", "pomegranate seeds", "pomegranate cup", "pomegranate bowl"], false, "cup"],
  ["pineapple", "Pineapple", "fruit", 45, 0.5, 11.0, 0.1, "1 cup pieces", 150, ["annasi", "annachi pazham", "pineapple pieces", "pineapple cup", "anannas"], false, "cup"],
  ["sapota", "Sapota (chikoo)", "fruit", 85, 0.7, 20.0, 1.0, "1 medium", 80, ["chikoo", "chiku", "sapodilla", "sapota fruit", "sappota"], false, "piece"],
  ["custard-apple", "Custard apple", "fruit", 95, 1.6, 22.0, 0.5, "1 medium", 150, ["seethapazham", "sitaphal", "sitapazham", "seetha pazham", "sugar apple"], false, "piece"],
  ["jackfruit", "Jackfruit", "fruit", 90, 1.8, 20.0, 0.3, "4 bulbs", 100, ["palapazham", "pala pazham", "jack fruit", "kathal", "jackfruit bulbs"], false, "cup"],
  ["kiwi", "Kiwi", "fruit", 55, 1.1, 12.0, 0.5, "1 kiwi", 75, ["kiwi fruit", "kiwis"], false, "piece"],
  ["pear", "Pear", "fruit", 50, 0.4, 12.0, 0.2, "1 medium", 150, ["pears", "berikkai", "nashpati"], false, "piece"],
  ["strawberries", "Strawberries", "fruit", 32, 0.7, 7.5, 0.3, "1 cup", 150, ["strawberry", "berries", "blueberries", "mixed berries"], false, "cup"],
  ["amla", "Amla", "fruit", 45, 0.5, 10.0, 0.1, "1 amla", 20, ["nellikai", "gooseberry", "indian gooseberry", "nellikkai", "amla juice"], false, "piece"],
  ["avocado", "Avocado", "fruit", 160, 2.0, 8.5, 15.0, "half avocado", 70, ["butter fruit", "avocado half", "avacado", "avocados"], false, "piece"],
  ["dragon-fruit", "Dragon fruit", "fruit", 55, 1.1, 13.0, 0.4, "1 medium", 200, ["pitaya", "dragonfruit"], false, "piece"],
  ["fruit-bowl", "Mixed fruit bowl", "fruit", 55, 0.8, 13.0, 0.3, "1 bowl", 200, ["fruits", "fruit salad", "mixed fruits", "fruit plate", "fruit cup", "fruits bowl", "cut fruits", "fruit"], true, "bowl"],
  ["dry-coconut", "Coconut (fresh pieces)", "nuts", 355, 3.3, 10.0, 33.0, "1 small piece", 25, ["thengai", "coconut piece", "fresh coconut", "coconut pieces", "nariyal", "grated coconut"], false, "piece"],

  /* ---------------- snacks / street ---------------- */
  ["vada", "Medu vada", "snack", 260, 8.5, 26.0, 14.0, "1 vada", 45, ["vadai", "medhu vada", "ulundu vadai", "urad vada", "uzhunnu vada", "vadas", "vadais", "vade", "sambar vada", "sambar vadai", "medu vadai", "vada sambar", "ulundhu vadai"], true, "piece"],
  ["masala-vada", "Masala vada", "snack", 280, 9.0, 28.0, 15.0, "1 vada", 40, ["masal vadai", "paruppu vadai", "aama vadai", "masala vadai", "chana dal vada", "parippu vada", "aamai vadai", "dal vada"], true, "piece"],
  ["dahi-vada", "Dahi vada / thayir vadai", "snack", 165, 6.5, 18.0, 7.5, "1 vada with curd", 100, ["thayir vadai", "curd vada", "dahi vadai", "dahi bhalla", "thayir vada"], true, "piece"],
  ["bajji", "Bajji (chilli / banana)", "snack", 250, 5.0, 28.0, 13.0, "1 bajji", 50, ["bajjis", "milagai bajji", "chilli bajji", "vazhakkai bajji", "onion bajji", "bhajji", "bhaji", "raw banana bajji", "potato bajji", "bajji plate"], true, "piece"],
  ["bonda", "Bonda (potato)", "snack", 245, 4.5, 30.0, 12.0, "1 bonda", 50, ["urulai bonda", "aloo bonda", "bondas", "mysore bonda", "mangalore bonda", "batata vada", "goli bajje"], true, "piece"],
  ["pakoda", "Pakoda (onion)", "snack", 320, 7.0, 32.0, 18.0, "1 handful", 50, ["pakora", "onion pakoda", "vengaya pakoda", "pakodas", "bhajia", "pakora plate", "mixture pakoda", "keerai vadai"], true, "piece"],
  ["samosa", "Samosa", "snack", 300, 5.5, 32.0, 17.0, "1 samosa", 80, ["samosas", "samsa", "veg samosa", "onion samosa", "samosa chaat"], true, "piece"],
  ["murukku", "Murukku", "snack", 510, 7.0, 55.0, 29.0, "1 murukku", 20, ["murukkus", "chakli", "chakkuli", "thenkuzhal", "kai murukku", "mullu murukku"], true, "piece"],
  ["mixture", "Mixture (namkeen)", "snack", 520, 10.0, 50.0, 31.0, "1 handful", 30, ["namkeen", "kara mixture", "chivda", "bhujia", "haldiram mixture", "sev", "omapodi", "kara boondi", "madras mixture", "mixture packet"], true, "piece"],
  ["chips", "Potato chips", "snack", 535, 6.5, 50.0, 35.0, "1 small packet", 30, ["lays", "kurkure", "wafers", "banana chips", "nendran chips", "chips packet", "crisps", "tapioca chips", "maravalli chips", "bingo", "packet chips"], false, "piece"],
  ["biscuit", "Biscuit (Marie / glucose)", "snack", 440, 7.0, 76.0, 12.0, "1 biscuit", 7, ["marie", "parle g", "biscuits", "glucose biscuit", "marie gold", "milk bikis", "tiger biscuit", "good day", "britannia"], false, "piece"],
  ["cream-biscuit", "Cream biscuit", "snack", 490, 5.0, 70.0, 21.0, "1 biscuit", 12, ["oreo", "bourbon", "cream biscuits", "hide and seek", "dark fantasy", "jim jam", "chocolate biscuit", "cookie", "cookies", "choco chip cookie"], false, "piece"],
  ["rusk", "Rusk", "snack", 410, 8.0, 72.0, 9.0, "1 rusk", 15, ["toast rusk", "rusks", "bread rusk", "butter rusk"], false, "piece"],
  ["bun", "Bun (bakery)", "bread", 300, 8.0, 52.0, 6.5, "1 bun", 60, ["bun butter", "bun butter jam", "iyengar bakery bun", "cream bun", "sweet bun", "buns", "pav", "dilkush", "dilpasand"], true, "piece"],
  ["veg-puff", "Veg puff", "snack", 330, 5.0, 32.0, 20.0, "1 puff", 70, ["puff", "puffs", "vegetable puff", "chicken puff", "curry puff"], true, "piece"],
  ["cake", "Cake (plain / tea cake)", "sweet", 380, 5.0, 55.0, 16.0, "1 slice", 60, ["cake slice", "plum cake", "sponge cake", "pastry", "cup cake", "cupcake", "muffin", "brownie", "chocolate cake", "birthday cake", "black forest"], true, "piece"],
  ["chocolate", "Chocolate (milk)", "sweet", 535, 7.5, 57.0, 30.0, "1 small bar", 25, ["dairy milk", "cadbury", "kitkat", "5 star", "five star", "munch", "chocolate bar", "choco", "silk", "perk", "snickers", "ferrero"], false, "piece"],
  ["dark-chocolate", "Dark chocolate", "sweet", 550, 6.0, 46.0, 38.0, "2 squares", 20, ["amul dark", "dark choc", "85% dark", "70% dark chocolate"], false, "piece"],
  ["ice-cream", "Ice cream", "sweet", 210, 3.5, 25.0, 11.0, "1 scoop", 80, ["icecream", "ice-cream", "vanilla ice cream", "kulfi", "chocolate ice cream", "cone", "cornetto", "amul ice cream", "scoop ice cream", "softy", "ice cream cup"], false, "piece"],
  ["chocolate-shake", "Chocolate shake / cold coffee", "drink", 110, 3.0, 17.0, 3.5, "1 glass", 300, ["cold coffee", "frappe", "iced coffee", "chocolate drink", "boba", "bubble tea", "cold coffee glass"], true, "glass"],
  ["pani-puri", "Pani puri", "snack", 210, 4.0, 30.0, 8.5, "6 puris", 120, ["gol gappa", "golgappa", "puchka", "pani poori", "panipuri", "pani puri plate"], true, "plate"],
  ["bhel-puri", "Bhel puri", "snack", 170, 4.5, 28.0, 5.0, "1 plate", 150, ["bhel", "jhal muri", "churmuri", "masala pori", "bhelpuri", "kara pori"], true, "plate"],
  ["masala-puri", "Masala puri", "snack", 190, 5.5, 28.0, 6.5, "1 plate", 200, ["masala poori chaat", "chaat", "sev puri", "dahi puri", "papdi chaat", "chat", "chaat plate"], true, "plate"],
  ["vada-pav", "Vada pav", "fastfood", 290, 6.0, 40.0, 12.0, "1 vada pav", 130, ["vadapav", "wada pav"], true, "piece"],
  ["pav-bhaji", "Pav bhaji", "fastfood", 155, 3.5, 22.0, 6.0, "1 plate (2 pav)", 300, ["pav bhaji plate", "bhaji pav", "pao bhaji"], true, "plate"],
  ["sandwich", "Vegetable sandwich", "fastfood", 220, 6.5, 32.0, 7.5, "1 sandwich", 140, ["veg sandwich", "bread sandwich", "grilled sandwich", "club sandwich", "sandwiches", "cheese sandwich", "toast sandwich", "bombay sandwich", "sandwich grilled"], true, "piece"],
  ["chicken-sandwich", "Chicken sandwich", "fastfood", 230, 12.0, 28.0, 8.0, "1 sandwich", 160, ["chicken sub", "subway chicken", "chicken grilled sandwich", "egg sandwich", "subway"], true, "piece"],
  ["burger", "Veg burger", "fastfood", 250, 6.0, 33.0, 10.0, "1 burger", 150, ["veg burger", "aloo tikki burger", "mcaloo tikki", "mcaloo", "burger"], true, "piece"],
  ["chicken-burger", "Chicken burger", "fastfood", 265, 13.0, 30.0, 10.5, "1 burger", 180, ["mcchicken", "zinger", "chicken burger", "zinger burger", "whopper", "burger chicken"], true, "piece"],
  ["pizza", "Pizza (regular slice)", "fastfood", 265, 11.0, 32.0, 10.0, "1 slice", 100, ["pizza", "pizza slice", "dominos", "margherita", "cheese pizza", "veg pizza", "chicken pizza", "pizza hut", "pizza slices", "paneer pizza"], true, "piece"],
  ["french-fries", "French fries", "fastfood", 310, 3.5, 40.0, 15.0, "1 regular", 110, ["fries", "finger chips", "potato fries", "mcdonalds fries", "peri peri fries", "chips fries"], true, "plate"],
  ["noodles", "Vegetable noodles", "fastfood", 160, 4.5, 24.0, 5.5, "1 plate", 250, ["veg noodles", "hakka noodles", "chow mein", "chowmein", "noodle", "street noodles", "schezwan noodles", "fried noodles"], true, "plate"],
  ["chicken-noodles", "Chicken noodles", "fastfood", 175, 8.5, 23.0, 6.0, "1 plate", 250, ["chicken hakka noodles", "chicken chow mein", "egg noodles", "chicken noodle"], true, "plate"],
  ["maggi", "Maggi", "fastfood", 150, 3.5, 22.0, 5.5, "1 packet cooked", 250, ["maggi noodles", "instant noodles", "yippee", "top ramen", "masala maggi", "maggie", "egg maggi", "cheese maggi", "2 minute noodles"], true, "plate"],
  ["pasta", "Pasta (red / white sauce)", "fastfood", 165, 5.0, 24.0, 5.5, "1 plate", 250, ["macaroni", "penne", "white sauce pasta", "red sauce pasta", "pasta plate", "spaghetti", "mac and cheese", "alfredo pasta"], true, "plate"],
  ["momos", "Momos (veg, steamed)", "fastfood", 175, 6.0, 28.0, 4.0, "6 momos", 180, ["momo", "dumplings", "chicken momos", "steamed momos", "fried momos", "momos plate", "dumpling"], true, "plate"],
  ["manchurian", "Gobi / veg manchurian", "fastfood", 190, 4.5, 24.0, 9.0, "1 plate", 150, ["veg manchurian", "chicken manchurian", "manchurian gravy", "manchuria", "manjurian"], true, "plate"],
  ["spring-roll", "Spring roll", "fastfood", 250, 5.0, 30.0, 12.0, "1 roll", 60, ["spring rolls", "veg spring roll", "chicken spring roll"], true, "piece"],
  ["frankie", "Veg frankie / kathi roll", "fastfood", 230, 6.0, 32.0, 9.0, "1 roll", 180, ["kathi roll", "paneer roll", "veg roll", "frankie roll", "egg roll", "paneer frankie", "roll"], true, "piece"],
  ["chicken-frankie", "Chicken kathi roll", "fastfood", 240, 12.0, 28.0, 9.0, "1 roll", 200, ["chicken kathi roll", "chicken frankie", "chicken wrap", "wrap"], true, "piece"],
  ["popcorn", "Popcorn (salted)", "snack", 400, 8.0, 60.0, 15.0, "1 cup", 25, ["pop corn", "butter popcorn", "caramel popcorn", "popcorn tub"], true, "cup"],
  ["makhana", "Makhana (roasted)", "snack", 350, 9.5, 77.0, 0.5, "1 cup", 25, ["fox nuts", "foxnut", "lotus seeds", "phool makhana", "roasted makhana"], false, "cup"],
  ["roasted-chana", "Roasted chana (pottukadalai)", "snack", 370, 21.0, 58.0, 5.0, "1 handful", 30, ["pottukadalai", "roasted gram", "bhuna chana", "fried gram", "chutney dal", "roasted chickpeas", "pori kadalai"], false, "piece"],
  ["puffed-rice", "Puffed rice (pori)", "snack", 325, 6.0, 74.0, 0.5, "1 cup", 15, ["pori", "murmura", "puffed rice", "arisi pori", "nel pori", "puffed rice cup"], false, "cup"],
  ["bread-butter-jam", "Bread with butter & jam", "bread", 310, 6.5, 50.0, 9.5, "2 slices", 65, ["bread jam", "bread butter", "butter toast", "jam bread", "bread and jam", "bread with jam", "toast with butter", "bread butter jam", "jam toast"], true, "piece"],
  ["peanut-butter-toast", "Peanut butter toast", "bread", 330, 12.0, 40.0, 14.0, "2 slices", 80, ["pb toast", "bread peanut butter", "peanut butter sandwich", "bread with peanut butter", "pb sandwich", "peanut butter bread"], true, "piece"],
  ["cheese-toast", "Cheese toast", "bread", 320, 12.0, 38.0, 13.0, "2 slices", 75, ["cheese bread", "bread cheese", "cheese on toast", "garlic bread", "bread with cheese"], true, "piece"],
  ["chocos-dry", "Dry cereal (chocos / cornflakes, no milk)", "snack", 380, 6.0, 84.0, 2.5, "1 cup", 30, ["chocos dry", "cornflakes dry", "dry cereal", "granola", "muesli", "muesli dry", "granola bar"], false, "cup"],
  ["dosa-batter", "Dosa batter (raw)", "breakfast", 120, 3.5, 24.0, 0.6, "1 ladle", 60, ["batter", "idli batter", "maavu", "idli maavu"], true, "piece"],

  /* ---------------- more singles ---------------- */
  ["podi-dosa", "Podi dosa", "breakfast", 200, 4.5, 28.0, 8.0, "1 podi dosa", 95, ["podi dosai", "podi roast", "molaga podi dosa"], true, "piece"],
  ["onion-dosa", "Onion dosa", "breakfast", 170, 4.0, 28.0, 4.8, "1 onion dosa", 100, ["onion dosai", "vengaya dosai", "onion uthappam dosa"], true, "piece"],
  ["ragi-idli", "Ragi idli", "breakfast", 120, 3.5, 25.0, 0.6, "1 ragi idli", 45, ["ragi idly", "kezhvaragu idli", "finger millet idli"], true, "piece"],
  ["ragi-roti", "Ragi roti", "bread", 230, 6.0, 46.0, 2.5, "1 ragi roti", 50, ["ragi rotti", "ragi chapati", "kezhvaragu roti", "ragi adai"], true, "piece"],
  ["jowar-roti", "Jowar / bajra roti", "bread", 235, 7.0, 47.0, 2.0, "1 roti", 50, ["jowar rotti", "bajra roti", "kambu roti", "cholam roti", "jolada rotti", "millet roti", "bhakri"], true, "piece"],
  ["thinai-pongal", "Millet pongal", "breakfast", 135, 4.2, 22.0, 3.8, "1 cup", 200, ["thinai pongal", "samai pongal", "millet ven pongal", "varagu pongal"], true, "cup"],
  ["kanji", "Rice kanji (porridge)", "breakfast", 50, 1.0, 11.0, 0.2, "1 bowl", 250, ["arisi kanji", "rice porridge", "kanji", "pazhaya sadam", "pazhaya soru", "neeragaram", "congee", "ganji"], true, "bowl"],
  ["dhokla", "Dhokla", "snack", 160, 6.0, 26.0, 3.5, "2 pieces", 80, ["khaman", "khaman dhokla", "dhoklas"], true, "piece"],
  ["chole-bhature", "Chole bhature", "north", 260, 6.5, 32.0, 12.0, "1 plate (2 bhature)", 300, ["chana bhatura", "bhatura", "bhature", "chole bhatura"], true, "plate"],
  ["paneer-paratha", "Paneer / gobi paratha", "north", 255, 8.0, 32.0, 10.5, "1 paratha", 120, ["gobi paratha", "methi paratha", "mooli paratha", "onion paratha", "stuffed paneer paratha", "thepla", "methi thepla"], true, "piece"],
  ["vegetable-soup", "Vegetable soup", "veg", 35, 1.2, 6.0, 0.8, "1 bowl", 200, ["veg soup", "tomato soup", "sweet corn soup", "corn soup", "clear soup", "soup", "manchow soup", "hot and sour soup", "mushroom soup"], true, "bowl"],
  ["cucumber", "Cucumber (raw)", "veg", 15, 0.6, 3.0, 0.1, "1 cucumber", 150, ["vellarikkai", "kakdi", "cucumber slices", "cucumber pieces", "vellari"], false, "piece"],
  ["carrot", "Carrot (raw)", "veg", 40, 0.9, 9.0, 0.2, "1 carrot", 70, ["carrots", "raw carrot", "gajar", "carrot sticks", "carrot pieces"], false, "piece"],
  ["tomato", "Tomato (raw)", "veg", 20, 0.9, 3.5, 0.2, "1 tomato", 100, ["thakkali", "tomatoes", "raw tomato", "tamatar", "tomato slices"], false, "piece"],
  ["onion-raw", "Onion (raw, sliced)", "veg", 40, 1.2, 9.0, 0.1, "1 small onion", 50, ["vengayam", "raw onion", "onion slices", "onion rings raw", "pyaz", "onion"], false, "piece"],
  ["beetroot-poriyal", "Beetroot poriyal", "veg", 75, 1.8, 10.0, 3.2, "1 katori", 100, ["beetroot fry", "beetroot curry", "beetroot sabzi", "beetroot"], true, "katori"],
  ["drumstick-sambar", "Drumstick sambar", "dal", 62, 3.0, 9.0, 1.5, "1 katori", 150, ["murungakkai sambar", "murungai sambar", "drumstick curry", "murungakkai"], true, "katori"],
  ["green-peas-curry", "Green peas masala", "veg", 100, 4.0, 13.0, 3.5, "1 katori", 150, ["pattani masala", "peas masala", "matar masala", "pattani kurma", "peas curry", "pachai pattani"], true, "katori"],
  ["black-chana-curry", "Black chana curry", "veg", 135, 6.5, 18.0, 4.5, "1 katori", 150, ["kala chana curry", "karuppu kondakadalai", "black chickpea curry", "kala chana masala", "kadalai kuzhambu"], true, "katori"],
  ["turmeric-milk", "Turmeric milk", "drink", 70, 3.2, 5.0, 4.0, "1 glass", 250, ["manjal paal", "haldi doodh", "golden milk", "milk with turmeric", "manjal milk"], true, "glass"],
  ["jeera-water", "Jeera / fenugreek water", "drink", 3, 0.1, 0.5, 0, "1 glass", 250, ["cumin water", "methi water", "vendhayam water", "fenugreek water", "jeera pani", "detox water", "apple cider vinegar water", "acv water"], false, "glass"],
  ["coconut-chutney-podi-plate", "Idli fry", "snack", 210, 4.0, 30.0, 8.5, "1 plate", 150, ["idli fry", "fried idli", "idli 65", "idly fry", "podi idli fry", "idli manchurian"], true, "plate"],
  ["chicken-curry-cut-boiled", "Chicken (boiled, with skin)", "protein", 190, 27.0, 0, 9.0, "1 katori", 100, ["boiled chicken pieces", "chicken pieces", "chicken boiled pieces", "steamed chicken", "chicken kuzhambu pieces only", "chicken meat"], false, "katori"],
  ["egg-white-omelette", "Egg white omelette (3 whites)", "egg", 75, 11.0, 1.0, 2.8, "1 omelette", 110, ["white omelette", "egg white omelet", "egg whites omelette", "3 egg white omelette", "whites omelette"], true, "piece"],

  /* ---------------- sweets ---------------- */
  ["kesari", "Rava kesari", "sweet", 290, 3.0, 50.0, 8.5, "1 katori", 100, ["kesari bath", "sooji halwa", "kesari", "rava kesari bath", "sheera", "sajjige"], true, "katori"],
  ["payasam", "Payasam (semiya)", "sweet", 145, 3.5, 24.0, 4.0, "1 katori", 150, ["kheer", "paayasam", "semiya payasam", "vermicelli kheer", "sago payasam", "javvarisi payasam", "paruppu payasam", "rice kheer", "pal payasam", "paal payasam", "ada pradhaman", "payasam cup"], true, "katori"],
  ["gulab-jamun", "Gulab jamun", "sweet", 330, 4.0, 52.0, 12.0, "1 piece", 40, ["gulab jamoon", "jamun", "jamoon", "gulab jamuns", "jangiri", "jalebi", "jilebi", "jaangiri"], true, "piece"],
  ["laddu", "Laddu (boondi)", "sweet", 410, 5.5, 58.0, 17.5, "1 laddu", 40, ["ladoo", "laddoo", "boondi laddu", "motichoor laddu", "tirupati laddu", "besan laddu", "rava laddu", "laddus", "ladoos", "laddu piece", "laadu"], true, "piece"],
  ["mysore-pak", "Mysore pak", "sweet", 520, 5.0, 55.0, 32.0, "1 piece", 35, ["mysurpa", "mysore pa", "mysorepak", "ghee mysore pak", "mysurpak"], true, "piece"],
  ["halwa", "Halwa (wheat / carrot)", "sweet", 340, 3.5, 48.0, 15.0, "1 piece", 60, ["tirunelveli halwa", "gajar halwa", "carrot halwa", "wheat halwa", "halwa piece", "kasi halwa", "beetroot halwa", "moong dal halwa", "halva", "alva"], true, "piece"],
  ["adhirasam", "Adhirasam", "sweet", 420, 3.0, 62.0, 18.0, "1 piece", 40, ["athirasam", "adirasam", "ariselu", "adhirsam"], true, "piece"],
  ["barfi", "Barfi / peda", "sweet", 390, 7.0, 55.0, 15.0, "1 piece", 30, ["burfi", "kaju katli", "kaju burfi", "peda", "milk peda", "coconut barfi", "doodh peda", "milk sweet", "palkova", "therattipal", "therattipaal", "milk cake", "palgova"], true, "piece"],
  ["rasgulla", "Rasgulla", "sweet", 190, 4.0, 40.0, 1.5, "1 piece", 50, ["rasagulla", "rasogolla", "rasmalai", "ras malai", "rasgullas", "cham cham"], true, "piece"],
  ["sweet", "Indian sweet (unspecified)", "sweet", 400, 5.0, 55.0, 17.0, "1 piece", 35, ["sweets", "mithai", "inippu", "sweet piece", "sweet item", "one sweet", "mixed sweets", "sweet box"], true, "piece"],
  ["appalam-sweet", "Poli / obbattu", "sweet", 320, 6.0, 55.0, 8.0, "1 poli", 60, ["poli", "boli", "obbattu", "puran poli", "holige", "paruppu poli", "coconut poli"], true, "piece"],
  ["banana-fritter", "Pazham pori (banana fritter)", "sweet", 280, 3.0, 40.0, 12.0, "1 piece", 60, ["pazham pori", "ethakka appam", "banana fry", "vazhakkai fry sweet"], true, "piece"],
  ["nei-appam", "Nei appam / unniyappam", "sweet", 330, 4.0, 45.0, 15.0, "1 appam", 30, ["unniyappam", "nei appam", "paniyaram sweet", "sweet paniyaram", "kuzhi paniyaram sweet", "vella paniyaram"], true, "piece"],
  ["paniyaram", "Kuzhi paniyaram (kara)", "breakfast", 190, 4.0, 28.0, 7.0, "1 paniyaram", 25, ["kara paniyaram", "paniyaram", "paddu", "kuzhi paniyaram", "guliyappa", "paniyarams", "appe"], true, "piece"],
  ["biscuit-cream-cracker", "Cream cracker", "snack", 430, 9.0, 68.0, 13.0, "1 cracker", 8, ["monaco", "krackjack", "cracker", "crackers", "salt biscuit", "50-50", "digestive biscuit", "nutrichoice"], false, "piece"],
  ["chocolate-spread", "Chocolate spread (Nutella)", "sweet", 540, 6.0, 57.0, 31.0, "1 tbsp", 20, ["nutella", "choco spread", "hazelnut spread"], false, "piece"],
  ["jam", "Jam", "sweet", 260, 0.3, 65.0, 0.1, "1 tbsp", 20, ["mixed fruit jam", "kissan jam", "fruit jam", "jam spoon", "jam spread"], false, "piece"],
  ["boost-dry", "Boost / Horlicks powder", "sweet", 380, 8.0, 78.0, 3.0, "2 tsp", 15, ["horlicks powder", "boost powder", "bournvita powder", "malt powder", "health drink powder"], false, "piece"],

  /* ---------------- north / other mains ---------------- */
  ["naan", "Naan", "north", 300, 8.5, 50.0, 7.0, "1 naan", 90, ["butter naan", "garlic naan", "naans", "plain naan", "nan", "kulcha"], true, "piece"],
  ["tandoori-roti", "Tandoori roti", "north", 260, 8.0, 50.0, 3.0, "1 roti", 50, ["tandoor roti", "rumali roti", "roomali roti", "rumali", "tandoori rotis"], true, "piece"],
  ["butter-chicken", "Butter chicken", "north", 190, 13.0, 5.0, 13.0, "1 katori", 150, ["murgh makhani", "chicken makhani", "butter chicken gravy", "chicken tikka masala", "chicken butter masala"], true, "katori"],
  ["chicken-tikka", "Chicken tikka (tandoori)", "protein", 175, 26.0, 2.0, 7.0, "6 pieces", 150, ["tikka", "tandoori tikka", "chicken tandoori", "malai tikka", "chicken tikka pieces", "tandoori chicken pieces"], true, "plate"],
  ["paneer-tikka", "Paneer tikka", "north", 245, 13.0, 8.0, 18.0, "6 pieces", 150, ["tandoori paneer", "paneer tikka plate", "paneer grilled"], true, "plate"],
  ["egg-parotta", "Egg parotta / muttai parotta", "bread", 235, 8.5, 26.0, 11.0, "1 serving", 250, ["muttai parotta", "egg porotta", "egg barotta", "muttai porotta", "egg parota"], true, "serving"],
  ["oats-fruit", "Oats with fruit & nuts", "breakfast", 115, 4.0, 17.0, 3.5, "1 bowl", 300, ["oats banana", "oats with banana", "overnight oats", "oats fruits", "oats nuts", "oats with fruits", "oats with nuts", "oats and banana", "fruit oats"], true, "bowl"],
];

/* ------------------------------------------------------------------ */
/* Table                                                              */
/* ------------------------------------------------------------------ */

/** "Brown rice (cooked)" → "brown rice"; single words are left to explicit aliases so "chicken" never silently means one dish. */
function autoAlias(name: string): string[] {
  const stripped = name.replace(/\s*\(.*?\)/g, "").replace(/\s*\/.*$/, "").trim().toLowerCase();
  return stripped.split(" ").length >= 2 ? [stripped] : [];
}

/** A bare word that could mean several dishes: pick the everyday one, but flag it. */
const AMBIGUOUS: Record<string, string> = { chicken: "chicken-curry", mutton: "mutton-curry", fish: "fish-curry", prawn: "prawn-masala", crab: "crab-masala", salad: "salad", pizza: "pizza", biryani: "chicken-biryani", kurma: "veg-kurma", curry: "mixed-veg-curry", gravy: "veg-kurma", noodles: "noodles", juice: "fruit-juice", shake: "banana-milkshake", soup: "vegetable-soup", nuts: "mixed-nuts", fruit: "fruit-bowl", fruits: "fruit-bowl", sweet: "sweet", sweets: "sweet", biscuit: "biscuit", chips: "chips", cake: "cake", chocolate: "chocolate", bread: "bread", roti: "chapati", paratha: "paratha", sabzi: "poriyal", rice: "rice", dal: "dal", egg: "egg", coffee: "filter-coffee", tea: "tea", milk: "milk", curd: "curd", paneer: "paneer" };

export const FOODS: Food[] = R.map(([id, name, category, kcal, protein, carbs, fat, label, grams, aliases, estimate, unit]) => ({
  id,
  name,
  category,
  per100: { kcal, protein, carbs, fat },
  portion: { label, grams },
  aliases: Array.from(new Set([...aliases, ...autoAlias(name)])),
  estimate: estimate ?? true,
  unit: unit ?? "serving",
}));

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]));

/* ------------------------------------------------------------------ */
/* Combos — a plate name that expands into its parts                  */
/* ------------------------------------------------------------------ */

export type Combo = {
  id: string;
  name: string;
  aliases: string[];
  /** parts by food id with default grams; a leading count ("2 parotta salna") multiplies the `countable` part only */
  parts: { id: string; grams: number }[];
  countable?: string;
};

export const COMBOS: Combo[] = [
  { id: "idli-sambar", name: "Idli, sambar & chutney", aliases: ["idli sambar", "idli sambar chutney", "idli sambhar", "idli with sambar", "idly sambar", "idli chutney", "idly chutney", "idli plate", "idly plate", "idli with chutney", "idli and sambar", "idli set", "idli tiffin"], parts: [{ id: "idli", grams: 120 }, { id: "sambar", grams: 150 }, { id: "chutney", grams: 40 }], countable: "idli" },
  { id: "idli-vada", name: "Idli & vada with sambar", aliases: ["idli vada", "idli vadai", "idly vada", "idli vada sambar", "idli and vada", "idli with vada", "idly vadai", "idli vada chutney"], parts: [{ id: "idli", grams: 80 }, { id: "vada", grams: 45 }, { id: "sambar", grams: 150 }], countable: "idli" },
  { id: "idli-podi", name: "Idli with podi & oil", aliases: ["idli podi", "podi idli", "idli with podi", "idly podi", "podi idly", "idli podi oil"], parts: [{ id: "idli", grams: 120 }, { id: "podi", grams: 15 }], countable: "idli" },
  { id: "dosa-sambar", name: "Dosa, sambar & chutney", aliases: ["dosa sambar", "dosa chutney", "dosa with sambar", "dosai sambar", "dosa plate", "dosa sambar chutney", "dosa with chutney", "dosai chutney", "dosa and sambar", "dosa set", "dosa tiffin"], parts: [{ id: "dosa", grams: 80 }, { id: "sambar", grams: 150 }, { id: "chutney", grams: 40 }], countable: "dosa" },
  { id: "dosa-egg-plate", name: "Dosa with egg curry", aliases: ["dosa egg curry", "dosa with egg curry", "dosa with egg", "dosai muttai kuzhambu", "dosa egg kuzhambu"], parts: [{ id: "dosa", grams: 80 }, { id: "egg-curry", grams: 150 }], countable: "dosa" },
  { id: "pongal-vada", name: "Pongal with vada", aliases: ["pongal vada", "pongal vadai", "pongal vada sambar", "pongal and vada", "pongal with vada", "pongal vada chutney"], parts: [{ id: "pongal", grams: 200 }, { id: "vada", grams: 45 }, { id: "sambar", grams: 100 }], countable: "vada" },
  { id: "poori-plate", name: "Poori with masala", aliases: ["poori masala plate", "puri bhaji", "poori kizhangu", "puri masala", "poori with masala", "puri with masala", "poori set", "poori masala", "puri masala plate", "poori potato masala", "poori with potato masala", "poori and masala"], parts: [{ id: "poori", grams: 70 }, { id: "poori-masala", grams: 120 }], countable: "poori" },
  { id: "parotta-salna", name: "Parotta with salna", aliases: ["parotta salna", "porotta salna", "parotta kurma", "parotta with salna", "barotta salna", "parotta gravy", "parotta with kurma", "porotta kurma", "parotta chicken salna", "parotta and salna", "parotta set", "parotta with gravy", "parotta and kurma"], parts: [{ id: "parotta", grams: 180 }, { id: "veg-kurma", grams: 150 }], countable: "parotta" },
  { id: "chapati-kurma", name: "Chapati with kurma", aliases: ["chapati kurma", "chapathi kurma", "roti kurma", "chapati with kurma", "roti with kurma", "chapati curry", "chapathi curry", "roti curry", "chapati sabzi", "roti sabzi", "chapathi and kurma", "chapati and kurma", "roti and sabzi", "chapati with curry", "roti with sabzi", "chapati veg curry", "chapati with veg curry", "chapati gravy"], parts: [{ id: "chapati", grams: 80 }, { id: "veg-kurma", grams: 150 }], countable: "chapati" },
  { id: "chapati-dal", name: "Chapati with dal", aliases: ["chapati dal", "roti dal", "chapati with dal", "roti with dal", "chapathi dal", "roti and dal", "chapati and dal", "dal roti", "dal chapati", "chapathi paruppu", "chapati paruppu"], parts: [{ id: "chapati", grams: 80 }, { id: "dal", grams: 150 }], countable: "chapati" },
  { id: "chapati-egg", name: "Chapati with egg curry", aliases: ["chapati egg curry", "roti egg curry", "chapathi muttai", "chapati with egg", "roti with egg", "chapati egg", "roti egg", "chapati with egg curry", "chapathi egg curry"], parts: [{ id: "chapati", grams: 80 }, { id: "egg-curry", grams: 200 }], countable: "chapati" },
  { id: "chapati-chicken", name: "Chapati with chicken curry", aliases: ["chapati chicken", "roti chicken", "chapathi chicken", "chapati with chicken curry", "roti with chicken", "chapati chicken curry", "chicken chapati", "chicken roti", "chapathi chicken curry", "roti chicken curry", "chapati with chicken"], parts: [{ id: "chapati", grams: 80 }, { id: "chicken-curry", grams: 150 }], countable: "chapati" },
  { id: "dal-rice", name: "Dal rice", aliases: ["dal chawal", "paruppu sadam", "dal and rice", "dhal rice", "paruppu saadam", "rice dal", "dal chaval", "dal with rice", "dal rice", "rice with dal", "rice and dal", "rice dal sabzi", "dal rice sabzi"], parts: [{ id: "rice", grams: 200 }, { id: "dal", grams: 150 }] },
  { id: "rice-sambar-curd", name: "Rice with sambar & curd", aliases: ["rice sambar curd", "rice with sambar and curd", "sambar rice curd", "rice sambar and curd", "rice sambar thayir", "rice with sambar", "rice sambar", "sadam sambar", "rice and sambar", "rice with sambhar"], parts: [{ id: "rice", grams: 200 }, { id: "sambar", grams: 150 }, { id: "curd", grams: 50 }] },
  { id: "rice-rasam-plate", name: "Rice with rasam & poriyal", aliases: ["rice rasam", "rice with rasam", "rasam rice plate", "rice rasam poriyal", "rice and rasam", "rice rasam curd"], parts: [{ id: "rice", grams: 200 }, { id: "rasam", grams: 150 }, { id: "poriyal", grams: 80 }] },
  { id: "curd-rice-pickle", name: "Curd rice with pickle", aliases: ["curd rice pickle", "thayir sadam oorugai", "curd rice with pickle", "curd rice and pickle", "thayir sadam pickle"], parts: [{ id: "curd-rice", grams: 200 }, { id: "pickle", grams: 10 }] },
  { id: "chicken-rice-plate", name: "Rice with chicken curry", aliases: ["chicken rice plate", "rice with chicken curry", "rice and chicken", "chicken with rice", "rice chicken curry", "rice chicken", "chicken and rice", "rice with chicken", "chicken curry rice", "chicken curry and rice", "chicken kuzhambu rice", "chicken kuzhambu sadam"], parts: [{ id: "rice", grams: 250 }, { id: "chicken-curry", grams: 150 }] },
  { id: "fish-rice-plate", name: "Rice with fish curry", aliases: ["rice fish curry", "fish rice", "rice with fish curry", "rice and fish", "fish and rice", "rice with fish", "meen kuzhambu sadam", "fish curry rice", "fish curry and rice", "meen kuzhambu rice", "fish kuzhambu rice"], parts: [{ id: "rice", grams: 250 }, { id: "fish-curry", grams: 150 }] },
  { id: "mutton-rice-plate", name: "Rice with mutton curry", aliases: ["rice mutton curry", "mutton rice", "rice with mutton curry", "rice and mutton", "mutton and rice", "mutton curry rice", "mutton kuzhambu rice", "mutton kuzhambu sadam", "mutton curry and rice"], parts: [{ id: "rice", grams: 250 }, { id: "mutton-curry", grams: 150 }] },
  { id: "egg-rice-plate", name: "Rice with egg curry", aliases: ["rice egg curry", "rice with egg curry", "rice and egg", "egg curry rice", "rice with egg", "rice egg", "egg curry and rice", "egg kuzhambu rice"], parts: [{ id: "rice", grams: 250 }, { id: "egg-curry", grams: 200 }] },
  { id: "rice-sambar-plate", name: "South Indian meals", aliases: ["meals", "full meals", "south indian meals", "thali", "veg meals", "sapadu", "saapadu", "lunch meals", "veg thali", "mini meals", "rice meals", "banana leaf meals", "unlimited meals", "meals plate", "veg lunch", "meals rice sambar rasam", "hotel meals", "mess meals"], parts: [{ id: "rice", grams: 250 }, { id: "sambar", grams: 120 }, { id: "rasam", grams: 100 }, { id: "poriyal", grams: 70 }, { id: "curd", grams: 60 }, { id: "papad", grams: 12 }] },
  { id: "nonveg-meals", name: "Non-veg meals", aliases: ["non veg meals", "nonveg meals", "chicken meals", "mutton meals", "fish meals", "nonveg thali", "chicken curry meals", "non-veg lunch", "nonveg lunch", "chicken lunch", "fish curry meals", "meen kuzhambu meals", "non veg thali", "chicken thali", "non veg lunch"], parts: [{ id: "rice", grams: 250 }, { id: "chicken-curry", grams: 150 }, { id: "rasam", grams: 100 }, { id: "poriyal", grams: 60 }, { id: "curd", grams: 50 }] },
  { id: "egg-toast", name: "Eggs with toast", aliases: ["egg bread", "bread and egg", "toast and eggs", "eggs with bread", "bread with egg", "egg and bread", "eggs toast", "boiled egg bread", "bread egg", "egg toast", "eggs and toast", "boiled eggs with bread", "eggs with toast"], parts: [{ id: "egg", grams: 100 }, { id: "bread", grams: 50 }], countable: "egg" },
  { id: "oats-fruit", name: "Oats with fruit & nuts", aliases: ["oats banana", "oats with banana", "overnight oats", "oats fruits", "oats nuts", "oats with fruits", "oats with nuts", "oats and banana", "fruit oats", "oats with milk and banana", "oats banana nuts"], parts: [{ id: "oats", grams: 250 }, { id: "banana", grams: 100 }, { id: "mixed-nuts", grams: 15 }] },
  { id: "bread-omelette-tea", name: "Bread omelette & tea", aliases: ["bread omelette tea", "bread omelette and tea", "omelette bread tea", "bread omelette with tea", "bread omelette chai"], parts: [{ id: "bread-omelette", grams: 150 }, { id: "tea", grams: 120 }] },
  { id: "kothu-egg", name: "Egg kothu parotta", aliases: ["egg kothu parotta", "muttai kothu", "egg kothu", "muttai kothu parotta", "kothu parotta egg", "egg kothu porotta"], parts: [{ id: "kothu-parotta", grams: 300 }, { id: "egg", grams: 50 }] },
];

export const COMBO_BY_ID: Record<string, Combo> = Object.fromEntries(COMBOS.map((c) => [c.id, c]));

export type Macros = { kcal: number; proteinG: number; carbsG: number; fatG: number };

export function macrosFor(food: Food, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: Math.round(food.per100.kcal * k),
    proteinG: Math.round(food.per100.protein * k * 10) / 10,
    carbsG: Math.round(food.per100.carbs * k * 10) / 10,
    fatG: Math.round(food.per100.fat * k * 10) / 10,
  };
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                      */
/* ------------------------------------------------------------------ */

const STOP = new Set(["a", "an", "the", "of", "some", "with", "and", "plus", "had", "ate", "eat", "for", "my", "i", "me", "in", "at", "along", "then", "also", "little", "bit", "small", "big", "large", "medium", "regular", "hot", "cold", "fresh", "homemade", "home", "made", "full", "after", "before", "post", "pre", "gym", "workout", "today", "yesterday", "tonight", "office", "canteen", "hotel", "mess", "outside", "just", "only", "again", "morn", "time", "later", "now", "about", "around", "approx", "roughly", "nearly"]);

export function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9%.+&/,;\s-]/g, " ")
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
}

function singular(w: string): string {
  if (w.length <= 3) return w;
  if (/(ies)$/.test(w)) return w.replace(/ies$/, "y");
  if (/(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
  if (/s$/.test(w) && !/ss$/.test(w) && !/us$/.test(w)) return w.slice(0, -1);
  return w;
}

/** Tokens for matching: lower-case, singular, common spelling folds. */
function tokens(s: string): string[] {
  return normalise(s)
    .split(" ")
    .filter(Boolean)
    .map(singular)
    .map(fold);
}

/** Fold common transliteration variants onto one spelling. */
function fold(w: string): string {
  return w
    .replace(/^idly$/, "idli")
    .replace(/^dosai$/, "dosa")
    .replace(/^thosai$/, "dosa")
    .replace(/^sambhar$/, "sambar")
    .replace(/^sambaar$/, "sambar")
    .replace(/^saambar$/, "sambar")
    .replace(/^vadai$/, "vada")
    .replace(/^vade$/, "vada")
    .replace(/^porotta$/, "parotta")
    .replace(/^barotta$/, "parotta")
    .replace(/^parota$/, "parotta")
    .replace(/^kulambu$/, "kuzhambu")
    .replace(/^kolambu$/, "kuzhambu")
    .replace(/^kuzambu$/, "kuzhambu")
    .replace(/^biriyani$/, "biryani")
    .replace(/^briyani$/, "biryani")
    .replace(/^chapathi$/, "chapati")
    .replace(/^chappathi$/, "chapati")
    .replace(/^chapatti$/, "chapati")
    .replace(/^sapathi$/, "chapati")
    .replace(/^puri$/, "poori")
    .replace(/^uppuma$/, "upma")
    .replace(/^uppumavu$/, "upma")
    .replace(/^thair$/, "thayir")
    .replace(/^kaapi$/, "coffee")
    .replace(/^kapi$/, "coffee")
    .replace(/^coffe$/, "coffee")
    .replace(/^cofee$/, "coffee")
    .replace(/^chai$/, "tea")
    .replace(/^chaya$/, "tea")
    .replace(/^muttai$/, "egg")
    .replace(/^mutta$/, "egg")
    .replace(/^anda$/, "egg")
    .replace(/^saadam$/, "sadam")
    .replace(/^sadham$/, "sadam")
    .replace(/^choru$/, "rice")
    .replace(/^annam$/, "rice")
    .replace(/^sadam$/, "rice")
    .replace(/^omelet$/, "omelette")
    .replace(/^omlet$/, "omelette")
    .replace(/^omelete$/, "omelette")
    .replace(/^moru$/, "mor")
    .replace(/^chaas$/, "buttermilk")
    .replace(/^chas$/, "buttermilk")
    .replace(/^majjiga$/, "buttermilk")
    .replace(/^kadala$/, "kadalai")
    .replace(/^yoghurt$/, "curd")
    .replace(/^yogurt$/, "curd")
    .replace(/^dahi$/, "curd")
    .replace(/^thayir$/, "curd")
    .replace(/^chicken$/, "chicken")
    .replace(/^kozhi$/, "chicken")
    .replace(/^aatu$/, "mutton")
    .replace(/^aattu$/, "mutton")
    .replace(/^meen$/, "fish")
    .replace(/^eral$/, "prawn")
    .replace(/^shrimp$/, "prawn")
    .replace(/^paal$/, "milk")
    .replace(/^pal$/, "milk")
    .replace(/^ladoo$/, "laddu")
    .replace(/^laddoo$/, "laddu")
    .replace(/^jamoon$/, "jamun")
    .replace(/^kichadi$/, "kichadi");
}

/* ------------------------------------------------------------------ */
/* Index                                                              */
/* ------------------------------------------------------------------ */

type Entry = { kind: "food" | "combo"; food?: Food; combo?: Combo; id: string; key: string; toks: string[] };

const INDEX: Entry[] = [
  ...FOODS.flatMap((food) =>
    [food.name, ...food.aliases].map((k) => {
      const toks = tokens(k).filter((t) => !STOP.has(t));
      return { kind: "food" as const, food, id: food.id, key: toks.join(" "), toks };
    }),
  ).filter((e) => e.toks.length),
  ...COMBOS.flatMap((combo) =>
    [combo.name, ...combo.aliases].map((k) => {
      const toks = tokens(k).filter((t) => !STOP.has(t));
      return { kind: "combo" as const, combo, id: combo.id, key: toks.join(" "), toks };
    }),
  ).filter((e) => e.toks.length),
];

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  const t = ` ${s} `;
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const A = bigrams(a);
  const B = bigrams(b);
  let hit = 0;
  A.forEach((g) => {
    if (B.has(g)) hit++;
  });
  return (2 * hit) / (A.size + B.size);
}

export type Match = { kind: "food" | "combo"; food?: Food; combo?: Combo; id: string; score: number; matchedKey: string };

/**
 * Best food (or combo) for a phrase. Exact alias → 1.0; every token of the
 * phrase inside an alias or vice versa → 0.8–0.98; else string similarity.
 * Returns null below 0.72 so nonsense never lands on a random food.
 */
export function matchFood(phrase: string): Match | null {
  const toks = tokens(phrase).filter((t) => !STOP.has(t));
  if (!toks.length) return null;
  const key = toks.join(" ");
  if (toks.length === 1 && key in AMBIGUOUS && FOOD_BY_ID[AMBIGUOUS[key]]) {
    const food = FOOD_BY_ID[AMBIGUOUS[key]];
    const exact = [food.name, ...food.aliases].some((a) => tokens(a).filter((t) => !STOP.has(t)).join(" ") === key);
    return { kind: "food", food, id: food.id, score: exact ? 1 : 0.8, matchedKey: key };
  }
  let best: Match | null = null;
  const consider = (m: Match) => {
    if (!best || m.score > best.score || (m.score === best.score && m.matchedKey.length > best.matchedKey.length)) best = m;
  };
  const mk = (e: Entry, score: number): Match => ({ kind: e.kind, food: e.food, combo: e.combo, id: e.id, score, matchedKey: e.key });

  for (const e of INDEX) if (e.key === key) return mk(e, 1);

  for (const e of INDEX) {
    const all = e.toks.every((t) => toks.includes(t));
    const rev = toks.every((t) => e.toks.includes(t));
    if (all && rev) consider(mk(e, 0.98));
    else if (all) consider(mk(e, 0.85 + Math.min(0.1, 0.03 * e.toks.length))); // alias inside the phrase
    else if (rev) consider(mk(e, 0.8 - 0.02 * (e.toks.length - toks.length))); // phrase inside the alias — weaker
  }
  if (best && (best as Match).score >= 0.85) return best;

  for (const e of INDEX) {
    const sc = dice(key, e.key);
    if (sc >= 0.72) consider(mk(e, Math.min(0.84, sc)));
  }
  return best;
}

const NUM_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, dozen: 12,
  half: 0.5, quarter: 0.25, "a-half": 0.5, "one-and-a-half": 1.5, "one-and-half": 1.5, "1-and-a-half": 1.5, double: 2, single: 1, couple: 2, few: 3,
  // Tamil
  onnu: 1, onu: 1, oru: 1, oru_: 1, rendu: 2, rendu_: 2, moonu: 3, moon: 3, moonnu: 3, naalu: 4, nalu: 4, anju: 5, aaru: 6, ara: 0.5, arai: 0.5, konjam: 0.5, kaal: 0.25,
  // Hindi
  ek: 1, do: 2, teen: 3, char: 4, aadha: 0.5, adha: 0.5,
};

type Unit = { g?: number; ml?: number; kind: "piece" | "cup" | "katori" | "glass" | "plate" | "bowl" | "spoon" | "grams" | "ml" | "scoop" | "ladle" | "slice" | "handful" | "packet" | "peg" | "can" };
const UNITS: Record<string, Unit> = {
  piece: { kind: "piece" }, pieces: { kind: "piece" }, pc: { kind: "piece" }, pcs: { kind: "piece" }, nos: { kind: "piece" }, no: { kind: "piece" }, numbers: { kind: "piece" }, number: { kind: "piece" },
  cup: { kind: "cup", g: 150 }, cups: { kind: "cup", g: 150 }, tumbler: { kind: "cup", g: 120 },
  katori: { kind: "katori", g: 150 }, katoris: { kind: "katori", g: 150 }, kinnam: { kind: "katori", g: 150 },
  bowl: { kind: "bowl", g: 150 }, bowls: { kind: "bowl", g: 150 },
  glass: { kind: "glass", g: 250 }, glasses: { kind: "glass", g: 250 },
  plate: { kind: "plate", g: 250 }, plates: { kind: "plate", g: 250 }, "half-plate": { kind: "plate", g: 125 },
  spoon: { kind: "spoon", g: 15 }, spoons: { kind: "spoon", g: 15 }, tbsp: { kind: "spoon", g: 15 }, tablespoon: { kind: "spoon", g: 15 }, tablespoons: { kind: "spoon", g: 15 },
  tsp: { kind: "spoon", g: 5 }, teaspoon: { kind: "spoon", g: 5 }, teaspoons: { kind: "spoon", g: 5 },
  ladle: { kind: "ladle", g: 60 }, ladles: { kind: "ladle", g: 60 }, karandi: { kind: "ladle", g: 60 },
  scoop: { kind: "scoop", g: 30 }, scoops: { kind: "scoop", g: 30 },
  slice: { kind: "slice", g: 25 }, slices: { kind: "slice", g: 25 },
  handful: { kind: "handful", g: 30 }, handfuls: { kind: "handful", g: 30 }, fistful: { kind: "handful", g: 30 },
  packet: { kind: "packet", g: 30 }, packets: { kind: "packet", g: 30 }, pack: { kind: "packet", g: 30 },
  peg: { kind: "peg", g: 60 }, pegs: { kind: "peg", g: 60 },
  can: { kind: "can", g: 300 }, cans: { kind: "can", g: 300 }, bottle: { kind: "can", g: 300 }, bottles: { kind: "can", g: 300 },
  g: { kind: "grams", g: 1 }, gm: { kind: "grams", g: 1 }, gms: { kind: "grams", g: 1 }, gram: { kind: "grams", g: 1 }, grams: { kind: "grams", g: 1 }, kg: { kind: "grams", g: 1000 },
  ml: { kind: "ml", ml: 1 }, litre: { kind: "ml", ml: 1000 }, liter: { kind: "ml", ml: 1000 }, l: { kind: "ml", ml: 1000 },
};

const MEAL_WORDS: Record<string, "breakfast" | "lunch" | "snacks" | "dinner"> = {
  breakfast: "breakfast", tiffin: "breakfast", morning: "breakfast", kaalai: "breakfast", brunch: "breakfast",
  lunch: "lunch", afternoon: "lunch", saapadu: "lunch", sapadu: "lunch", madhiyam: "lunch",
  snack: "snacks", snacks: "snacks", evening: "snacks", "4pm": "snacks", teatime: "snacks", "tea-time": "snacks",
  dinner: "dinner", night: "dinner", supper: "dinner", raathiri: "dinner", rathiri: "dinner",
};

export type ParsedItem = {
  name: string;
  foodId: string;
  grams: number;
  portionLabel: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  confidence: number;
  source: "table";
  needsConfirm: boolean;
  estimate: boolean;
  /** what the member typed for this item */
  raw: string;
};

export type ParseResult = {
  items: ParsedItem[];
  /** fragments nothing in the table matched — these go to the model */
  unmatched: string[];
  mealSlot?: "breakfast" | "lunch" | "snacks" | "dinner";
};

/** Is this word a quantity here? Big bare numbers ("chicken 65", "5 star") are names, not counts. */
function isQtyWord(w: string, next: string | undefined): boolean {
  if (/^\d+(\.\d+)?(g|gm|gms|ml|kg|l|pcs|pc|nos|no)$/.test(w)) return true;
  const n = parseNumber(w);
  if (n === null) return false;
  if (n > 20 && !(next !== undefined && next in UNITS)) return false;
  return true;
}

function parseNumber(w: string): number | null {
  if (/^\d+(\.\d+)?$/.test(w)) return Number(w);
  if (/^\d+\/\d+$/.test(w)) {
    const [a, b] = w.split("/").map(Number);
    return b ? a / b : null;
  }
  if (/^\d+\.?5$/.test(w)) return Number(w);
  if (w in NUM_WORDS) return NUM_WORDS[w];
  return null;
}

/** Split free text into food fragments — commas, "and", "+", line breaks, and a number that starts a new item mid-line. */
export function splitFragments(text: string): string[] {
  const rough = normalise(text)
    .replace(/\b(and|plus|along with|then|also|followed by|n)\b/g, ",")
    .replace(/[+/]/g, ",")
    .replace(/\bfor (breakfast|lunch|dinner|snacks?|tiffin)\b/g, " $1 ")
    .split(/[,;.\n]|\s-\s/)
    .map((x) => x.trim())
    .filter(Boolean);

  // "kal dosa 3 egg curry" → "kal dosa 3" | "egg curry";  "2 idli 1 vada" → "2 idli" | "1 vada"
  const out: string[] = [];
  for (const frag of rough) {
    const ws = frag.split(" ");
    const isNum = (w: string, i?: number) => isQtyWord(w, i === undefined ? undefined : ws[i + 1]);
    const isWord = (c: string) => !isQtyWord(c, undefined) && !STOP.has(c) && !(c in UNITS);
    const leading = isNum(ws[0], 0);
    let cur: string[] = [];
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i];
      if (leading) {
        if (isNum(w, i) && i > 0 && cur.some(isWord)) {
          out.push(cur.join(" "));
          cur = [];
        }
        cur.push(w);
      } else {
        const prev = ws[i - 1];
        if (isNum(w, i) && i > 0 && STOP.has(prev) && i < ws.length - 1 && cur.some(isWord)) {
          // "chicken 65 with 2 parotta" → the 2 belongs to what follows
          cur.pop();
          out.push(cur.join(" "));
          cur = [w];
          continue;
        }
        cur.push(w);
        const nextIsUnit = ws[i + 1] !== undefined && ws[i + 1] in UNITS;
        if (isNum(w, i) && !nextIsUnit && i < ws.length - 1 && cur.some(isWord)) {
          out.push(cur.join(" "));
          cur = [];
        } else if (w in UNITS && i > 0 && isNum(ws[i - 1], i - 1) && i < ws.length - 1 && cur.slice(0, -2).some(isWord)) {
          out.push(cur.join(" "));
          cur = [];
        }
      }
    }
    if (cur.length) out.push(cur.join(" "));
  }
  return out.map((x) => x.trim()).filter(Boolean);
}

/**
 * "2 idli", "idli 2", "oru cup coffee", "150 g chicken", "half plate biryani",
 * "chicken curry 1 katori" → { qty, unit, rest }
 */
function readQuantity(fragment: string): { qty: number | null; unit: Unit | null; unitWord: string | null; rest: string } {
  const words = fragment.split(" ").filter(Boolean);
  let qty: number | null = null;
  let unit: Unit | null = null;
  let unitWord: string | null = null;
  const rest: string[] = [];

  // "1.5" written as "1 1/2" or "one and a half"
  const joined = fragment.replace(/\bone and a half\b/g, "1.5").replace(/\bone and half\b/g, "1.5").replace(/\b(\d+) and a half\b/g, (_, n) => String(Number(n) + 0.5)).replace(/\ba half\b/g, "0.5");
  const ws = joined.split(" ").filter(Boolean);

  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    // "150g", "250ml", "2pcs", "3nos"
    const m = w.match(/^(\d+(?:\.\d+)?)(g|gm|gms|ml|kg|l|pcs|pc|nos|no)$/);
    if (m && qty === null) {
      qty = Number(m[1]);
      unit = UNITS[m[2]];
      unitWord = m[2];
      continue;
    }
    const n = parseNumber(w);
    if (n !== null && qty === null && isQtyWord(w, ws[i + 1])) {
      qty = n;
      continue;
    }
    if (w in UNITS && !unit) {
      unit = UNITS[w];
      unitWord = w;
      continue;
    }
    rest.push(w);
  }
  void words;
  return { qty, unit, unitWord, rest: rest.join(" ") };
}

/** Grams for a matched food given what the member typed. */
export function gramsFor(food: Food, qty: number | null, unit: Unit | null): { grams: number; label: string } {
  const q = qty ?? 1;
  const fmtQ = (n: number) => (Number.isInteger(n) ? String(n) : n === 0.5 ? "½" : n === 0.25 ? "¼" : n === 1.5 ? "1½" : String(n));
  if (unit) {
    switch (unit.kind) {
      case "grams":
        return { grams: q * (unit.g ?? 1), label: `${q * (unit.g ?? 1)} g` };
      case "ml":
        return { grams: q * (unit.ml ?? 1), label: `${q * (unit.ml ?? 1)} ml` };
      case "piece":
        return { grams: q * food.portion.grams, label: `${fmtQ(q)} × ${food.portion.label.replace(/^1 /, "")}` };
      case "slice":
        return food.unit === "piece" ? { grams: q * food.portion.grams, label: `${fmtQ(q)} slice${q === 1 ? "" : "s"}` } : { grams: q * 25, label: `${fmtQ(q)} slice${q === 1 ? "" : "s"}` };
      case "scoop":
        return food.id === "whey" || food.id === "ice-cream" ? { grams: q * food.portion.grams, label: `${fmtQ(q)} scoop${q === 1 ? "" : "s"}` } : { grams: q * 30, label: `${fmtQ(q)} scoop` };
      case "handful":
      case "packet":
        return { grams: q * (food.category === "nuts" || food.category === "snack" ? food.portion.grams : unit.g ?? 30), label: `${fmtQ(q)} ${unit.kind}` };
      case "cup":
      case "katori":
      case "bowl":
      case "glass":
      case "plate":
      case "spoon":
      case "ladle":
      case "peg":
      case "can": {
        // If the food's own portion is that vessel, trust the food's portion size (a cup of rice = 150 g; a cup of coffee = 120 ml)
        const own = food.unit === unit.kind || (unit.kind === "cup" && food.unit === "cup") || (unit.kind === "bowl" && food.unit === "katori") || (unit.kind === "katori" && food.unit === "bowl");
        const g = own ? food.portion.grams : unit.g ?? food.portion.grams;
        return { grams: q * g, label: `${fmtQ(q)} ${unit.kind}${q <= 1 ? "" : "s"}` };
      }
    }
  }
  // No unit: count × the food's own portion ("2 idli", "2 rice" = 2 servings)
  const label = q === 1 ? food.portion.label : `${fmtQ(q)} × ${food.portion.label.replace(/^1 /, "")}`;
  return { grams: q * food.portion.grams, label };
}

function itemFrom(food: Food, grams: number, label: string, confidence: number, raw: string): ParsedItem {
  const mac = macrosFor(food, grams);
  return {
    name: food.name,
    foodId: food.id,
    grams: Math.round(grams),
    portionLabel: label,
    ...mac,
    confidence,
    source: "table",
    needsConfirm: confidence < 0.85,
    estimate: !!food.estimate,
    raw,
  };
}

/** Try the whole phrase; if weak and it has a "with", try the halves. */
function resolve(phrase: string): { match: Match; qty: number | null; unit: Unit | null; sub?: string }[] | null {
  const { qty, unit, rest } = readQuantity(phrase);
  if (!rest.trim()) return null;
  const whole = matchFood(rest);
  if (whole && whole.score >= 0.98) return [{ match: whole, qty, unit }];
  if (/\bwith\b/.test(phrase)) {
    const halves = phrase.split(/\bwith\b/).map((h) => h.trim()).filter(Boolean);
    const parts = halves.map((h) => {
      const q = readQuantity(h);
      return { sub: h, match: matchFood(q.rest || h), qty: q.qty, unit: q.unit };
    });
    if (parts.every((p) => p.match)) return parts as { match: Match; qty: number | null; unit: Unit | null; sub: string }[];
  }
  return whole ? [{ match: whole, qty, unit }] : null;
}

/**
 * Parse a whole line on-device. Everything that matches the table comes back
 * as an item with numbers; the rest is returned in `unmatched` for the API.
 */
export function parseLocal(text: string): ParseResult {
  const items: ParsedItem[] = [];
  const unmatched: string[] = [];
  let mealSlot: ParseResult["mealSlot"];

  // meal words anywhere set the slot
  for (const w of Object.keys(MEAL_WORDS)) {
    if (new RegExp(`\\b${w}\\b`).test(normalise(text))) {
      mealSlot = MEAL_WORDS[w];
      break;
    }
  }

  const fromCombo = new Set<string>();
  for (const raw of splitFragments(text)) {
    const clean = raw
      .split(" ")
      .filter((w) => !(w in MEAL_WORDS))
      .join(" ")
      .trim();
    if (!clean) continue;
    if (!tokens(clean).filter((t) => !STOP.has(t)).length) continue;

    const resolved = resolve(clean);
    if (!resolved) {
      unmatched.push(raw);
      continue;
    }
    for (const r of resolved) {
      const confidence = Math.round(r.match.score * 100) / 100;
      const rawPart = r.sub ?? raw;
      if (r.match.kind === "combo" && r.match.combo) {
        const combo = r.match.combo;
        const q = r.qty ?? 1;
        for (const part of combo.parts) {
          const food = FOOD_BY_ID[part.id];
          if (!food) continue;
          let grams = part.grams;
          if (combo.countable === part.id && r.qty !== null) grams = q * food.portion.grams;
          else if (r.unit && r.unit.kind === "plate" && combo.countable === undefined) grams = part.grams * q * ((r.unit.g ?? 250) / 250);
          const count = Math.round((grams / food.portion.grams) * 10) / 10;
          const label = food.unit === "piece" ? `${count} × ${food.portion.label.replace(/^1 /, "")}` : count === 1 ? food.portion.label : `${grams} g`;
          fromCombo.add(food.id);
          items.push(itemFrom(food, grams, label, confidence, rawPart));
        }
      } else if (r.match.food) {
        // "3 idli with sambar, chutney" — the combo already brought chutney; don't count it twice
        if (r.qty === null && !r.unit && fromCombo.has(r.match.food.id)) continue;
        const { grams, label } = gramsFor(r.match.food, r.qty, r.unit);
        items.push(itemFrom(r.match.food, grams, label, confidence, rawPart));
      }
    }
  }
  return { items, unmatched, mealSlot };
}

/** Meal slot from the clock, for when the text doesn't say. */
export function slotForHour(h: number): "breakfast" | "lunch" | "snacks" | "dinner" {
  if (h >= 5 && h <= 10) return "breakfast";
  if (h >= 11 && h <= 15) return "lunch";
  if (h >= 16 && h <= 18) return "snacks";
  return "dinner";
}

/** Suggestions for the "swap" control: same category, best first. */
export function similarFoods(food: Food, n = 5): Food[] {
  return FOODS.filter((f) => f.category === food.category && f.id !== food.id)
    .map((f) => ({ f, s: dice(f.name.toLowerCase(), food.name.toLowerCase()) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.f);
}

/** Type-ahead: foods whose name or alias starts with / contains the query. */
export function searchFoods(q: string, n = 8): Food[] {
  const key = tokens(q).join(" ");
  if (!key) return [];
  const seen = new Set<string>();
  const out: Food[] = [];
  for (const e of INDEX) {
    if (e.kind !== "food" || !e.food || seen.has(e.food.id)) continue;
    if (e.key.startsWith(key) || e.key.includes(` ${key}`)) {
      seen.add(e.food.id);
      out.push(e.food);
      if (out.length >= n) break;
    }
  }
  return out;
}
