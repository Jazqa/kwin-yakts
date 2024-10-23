import { Rect } from "./rect";
import { KWinTile, KWinWindow } from "./types/kwin";

export class WM {
  windows: Array<KWinWindow> = [];

  constructor() {
    workspace.windowAdded.connect(this.windowAdded);
    workspace.windowRemoved.connect(this.windowRemoved);
  }

  windowAllowed = (window: KWinWindow) => {
    if (window.managed && window.moveable && window.normalWindow && window.resizeable) {
      return true;
    }
  };

  windowAdded = (window: KWinWindow) => {
    if (this.windowAllowed(window)) {
      this.windows.push(window);
      this.tileWindows();
    }
  };

  windowRemoved = (window: KWinWindow) => {
    const index = this.windows.findIndex(({ internalId }) => internalId === window.internalId);
    if (index > -1) {
      this.windows.splice(index, 1);
      this.tileWindows();
    }
  };

  tileWindows = () => {
    workspace.screens.forEach((output, index) => {
      // Filter windows by output
      const windows = this.windows.filter((window) => window.output.serialNumber === output.serialNumber);

      const tiles = [];

      const cb = (tile: KWinTile) => {
        if (tile.tiles.length === 0) {
          tiles.push(tile);
        }
      };

      const rootTile = workspace.tilingForScreen(output).rootTile;

      // Traverse through the tree
      this.traverse(rootTile, cb);

      windows.splice(tiles.length);

      tiles.reverse();
      windows.reverse();

      windows.forEach((window, index) => {
        let tile = tiles[index];
        window.tile = rootTile;
      });
    });
  };

  traverse = (tile: KWinTile, cb: (tile: KWinTile) => void) => {
    let i = 0;
    while (tile.tiles[i]) {
      cb(tile.tiles[i]);
      this.traverse(tile.tiles[i], cb);
      i++;
    }
  };
}
