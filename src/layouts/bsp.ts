import { Ori, Rect } from "../rect";
import { QRect } from "../types/qt";
import { Window } from "../window";

const findWindowToSplit = (windows: Array<Window>) => {
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

export class BSPLayout {
  rect: Rect;

  root: Node;
  leaves: Array<Node> = [];

  constructor(rect: Rect) {
    this.rect = rect;
    this.root = new Node(rect);
    this.leaves.push(this.root);
  }

  oldWindows: Array<Window> = [];
  tileWindows = (windows: Array<Window>) => {
    // Adds missing leaves
    for (var i = 0; i < windows.length - this.leaves.length; i++) {
      const index = findWindowToSplit(windows);
      const node = this.leaves[index] || this.leaves[this.leaves.length - 1];
      node.addChildren(this.leaves);
    }

    // Removes excess leaves
    if (this.leaves.length > 1) {
      for (var i = 0; i < this.leaves.length - windows.length; i++) {
        // Finds the window that was removed
        // TODO: Pass the window
        const window = this.oldWindows.filter((window) => {
          return !windows.includes(window);
        })[0];

        const index = this.leaves.findIndex((leaf) => leaf.id === window.kwin.internalId);
        const node = this.leaves[index] || this.leaves[this.leaves.length - 1];

        node.remove(this.leaves);
      }
    }

    windows.forEach((window, i) => {
      this.leaves[i].id = window.kwin.internalId;
      window.setFrameGeometry(this.leaves[i].rect);
    });

    this.oldWindows = windows;
  };
}

export class Node {
  id: string;

  rect: Rect;

  parent: Node | undefined;
  left: Node | undefined;
  right: Node | undefined;

  get bro() {
    if (this.parent.left === this) {
      return this.parent.right;
    } else {
      return this.parent.left;
    }
  }

  get which() {
    if (this.parent.left === this) {
      return "left";
    } else {
      return "right";
    }
  }

  constructor(rect: Rect, parent?: Node) {
    this.rect = rect;
    this.parent = parent;
  }

  /**
   * Adds children to `this`
   * @param leaves Array of leaves in the tree
   */
  addChildren = (leaves: Array<Node>) => {
    const rects = this.rect.split(Ori.V);

    this.left = new Node(rects[0], this);
    this.right = new Node(rects[1], this);

    leaves.splice(leaves.indexOf(this), 1, this.left); // TODO: Adjust leaves in the tree?
    leaves.push(this.right); // TODO: Adjust leaves in the tree?
  };

  /**
   * Removes a child from `this`
   * @param leaves Array of leaves in the tree
   * @param childA {@link Node} to be removed
   */
  remove = (leaves: Array<Node>) => {
    leaves.splice(leaves.indexOf(this), 1); // TODO: Adjust leaves in the tree?

    if (!this.bro.left) {
      /**
       * Doesn't have grandchildren --> removes `this` and `bro`
       * 
                         parent
                          / \
                      this   bro
      */
      leaves.splice(leaves.indexOf(this.bro), 1, this.parent); // TODO: Adjust leaves in the tree?
    } else {
      /**
       * Has grandchildren --> removes `this` and `parent`
       * 
                                   parent  
                                    / \                                         
                                this   bro
                                      /  \                                              
                               bro.left  bro.right
      */
      this.parent.set(this.bro);
    }
  };

  set = (node: Node) => {
    // TODO: Replace THIS with node
    this.left = node.left;
    this.right = node.right;

    /*
    let nextParent: Node = this;
    let nextNode: Node = node;

    while (true) {
      nextNode.rect = nextParent.rect;
      nextNode.parent = nextParent;
      nextParent.left = nextNode.left;
      nextParent.right = nextNode.right;

      if (!nextNode.left) break;

      nextParent = nextNode;
      nextNode = nextNode.left;
    }
      */
  };
}

const getLastNode = (node: Node): Node => {
  let next = node;

  while (next.left) {
    next = next.left;
  }

  return next;
};
