export type IndexKey = [segment: number, position: number];

export class FileStoreIndex {
  segments: Map<string, number>[] = [];

  add([segment, position]: IndexKey, word: string) {
    if (!this.segments[segment]) {
      this.segments.push(new Map<string, number>());
    }
    this.segments[segment].set(word, position);
  }

  get(word: string): IndexKey | undefined {
    let segmentSearch = 0;
    for (let i = this.segments.length - 1; i >= 0; i--) {
      segmentSearch++;
      const pos = this.segments[i].get(word);
      if (pos || pos === 0) {
        console.log(`${segmentSearch} attempts and found`);
        return [i, pos];
      }
    }
    console.log(`${segmentSearch} attempts and not found`);
    return undefined;
  }
}
