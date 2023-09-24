import { FileStoreIndex, type IndexKey } from "./FileStoreIndex.js";
import { FileStore } from "./FileStore.js";

export class Store {
  index = new FileStoreIndex();
  fileStore: FileStore;

  constructor(private readonly dir: string) {
    this.fileStore = new FileStore(this.dir);
  }

  store(word: string, count: number) {
    const newValue = `${word}=${count}`;
    const indexKey = this.fileStore.write(newValue);
    this.index.add(indexKey, word);
  }

  getCount(word: string): number {
    const key = this.index.get(word) as IndexKey;
    if (!key) return 0;
    const entry = this.fileStore.readEntry(key);
    return parseInt(entry.split("=")[1]);
  }

  getAllCounts(): Map<string, number> {
    const words = new Set(
      this.index.segments.flatMap((segment) => Array.from(segment.keys()))
    );

    return Array.from(words).reduce((acc, word) => {
      acc.set(word, this.getCount(word));
      return acc;
    }, new Map<string, number>());
  }

  increment(word: string): number {
    const count = this.getCount(word) + 1;
    this.store(word, count);
    return count;
  }
}
