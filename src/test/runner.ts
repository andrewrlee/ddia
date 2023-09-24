import path from "path";
import { extractTestName, findAllFiles, colour, Colour } from "./utils.js";

const reportErrorStatus = process.env.REPORT_ERROR_STATUS !== "false";
const tests = await gatherTestModules();

tests.forEach(([modName, mod]) => {
  console.log(colour(Colour.WHITE, modName));

  let count = 0;
  let errorCount = 0;
  let success = true;

  gatherTests(mod).forEach(([name, prop]) => {
    getBeforeEach(mod)?.();
    count++;
    if (!runTest(name, prop)) {
      errorCount++;
      success = false;
    }
  });

  console.log(
    colour(
      !success ? Colour.RED : Colour.GREEN,
      `\n\t*** ${
        success ? "SUCCESS" : "FAILURE"
      }: ${errorCount}/${count} TESTS FAILED! ***\n`
    )
  );
  if (reportErrorStatus) {
    process.exitCode = success ? 0 : 1;
  }
});

async function gatherTestModules() {
  return await Promise.all(
    (await findAllFiles("."))
      .filter((f) => f.endsWith(".test.ts"))
      .map((modName) =>
        import(modName).then((mod) => [path.basename(modName), mod])
      )
  );
}

function gatherTests(mod: any): Array<[name: string, f: Function]> {
  return Object.entries(mod).filter(
    ([name, prop]) => name.startsWith("test") && typeof prop === "function"
  ) as Array<[name: string, f: Function]>;
}

function getBeforeEach(mod: any): Function | undefined {
  const result = Object.entries(mod).find(
    ([name, prop]) => name === "beforeEach" && typeof prop === "function"
  );

  return result?.[1] as Function;
}

function runTest(testName: string, prop: Function) {
  const name = colour(Colour.DIM_WHITE, `* ${extractTestName(testName)}`);
  try {
    prop();
    console.info(`${name}: ${colour(Colour.GREEN, `SUCCESS`)}`);
  } catch (e: any) {
    console.error(`${name}: ${colour(Colour.RED, `FAIL! (${e.message})`)}`);
    return false;
  }
  return true;
}

export {};
