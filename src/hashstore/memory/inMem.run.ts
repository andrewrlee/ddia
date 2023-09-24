import { Store } from "./inMem.js";
import fs from "fs";

const words = fs
  .readFileSync("src/hashstore/randWords.txt")
  .toString()
  .split("\n")
  .filter((n) => n);

const randomWord = () => words[Math.floor(Math.random() * words.length)];

const store = new Store();

for (let i = 0; i < 200; i++) {
  const w = randomWord();
  store.store(w);
}

console.log(store.storage);

for (const entry of store.scanIndex()) {
  console.log(entry);
}
