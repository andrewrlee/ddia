import fs from "fs";
import path from "path";

export async function findAllFiles(dir: string): Promise<string[]> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  const files: string[][] = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? findAllFiles(res) : [res];
    })
  );
  return files.flat();
}

export enum Colour {
  DIM_WHITE = "\u001b[2;37m",
  WHITE = "\u001b[1;37m",
  RED = "\u001b[1;31m",
  GREEN = "\u001b[0;32m",
}

export const colour = (colour: Colour, text: string) => {
  return process.env.DISABLE_ANSI_COLOURS === "true"
    ? text
    : `${colour}${text}\u001b[0m`;
};

export const extractTestName = (s: string) => {
  const result = s.substring(4).replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};
