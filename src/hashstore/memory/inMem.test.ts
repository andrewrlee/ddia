import { checkExactEquals, checkEquals } from "../../test/assertions.js";
import { Store } from "./inMem.js";

let store: Store;

export function beforeEach() {
  store = new Store();
}

export function testCorrectCountWhenWordIsNotInIndex() {
  const word = "aaaa";
  checkExactEquals(store.getCount(word), 0);
}

export function testCorrectCountWhenWordIsInIndex() {
  const word = "aaaa";
  store.store(word);
  checkExactEquals(store.getCount(word), 1);
}

export function testCorrectCountAfterStoredAFewTimes() {
  const word = "aaaa";
  store.store(word);
  store.store(word);
  store.store(word);
  checkExactEquals(store.getCount(word), 3);
}

export function testStorageOfSingleWord() {
  store.store("aaaa");
  checkExactEquals(store.storage, "6aaaa=1");
  checkEquals(store.index, new Map([["aaaa", 0]]));
}

export function testStorageOfMultipleWords() {
  store.store("a");
  store.store("bb");
  store.store("ccc");

  checkExactEquals(store.storage, "3a=14bb=15ccc=1");
  checkEquals(
    store.index,
    new Map([
      ["a", 0],
      ["bb", 4],
      ["ccc", 9],
    ])
  );
}

export function testCanCycleThroughEntriesByReadingPointers() {
  store.store("a");
  store.store("bb");
  store.store("ccc");
  store.store("a");

  let result: string;
  let nextPointer: number = 0;
  {
    [result, nextPointer] = store.readEntry(nextPointer);
    checkExactEquals(result, "a=1");
    checkExactEquals(nextPointer, 4);
  }

  {
    [result, nextPointer] = store.readEntry(nextPointer);
    checkExactEquals(result, "bb=1");
    checkExactEquals(nextPointer, 9);
  }

  {
    [result, nextPointer] = store.readEntry(nextPointer);
    checkExactEquals(result, "ccc=1");
    checkExactEquals(nextPointer, 15);
  }

  {
    [result, nextPointer] = store.readEntry(nextPointer);
    checkExactEquals(result, "a=2");
    checkExactEquals(nextPointer, 19);
  }
}

export function testCanScanThroughStorage() {
  store.store("a");
  store.store("bb");
  store.store("a");
  store.store("ccc");

  const gen = store.scanIndex();

  checkEquals(gen.next().value, { word: "a", count: "1" });
  checkEquals(gen.next().value, { word: "bb", count: "1" });
  checkEquals(gen.next().value, { word: "a", count: "2" });
  checkEquals(gen.next().value, { word: "ccc", count: "1" });
}
