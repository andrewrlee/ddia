export const checkExactEquals = (actual: any, expected: any) => {
  if (expected !== actual) {
    throw new Error(`'${actual}' was not exactly '${expected}'`);
  }
};

export const checkEquals = (actual: unknown, expected: unknown) => {
  let act: string;
  let exp: string;

  if (actual instanceof Map && expected instanceof Map) {
    act = JSON.stringify(Array.from(actual.entries()));
    exp = JSON.stringify(Array.from(expected.entries()));
  } else {
    act = JSON.stringify(actual);
    exp = JSON.stringify(expected);
  }

  if (act != exp) {
    throw new Error(`'${act}' was not '${exp}'`);
  }
};
