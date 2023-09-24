const isNumberChar = (c: string) => c >= "0" && c <= "9";

/** Stores words and an associated an incrementing count in a string that represents an append-only log */
export class Store {
  /** Index to store latest pointers for each word */
  index = new Map<string, number>();
  /** The storage, just a simple string that is appended to for each new entry */
  storage = "";

  _store(word: string, count: number) {
    this.index.set(word, this.storage.length);

    const newValue = `${word}=${count}`;
    const length = `${newValue.length}`;
    this.storage += `${length}${newValue}`;
  }

  // Get current count
  getCount(word: string): number {
    const entry = this._getEntryForWord(word);
    return entry ? entry[1] : 0;
  }

  /** Perists word   */
  store(word: string) {
    this._store(word, this.getCount(word) + 1);
  }

  /** Reads entry from pointer and returns the pointer for the next entry */
  readEntry(pointer: number): [entry: string, pointer: number] {
    const buff: string[] = [];
    let curr = pointer;
    while (curr < this.storage.length) {
      const c = this.storage.charAt(curr);
      if (isNumberChar(c)) {
        // Build up string representing size of the entry...
        buff.push(c);
        curr++;
      } else {
        // ...then read entire entry up to the start of the next entry
        const length = parseInt(buff.join(""), 10);
        const start = pointer + buff.length;
        const end = pointer + buff.length + length;
        return [this.storage.substring(start, end), end];
      }
    }
    throw Error(`Out of range: ${pointer}`);
  }

  // Get entry for word
  _getEntryForWord(word: string): [word: string, count: number] | undefined {
    const pointer = this.index.get(word);
    if (pointer || pointer === 0) {
      const [entry] = this.readEntry(pointer);
      const [word, count] = entry.split("=");
      return [word, parseInt(count, 10)];
    }
    return undefined;
  }

  /** Iterates over storage, printing out each entry in turn */
  *scanIndex() {
    for (let pointer = 0; pointer < this.storage.length; ) {
      const [entry, nextPointer] = this.readEntry(pointer);
      const [word, count] = entry.split("=");
      yield { word, count };
      pointer = nextPointer;
    }
  }
}
