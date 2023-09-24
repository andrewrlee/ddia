import fs from "fs";
import { Store } from "./Store.js";

const words = fs
  .readFileSync("src/hashstore/randWords.txt")
  .toString()
  .split("\n")
  .filter((n) => n);

const randomWord = () => words[Math.floor(Math.random() * words.length)];

const dbDir = `./_db`;
fs.rmSync(dbDir, { recursive: true, force: true });
const store = new Store(dbDir);

for (let i = 0; i < 10000; i++) {
  const word = randomWord();
  store.increment(word);
}

const results = store.getAllCounts();

console.log(store.getCount("aaa"));

const results2 = store.getAllCounts();

results.forEach((v, k) => {
  console.log(`${k} : ${v} == ${results2.get(k)} (${v === results2.get(k)}))`);
});
