import fs from "fs";
import type { IndexKey } from "./FileStoreIndex.js";

export class FileStore {
  static MAX_SEGMENT_SIZE = 1024;
  currentSegment = 0;
  currentFd: number | undefined = undefined;
  segmentReadFds = new Map<number, number>();
  filePos = 0;

  constructor(private readonly dir: string) {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  delete() {
    fs.rmSync(this.dir, { recursive: true, force: true });
  }

  private getSegmentFileName(num: number) {
    return `${this.dir}/segment-${num}`;
  }

  async open() {
    const nextSegmentName = this.getSegmentFileName(this.currentSegment);
    this.currentFd = fs.openSync(nextSegmentName, "a");
    this.filePos = fs.statSync(nextSegmentName).size;
    const readFd = fs.openSync(nextSegmentName, "r");
    this.segmentReadFds.set(this.currentSegment, readFd);
  }

  write(entry: string): IndexKey {
    if (!this.currentFd) {
      this.open();
    }
    const position: IndexKey = [this.currentSegment, this.filePos];

    const sizeBuff = Buffer.alloc(2);
    sizeBuff.writeInt16BE(Buffer.byteLength(entry, "utf8"));
    const inputBuff = Buffer.from(entry);

    this.filePos += fs.writeSync(
      this.currentFd as number,
      Buffer.concat([sizeBuff, inputBuff])
    );

    if (this.filePos > FileStore.MAX_SEGMENT_SIZE) {
      this.currentSegment += 1;
      fs.closeSync(this.currentFd as number);
      this.open();
    }
    return position;
  }

  readEntry([segmentNum, pos]: IndexKey): string {
    const fd = this.segmentReadFds.get(segmentNum) as number;

    const CHUNK_SIZE = 2;
    const sizeBuff = Buffer.alloc(CHUNK_SIZE);

    const sizeLength = fs.readSync(fd, sizeBuff, 0, CHUNK_SIZE, pos);
    const size = sizeBuff.readInt16BE();

    const entryBuff = Buffer.alloc(size, undefined, "utf8");
    fs.readSync(fd, entryBuff, 0, size, pos + sizeLength);
    return entryBuff.toString();
  }

  scan(segmentNum: number): Array<string> {
    const result: string[] = [];
    const fd = this.segmentReadFds.get(segmentNum) as number;
    let pos = 0;
    const fileLength = fs.statSync(this.getSegmentFileName(segmentNum)).size;
    while (pos < fileLength) {
      const CHUNK_SIZE = 2;
      const sizeBuff = Buffer.alloc(CHUNK_SIZE);

      const sizeLength = fs.readSync(fd, sizeBuff, 0, CHUNK_SIZE, pos);
      const size = sizeBuff.readInt16BE();

      const entryBuff = Buffer.alloc(size, undefined, "utf8");
      const entryLength = fs.readSync(fd, entryBuff, 0, size, pos + sizeLength);
      pos += entryLength + sizeLength;
      result.push(entryBuff.toString());
    }
    return result;
  }
}
