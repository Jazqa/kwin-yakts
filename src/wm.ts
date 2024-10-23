import config from "./config";
import { Desktop, kwinDesktopIndex } from "./desktop";
import { Rect } from "./rect";
import { KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { QRect } from "./types/qt";
import { Window } from "./window";

export class WM {
  desktops: Array<Desktop> = [];
  windows: Array<Window> = [];

  constructor() {
    workspace.desktops.forEach(this.addKwinDesktop);
    workspace.stackingOrder.forEach((kwinWindow, index) =>
      this.addKwinWindow(kwinWindow, index === workspace.stackingOrder.length - 1)
    );

    workspace.currentDesktopChanged.connect(this.tileWindows);
    workspace.windowAdded.connect(this.addKwinWindow);
    workspace.windowRemoved.connect(this.removeKwinWindow);
    // workspace.windowActivated.connect(this.tileWindows);

    registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
    registerUserActionsMenu(this.kwinActionsMenuEntry);
  }

  // KWin ActionsMenu
  kwinActionsMenuEntry = (kwinWindow: KWinWindow) => {
    const window = this.windows.find((window) => window.kwin.internalId === kwinWindow.internalId);
    if (window) {
      return {
        text: "Tile Window",
        checkable: true,
        checked: window.enabled,
        triggered: () => {
          this.toggleWindow(window);
        },
      };
    }
  };

  // KWin Desktops
  addKwinDesktop = (kwinDesktop: KWinVirtualDesktop) => {
    // Desktop is excluded
    if (config.desktops.indexOf(kwinDesktopIndex(kwinDesktop))) return;

    // Desktop is already initialized
    if (this.desktops.some((desktop) => desktop.kwin.id === kwinDesktop.id)) return;

    const desktop = new Desktop(kwinDesktop);
    this.desktops.push(desktop);
  };

  // KWin Windows
  addKwinWindow = (kwinWindow: KWinWindow, loop?: boolean) => {
    if (this.isKwinWindowAllowed(kwinWindow)) {
      const window = new Window(kwinWindow);

      window.affectedOthers = (window: Window) => this.windowAffectedOthers(window);
      window.movedToBottom = (window: Window) => this.windowMovedToBottom(window);
      window.positionChanged = (window: Window, oldRect: QRect) => this.windowPositionChanged(window, oldRect);
      window.sizeChanged = (window: Window, oldRect: QRect) => this.windowSizeChanged(window, oldRect);

      this.windows.push(window);

      if (!loop) {
        this.windowAffectedOthers(window);
      }
    }
  };

  removeKwinWindow = (kwinWindow: KWinWindow) => {
    const index = this.windows.findIndex((window) => window.kwin.internalId === kwinWindow.internalId);
    const window = this.windows[index];

    if (index > -1) {
      this.windows.splice(index, 1);
      window.remove();
    }
  };

  isKwinWindowAllowed = (window: KWinWindow) => {
    return window.managed && window.normalWindow && window.moveable && window.resizeable;
  };

  // Windows
  filterWindows = () => {
    return this.windows.filter((window) => {
      return window.enabled;
    });
  };

  tileWindows = () => {
    this.desktops.forEach((desktop) => {
      if (desktop.kwin.id === workspace.currentDesktop.id) {
        desktop.tileWindows(this.filterWindows());
      }
    });
  };

  swapWindows = (i: number, j: number) => {
    const window: Window = this.windows[i];
    this.windows[i] = this.windows[j];
    this.windows[j] = window;
  };

  // Window
  toggleActiveWindow = () => {
    const window = this.windows.find(({ kwin }) => kwin.internalId === workspace.activeWindow.internalId);
    this.toggleWindow(window);
  };

  toggleWindow = (window: Window) => {
    if (window.enabled) {
      window.disable(true);
      workspace.activeWindow = window.kwin;
    } else {
      window.enable(true, true);
    }
  };

  // Window signals
  windowAffectedOthers = (window: Window) => {
    this.tileWindows();
  };

  windowMovedToBottom = (window: Window) => {
    const index = this.windows.findIndex(({ kwin }) => kwin.internalId === window.kwin.internalId);
    if (index > -1) {
      this.windows.push(this.windows.splice(index, 1)[0]);
    }

    this.tileWindows();
  };

  windowSizeChanged = (window: Window, oldRect: QRect) => {
    const desktop = this.desktops.find((desktop) => desktop.kwin.id === window.kwin.desktops[0].id);
    if (!desktop) return;

    desktop.resizeWindow(window, oldRect);

    this.tileWindows();
  };

  windowPositionChanged = (windowA: Window, oldRect: QRect) => {
    const index = this.windows.findIndex((windowB) => windowB.kwin.internalId === windowA.kwin.internalId);
    const newRect = new Rect(windowA.kwin.frameGeometry);

    let nearestIndex = index;
    let nearestDistance = newRect.distance(oldRect);

    this.windows.forEach((windowB, index) => {
      if (windowB.kwin.internalId !== windowA.kwin.internalId) {
        const distance = newRect.distance(windowB.kwin.frameGeometry);
        if (distance < nearestDistance) {
          nearestIndex = index;
          nearestDistance = distance;
        }
      }
    });

    if (index !== nearestIndex) {
      this.swapWindows(index, nearestIndex);
    }

    this.tileWindows();
  };
}
