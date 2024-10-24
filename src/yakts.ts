import config from "./config";
import { Desktop, kwinDesktopIndex } from "./desktop";
import { Rect } from "./rect";
import { KWinActionsMenuEntry, KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { QRect } from "./types/qt";
import { Window } from "./window";

/**
 * Entry point of the script.
 */
export class YAKTS {
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
    registerUserActionsMenu(this.createMenuEntry);
  }

  // KWin ActionsMenu

  /**
   * Creates a new {@link KWinActionsMenuEntry}.
   * @param kwinWindow {@link KWinWindow} to create an entry for
   * @returns Entry to show in `kwinWindow`'s right-click menu
   */
  createMenuEntry = (kwinWindow: KWinWindow): KWinActionsMenuEntry => {
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

  /**
   * Creates a new {@link Desktop} based on `kwinVirtualDesktop` and adds it to `this.desktops`.
   * @param kwinVirtualDesktop {@link KWinVirtualDesktop} to add
   * @mutates `this.desktops`
   * @returns
   */
  addKwinDesktop = (kwinVirtualDesktop: KWinVirtualDesktop) => {
    // KWinVirtualDesktop is exluded
    if (config.desktops.indexOf(kwinDesktopIndex(kwinVirtualDesktop))) return;

    // KWinVirtualDesktop is already added
    if (this.desktops.some((desktop) => desktop.kwin.id === kwinVirtualDesktop.id)) return;

    const desktop = new Desktop(kwinVirtualDesktop);
    this.desktops.push(desktop);
  };

  // KWin Windows

  /**
   * Creates a new {@link Window} based on `kwinWindow` and adds it to `this.windows`.
   * @param kwinWindow {@link KWinWindow} to add
   * @param loop Skips {@link YAKTS.windowAffectedOthers} call
   * @mutates `this.windows`
   */
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

  /**
   * Finds {@link Window} from `this.windows` by `kwinWindow.internalId` and removes it.
   * @param kwinWindow {@link KWinWindow} to remove
   * @mutates `this.windows`
   */
  removeKwinWindow = (kwinWindow: KWinWindow) => {
    const index = this.windows.findIndex((window) => window.kwin.internalId === kwinWindow.internalId);
    const window = this.windows[index];

    if (index > -1) {
      this.windows.splice(index, 1);
      window.remove();
    }
  };

  /**
   * Checks if `kwinWindow` is compatible with the script.
   * @param kwinWindow {@link KWinWindow} to check
   * @returns Whether `kwinWindow` is compatible or not
   */
  isKwinWindowAllowed = (kwinWindow: KWinWindow) => {
    return kwinWindow.managed && kwinWindow.normalWindow && kwinWindow.moveable && kwinWindow.resizeable;
  };

  // Windows

  /**
   * Filters `this.windows` to exclude {@link Window|Windows} that are not {@link Window.enabled|enabled}.
   * @returns Filtered copy of `this.windows`
   */
  filterWindows = () => {
    return this.windows.filter((window) => {
      return window.enabled;
    });
  };

  /**
   * Finds the current {@link Desktop} from `this.desktops` and calls its {@link Desktop.tileWindows|tileWindows}.
   */
  tileWindows = () => {
    this.desktops.find((desktop) => desktop.kwin.id === workspace.currentDesktop.id).tileWindows(this.filterWindows());
  };

  /**
   * Swaps the positions of `this.windows[i]` and `this.windows[j]` in `this.windows`.
   * @param i First index to swap
   * @param j Second index to swap
   * @mutates `this.windows`
   */
  swapWindows = (i: number, j: number) => {
    const window: Window = this.windows[i];
    this.windows[i] = this.windows[j];
    this.windows[j] = window;
  };

  /**
   * Finds `workspace.activeWindow` in `this.windows` and calls {@link toggleWindow} with it.
   */
  toggleActiveWindow = () => {
    const window = this.windows.find(({ kwin }) => kwin.internalId === workspace.activeWindow.internalId);
    this.toggleWindow(window);
  };

  /**
   * Toggles {@link Window.enabled} property of `window`.
   * @param window {@link Window} for which to toggle the property
   */
  toggleWindow = (window: Window) => {
    if (window.enabled) {
      window.disable(true);
    } else {
      window.enable(true, true);
    }
  };

  // Window signals

  /**
   * Callback triggered whenever `window` affects other windows.
   * Calls {@link tileWindows}.
   * @param window {@link Window} window that triggered the callback
   */
  windowAffectedOthers = (window: Window) => {
    this.tileWindows();
  };

  /**
   * Callback triggered whenever `window` should be moved to the end of `this.windows`.
   * Splices `window` from its current index and pushes it to the end of `this.windows`.
   * @param window {@link Window} window that triggered the callback
   * @mutates `this.windows`
   */
  windowMovedToBottom = (window: Window) => {
    const index = this.windows.findIndex(({ kwin }) => kwin.internalId === window.kwin.internalId);
    if (index > -1) {
      this.windows.push(this.windows.splice(index, 1)[0]);
    }

    this.tileWindows();
  };

  /**
   * Callback triggered whenever `window`'s size changes.
   * Finds the `window`'s current {@link Desktop} from `this.desktops` and calls its {@link Desktop.resizeWindow|resizeWindow}.
   * @param window {@link Window} window that triggered the callback
   * @param oldRect {@link QRect} before the size changed
   */
  windowSizeChanged = (window: Window, oldRect: QRect) => {
    if (window.kwin.desktops.length !== 1) return;
    const desktop = this.desktops.find((desktop) => desktop.kwin.id === window.kwin.desktops[0].id);
    if (!desktop) return;

    desktop.resizeWindow(window, oldRect);

    this.tileWindows();
  };

  /**
   * Callback triggered whenever `window`'s position changes.
   * Compares the `window`'s position to `oldRect` and `this.windows` entries with matching {@link KWinWindow.desktops|desktops}
   * and "snaps" it to the closest one by returning it to `oldRect` or calling {@link swapWindows}.
   * @param window {@link Window} window that triggered the callback
   * @param oldRect {@link QRect} before the size changed
   * @mutates `this.windows`
   */
  windowPositionChanged = (windowA: Window, oldRect: QRect) => {
    if (windowA.kwin.desktops.length !== 1) return;

    const index = this.windows.findIndex((windowB) => windowB.kwin.internalId === windowA.kwin.internalId);
    const newRect = new Rect(windowA.kwin.frameGeometry);

    let nearestIndex = index;
    let nearestDistance = newRect.distance(oldRect);

    this.windows.forEach((windowB, index) => {
      if (
        windowB.kwin.internalId !== windowA.kwin.internalId &&
        windowB.kwin.desktops.length === 1 &&
        windowB.kwin.desktops[0].id === windowA.kwin.desktops[0].id
      ) {
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
