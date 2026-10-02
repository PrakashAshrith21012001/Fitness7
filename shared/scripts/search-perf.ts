import { searchFood } from "../food-search";
const qs = ["i", "id", "idl", "idli", "c", "ch", "chi", "chic", "chick", "chicke", "chicken", "chicken b", "chicken bir", "chicken biry", "chicken biryani", "p", "pa", "pan", "pane", "paneer", "paneer bu", "paneer butter", "dossa", "panner butter masala", "parleg", "high protein snacks"];
let t = Date.now(); searchFood("warm up"); console.log("build", Date.now() - t, "ms");
t = Date.now(); for (let r = 0; r < 5; r++) for (const q of qs) searchFood(q + (r ? " ".repeat(0) : "")); console.log("per keystroke", ((Date.now() - t) / (qs.length * 5)).toFixed(2), "ms");
