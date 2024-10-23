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
      this.tileWindows(window);
    }
  };

  windowRemoved = (window: KWinWindow) => {
    const index = this.windows.findIndex(({ internalId }) => internalId === window.internalId);
    if (index > -1) {
      this.windows.splice(index, 1);
    }
  };

  tileWindows = (window: KWinWindow) => {
    const tiles = [];
    this.traverse(workspace.tilingForScreen(window.output).rootTile, (tile: KWinTile) => {
      if (tile.tiles.length === 0) {
        tiles.push(tile);
      }
    });

    const windows = this.windows
      .filter(({ output }) => output.serialNumber === window.output.serialNumber)
      .filter(({ desktops }) => desktops[0].id === workspace.currentDesktop.id)
      .slice(0, tiles.length);

    windows.forEach((window, index) => {
      let tile = tiles[index];
      window.tile = tile;
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
