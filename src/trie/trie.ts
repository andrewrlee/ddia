import readline from "node:readline";

class TNode {
  constructor(
    public readonly char: string,
    public readonly children: TNode[] = []
  ) {}

  add([next, ...tail]: string[]) {
    let childToAdd: TNode | undefined = this.children.find(
      (c) => c.char == next
    );

    if (!childToAdd) {
      childToAdd = new TNode(next);
      this.children.push(childToAdd);
    }

    if (tail.length) {
      childToAdd.add(tail);
    }
  }

  contains(word: string): boolean {
    return this.children.some((c) => c._contains([...word, "*"]));
  }

  private _contains([next, ...rest]: string[]): boolean {
    if (this.char !== next) {
      return false;
    }
    if (!rest.length) {
      return true;
    }
    return this.children.some((c) => c._contains(rest));
  }
}

const printTrie = (node: TNode): any[] => {
  return [node.char, node.children.map((c) => printTrie(c))];
};

const printRadix = (node: TNode): any => {
  const r = node.char === "ROOT" ? [] : [node.char];

  let child = node;
  while (child.children.length === 1) {
    child = child.children[0];
    r.push(child.char);
  }

  const [isTerminal, children] = child.children.reduce(
    (arr, c) => {
      const [isTerm, prev] = arr;
      const isTerminal = c.char == "*";
      if (!isTerminal) prev.push(printRadix(c));
      return [isTerminal || isTerm, prev];
    },
    [false, []] as [isTerminal: boolean, cs: any[]]
  );

  if (isTerminal) {
    r.push("*");
  }
  return [...(r.length ? [r.join("")] : []), ...children];
};

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
  });

  const root = new TNode("ROOT");

  for await (const line of rl) {
    const chars = [...line.split(""), "*"];
    root.add(chars);
  }

  const radix = printRadix(root);
  console.log(JSON.stringify(radix, null, 2));

  console.log(`'integer' is contained: ${root.contains("integer")}`);
  console.log(`'integ' is contained: ${root.contains("integ")}`);
  console.log(`'bob' is contained: ${root.contains("bob")}`);
  console.log(`'string' is contained: ${root.contains("string")}`);
  console.log(`'stringe' is contained: ${root.contains("stringe")}`);
  console.log(`'stringer' is contained: ${root.contains("stringer")}`);
}

main();
