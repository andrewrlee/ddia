import { type IndexKey } from "./FileStoreIndex.js";
import { Store } from "./Store.js";

export class Compactor {
  constructor(private readonly store: Store) {}

  getCompactRepresentation() {
    return this.store.index.segments
      .slice(0, -1)
      .reduce((acc, r, segNumber) => {
        Array.from(r.entries()).forEach(([word, pos]) =>
          acc.set(word, [segNumber, pos])
        );
        return acc;
      }, new Map<string, IndexKey>());
  }
}
