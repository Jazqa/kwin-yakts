import { Ori, Rect } from "../rect";
import { QRect } from "../types/qt";
import { Window } from "../window";
import { Layout } from "./layout";

const log = (node: Node) => {
  const nodes = [];

  find(node, (node) => {
    nodes.push(node.id);
    return false;
  });

  console.log(nodes.toString());
};

const find = (node: Node, cb: (node: Node) => boolean) => {
  if (node) {
    if (cb(node)) return;
    find(node.left, cb);
    find(node.right, cb);
  }
};

const findParent = (root: Node, target: Node): Node => {
  let parent: Node;

  find(root, (node) => {
    if (node.left === target || node.right === target) {
      parent = node;
      return true;
    }
    return false;
  });

  return parent;
};

export class BSP extends Layout {
  name: string = "BSP";

  rect: Rect;

  root: Node;
  leaves: Array<Node>;

  constructor(rect: Rect) {
    super(rect);
    this.root = new Node(rect);
  }

  /**
   * Adds missing leaves.
   */
  addWindow = (window: Window, windows: Array<Window>, activeWindow?: Window) => {
    if (!this.leaves) {
      this.leaves = [this.root]; // First window takes root as a leaf!
    } else {
      const index = windows.indexOf(activeWindow);
      this.addLeaves(index);
    }
  };

  /**
   * Removes excess leaves.
   */
  removeWindow = (window: Window, windows: Array<Window>) => {
    if (this.leaves.length === 1) {
      this.leaves = undefined; // Last window, no leaves left!
    } else {
      const index = windows.indexOf(window);
      this.removeLeaf(index);
    }
  };

  resizeWindow = (window: Window, windows: Array<Window>, oldRect: QRect) => {
    const newRect = window.kwin.frameGeometry;

    const leaf = this.leaves[windows.indexOf(window)];
    const parent = findParent(this.root, leaf);
    const sibling = parent.left === leaf ? parent.right : parent.left;
    const side = parent.left === leaf ? "left" : "right";

    const x = newRect.width - oldRect.width;
    const y = newRect.height - oldRect.height;

    if (parent.ori === Ori.V) {
      // Horizontally resize leaf and sibling
      // TODO: AND REST OF THE TREE
      if (side === "left" && newRect.x === oldRect.x) {
        leaf.rect.width += x;
        sibling.rect.width -= x;
        sibling.rect.x += x;
      } else if (side === "right" && newRect.x !== oldRect.x) {
        sibling.rect.width -= x;
        leaf.rect.width += x;
        leaf.rect.x -= x;
      }
    } else {
      // Vertically resize leaf and sibling
      // TODO: AND REST OF THE TREE
      if (side === "left" && newRect.y === oldRect.y) {
        leaf.rect.height += y;
        sibling.rect.height -= y;
        sibling.rect.y += y;
      } else if (side === "right" && newRect.y !== oldRect.y) {
        sibling.rect.height -= y;
        leaf.rect.height += y;
        leaf.rect.y -= y;
      }
    }
  };

  /**
   * Applies leaves' {@link Rect|Rects} to {@link Window|Windows}.
   */
  tileWindows = (windows: Array<Window>) => {
    windows.forEach((window, i) => {
      window.setFrameGeometry(this.leaves[i].rect);
    });
  };

  addLeaves = (index: number) => {
    if (index < 0) index = this.leaves.length + index; // -1 = this.leaves.length - 1

    const branch = this.leaves[index];
    const rects = branch.rect.split(branch.ori);

    branch.left = new Node(rects[0]);
    branch.right = new Node(rects[1]);

    this.leaves.splice(index, 1, branch.left);
    this.leaves.splice(this.leaves.length, 0, branch.right);
  };

  removeLeaf = (index: number) => {
    if (index < 0) index = this.leaves.length + index; // -1 = this.leaves.length - 1

    const removed = this.leaves.splice(index, 1)[0];
    const parent = findParent(this.root, removed);
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
  ori: Ori;

  left: Node | undefined;
  right: Node | undefined;

  get leaf() {
    return !this.left;
  }

  constructor(rect: Rect) {
    this.id = nextNodeId++;
    this.rect = rect;
    this.ori = rect.width >= rect.height ? Ori.V : Ori.H;
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
      /**
       * Fixes rects for rest of the tree
       */
      find(this, (node) => {
        if (!node.left || !node.right) return false;
        const rects = node.rect.split(node.ori);
        node.left.rect = rects[0];
        node.right.rect = rects[1];
        return false;
      });
    }
  };
}
