import { Ori, Rect } from "../rect";
import { QRect } from "../types/qt";
import { Window } from "../window";

const find = (node: Node, cb: (node: Node) => boolean) => {
  if (node) {
    if (cb(node)) return;
    find(node.left, cb);
    find(node.right, cb);
  }
};

export class BSPLayout {
  log = () => {
    const nodes = [];
    find(this.root, (node) => {
      nodes.push(node.id);
      return false;
    });

    console.log(nodes.toString());
  };

  rect: Rect;

  root: Node;
  leaves: Array<Node> = [];

  windows: Array<Window> = [];

  constructor(rect: Rect) {
    this.rect = rect;
    this.root = new Node(rect);
    this.leaves.push(this.root);
  }

  /**
   * Finds a {@link Window} to split.
   * @param windows Array of {@link Window|Windows} to search
   * @returns Index of `windows` to split (interchangeable with `this.leaves` indexing)
   */
  indexToSplit = (windows: Array<Window>) => {
    let firstMatch = false;
    let i = -1;

    workspace.stackingOrder
      .slice()
      .reverse()
      .some((kwinWindow) => {
        const secondMatch = firstMatch;
        const j = windows.findIndex((window) => {
          return window.kwin.internalId === kwinWindow.internalId;
        });
        firstMatch = j > -1;
        if (secondMatch && firstMatch) i = j;
        return secondMatch && firstMatch;
      });

    return i;
  };

  /**
   * Finds a {@link Window} to remove.
   * @param windows Array of {@link Window|Windows} to search
   * @returns Index of `windows` to remove (interchangeable with `this.leaves` indexing)
   */
  indexToRemove = (windows: Array<Window>) => {
    let i = -1;

    this.windows.some((window, j) => {
      if (windows.includes(window)) return false;
      i = j;
      return true;
    });

    return i;
  };

  tileWindows = (windows: Array<Window>) => {
    /**
     * Adds missing leaves.
     */
    for (var i = 0; i < windows.length - this.leaves.length; i++) {
      const index = this.indexToSplit(windows);
      this.addLeaves(index);
    }

    /**
     * Removes excess leaves.
     */
    if (this.leaves.length > 1) {
      for (var i = 0; i < this.leaves.length - windows.length; i++) {
        const index = this.indexToRemove(windows);
        this.removeLeaf(index);
      }
    }

    /**
     * Applies leaves' {@link Rect|Rects} to {@link Window|Windows}.
     */
    windows.forEach((window, i) => {
      window.setFrameGeometry(this.leaves[i].rect);
    });

    this.windows = windows;
  };

  addLeaves = (index: number) => {
    if (index < 0) index = this.leaves.length + index; // -1 = this.leaves.length - 1
    const branch = this.leaves[index];
    const rects = branch.rect.split(Ori.V);

    branch.left = new Node(rects[0]);
    branch.right = new Node(rects[1]);

    this.leaves.splice(index, 1, branch.left);
    this.leaves.splice(this.leaves.length, 0, branch.right);
  };

  removeLeaf = (index: number) => {
    if (index < 0) index = this.leaves.length + index; // -1 = this.leaves.length - 1
    const removed = this.leaves.splice(index, 1)[0];

    let parent: Node;
    find(this.root, (node) => {
      if (node.left === removed || node.right === removed) {
        parent = node;
        return true;
      }
      return false;
    });

    const remaining = parent.left === removed ? parent.right : parent.left;
    parent.replaceWith(remaining, this.leaves);
  };
}

let nextNodeId = 0;
export class Node {
  /**
   * @property An increasing number used to identify {@link Node|Nodes} when debugging
   */
  id: number;

  rect: Rect;

  left: Node | undefined;
  right: Node | undefined;

  get leaf() {
    return !this.left;
  }

  constructor(rect: Rect) {
    this.id = nextNodeId++;
    this.rect = rect;
  }

  /**
   * Replaces `this` with `node`. Is a workaround for:
   *
   *
   *       grandparent.left/right = node
   *
   *
   * However, this is more efficient when `this` is already known and `grandparent` would require searching for.
   * @param node {@link Node} to replace `this` with
   * @mutates `this.id`, `this.left`, `this.right`
   */
  replaceWith = (node: Node, leaves: Array<Node>) => {
    this.id = node.id;
    this.left = node.left;
    this.right = node.right;

    if (node.leaf) {
      leaves.splice(leaves.indexOf(node), 1, this);
    } else {
      find(this, (node) => {
        if (!node.left || !node.right) return false;
        const rects = node.rect.split(Ori.V);
        node.left.rect = rects[0];
        node.right.rect = rects[1];
        return false;
      });
    }
  };
}
