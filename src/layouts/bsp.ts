import { Ori, Rect } from "../rect";
import { QRect } from "../types/qt";
import { Window } from "../window";

export function findLastIndex<T>(array: Array<T>, callback: (value: T, index: number, obj: T[]) => boolean): number {
  let l = array.length;
  while (l--) {
    if (callback(array[l], l, array)) return l;
  }
  return -1;
}

export class BSPLayout {
  rect: Rect;

  root: Node;
  branches: Array<Node>;
  leaves: Array<Node> = [];

  constructor(rect: Rect) {
    this.rect = rect;
    this.root = new Node(rect);
    this.leaves.push(this.root);
  }

  traverse = (node: Node, cb: (node: Node) => void) => {
    cb(node);

    let i = 0;
    while (node.children[i]) {
      this.traverse(node.children[i], cb);
      i++;
    }
  };

  tileWindows = (windows: Array<Window>) => {
    // Adds missing leaves
    for (var i = 0; i < windows.length - this.leaves.length; i++) {
      // TODO: LAST WITH LOWEST DEPTH
      const node = this.leaves[this.leaves.length - 1];
      this.leaves.splice(-1, 1);
      node.addChild();
      this.leaves.push(node.children[0], node.children[1]);
    }

    // Removes excess leaves
    if (this.leaves.length > 1) {
      for (var i = 0; i < this.leaves.length - windows.length; i++) {
        const node = this.leaves[this.leaves.length - 1];
        this.leaves.splice(-2, 2);
        this.leaves.push(node.parent);
      }
    }

    windows.forEach((window, i) => {
      window.setFrameGeometry(this.leaves[i].rect);
    });
  };
}

export class Node {
  id: string;

  rect: Rect;

  parent: Node | undefined;
  children: [Node, Node];

  depth: number;

  constructor(rect: Rect, parent?: Node) {
    this.rect = rect;

    this.parent = parent;
    this.depth = this.parent ? this.parent.depth + 1 : 0;
  }

  addChild = () => {
    const rects = this.rect.split(Ori.V);
    this.children = [new Node(rects[0], this), new Node(rects[1], this)];
  };
}
