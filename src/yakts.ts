import config from "./config";
import { maximizeArea, outputIndex } from "./kwin";
import { Layouts } from "./layouts";
import { Layout } from "./layouts/layout";
import { Rect } from "./rect";
import { KWinActionsMenuEntry, KWinOutput, KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { QRect } from "./types/qt";
import { Window } from "./window";

/**
 * Entry point of the script.
 */
export class YAKTS {
  layouts = new Map<string, Layout>();
  windows: Window[] = [];

  constructor() {
    this.addLayouts();
    workspace.stackingOrder.forEach(this.addKwinWindow);
    // workspace.currentDesktopChanged.connect(this.tileWindows);
    workspace.windowAdded.connect(this.addKwinWindow);
    workspace.windowRemoved.connect(this.removeKwinWindow);
    // workspace.windowActivated.connect(this.activateKwinWindow);

    registerShortcut("(YAKTS) Tile Window", "", "Meta+F", this.toggleActiveWindow);
    registerUserActionsMenu(this.createMenuEntry);
  }

  /**
   * Calls {@link addLayout} for each existing {@link KWinDesktop} and {@link KWinOutput}.
   */
  addLayouts = () => {
    workspace.desktops.forEach((kwinDesktop) => {
      workspace.screens.forEach((kwinOutput, kwinOutputIndex) => {
        const kcfgIndex = kwinOutputIndex >= 0 ? kwinOutputIndex : 0;
        this.addLayout(kwinDesktop, kwinOutput, kcfgIndex);
      });
    });
  };

  /**
   * Adds {@link Layout} for `kwinDesktop` and `kwinOutput` combination to `this.layouts`.
   * @param kwinDesktop {@link KWinDesktop} affected by the new {@link Layout}
   * @param kwinOutput {@link KWinOutput} affected by the new {@link Layout}
   * @param kcfgIndex Index used for {@link Layout}'s {@link config} values
   * @mutates `this.layouts`
   */
  addLayout = (kwinDesktop: KWinVirtualDesktop, kwinOutput: KWinOutput, kcfgIndex: number) => {
    const L = Layouts[config.layout[kcfgIndex]];
    const margin = config.margin[kcfgIndex];

    const rect = new Rect(maximizeArea(kwinOutput, kwinDesktop)).margin(margin);
    const layout = new L(rect);

    const id = kwinDesktop.id + kwinOutput.serialNumber;
    this.layouts.set(id, layout);
  };

  /**
   * Creates a new {@link Window} based on `kwinWindow` and adds it to `this.windows`.
   * @param kwinWindow {@link KWinWindow} to add
   * @mutates `this.windows`
   */
  addKwinWindow = (kwinWindow: KWinWindow) => {
    if (this.isKwinWindowAllowed(kwinWindow)) {
      new Window(kwinWindow, this.callbacks);
    }
  };

  /**
   * Finds {@link Window} from `this.windows` and removes it.
   * @param kwinWindow {@link KWinWindow} to remove
   * @mutates `this.windows`
   */
  removeKwinWindow = (kwinWindow: KWinWindow) => {
    const index = this.windows.findIndex((window) => window.kwin === kwinWindow);
    const window = this.windows[index];

    if (index > -1) {
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

  /**
   *
   * WINDOW MANAGEMENT
   *
   */

  /**
   * Finds the current {@link Desktop} from `this.desktops` and calls its {@link Desktop.tileWindows|tileWindows}.
   */
  tileWindows = (windowA?: Window) => {
    if (windowA) {
      const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));
      this.layouts.get(windowA.layoutId).tileWindows(windows);
    } else {
      workspace.screens.forEach((output) => {
        const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnOutput(output));
        this.layouts.get(workspace.currentDesktop.id + output.serialNumber).tileWindows(windows);
      });
    }
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
   * Pushes a window to the end of `this.windows`
   * @param window {@link Window} to be pushed
   */
  pushWindow = (window: Window) => {
    const index = this.windows.indexOf(window);
    if (index > -1) {
      this.windows.push(this.windows.splice(index, 1)[0]);
    }
  };

  /**
   *
   *  WINDOW SIGNALS
   *
   */

  /**
   *
   */

  windowAdded = (windowA: Window) => {
    // Note: `window` has to be part of this.windows, so **push first!**
    this.windows.push(windowA);

    if (windowA.enabled) {
      const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));

      const activeWindow = windows
        .slice()
        .sort((a, b) => workspace.stackingOrder.indexOf(b.kwin) - workspace.stackingOrder.indexOf(a.kwin))[1];

      this.layouts.get(windowA.layoutId).addWindow(windowA, windows, activeWindow);

      this.tileWindows(windowA);
    }
  };

  windowRemoved = (windowA: Window) => {
    if (windowA.enabled) {
      const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));
      this.layouts.get(windowA.layoutId).removeWindow(windowA, windows);
    }

    // Note: `window` has to be part of this.windows, **splice last!**
    this.windows.splice(this.windows.indexOf(windowA), 1);

    this.tileWindows(windowA);
  };

  /**
   * Callback triggered whenever `window.enabled` changes.
   * Calls {@link tileWindows}.
   * @param push Moves `window` to the bottom of `this.windows`
   * @param window {@link Window} window that triggered the callback
   */

  windowEnabledChanged = (windowA: Window, manual: boolean, push?: boolean) => {
    if (push) this.pushWindow(windowA);

    if (windowA.enabled) {
      const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));
      this.layouts.get(windowA.layoutId).addWindow(windowA, windows);
    } else {
      const windows = this.windows.filter((windowB) => {
        if (windowB === windowA) return true; // Special case for including the disabled window in the filter, so the layout can remove it
        return windowB.enabled && windowB.isOnLayoutWith(windowA);
      });

      this.layouts.get(windowA.layoutId).removeWindow(windowA, windows);

      // Activate manually enabled windows (otherwise they just disappear instantly under tiled ones)
      if (manual) workspace.activeWindow = windowA.kwin;
    }

    this.tileWindows(windowA);
  };

  windowOutputChanged = (windowA: Window, from: KWinOutput, to: KWinOutput) => {
    const fromWindows = this.windows.filter((windowB) => windowB.enabled && windowB.wasOnLayoutWith(windowA));

    this.pushWindow(windowA);

    const toWindows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));

    this.layouts.get(windowA.kwinDesktop.id + from.serialNumber).removeWindow(windowA, fromWindows);
    this.layouts.get(windowA.kwinDesktop.id + to.serialNumber).addWindow(windowA, toWindows);

    this.tileWindows();
  };

  windowDesktopsChanged = (window: Window, from: KWinVirtualDesktop[], to: KWinVirtualDesktop[]) => {
    this.layouts.get(from[0].id + window.kwinOutput.serialNumber).removeWindow(window, this.windows);

    if (to.length === 1) {
      this.layouts.get(to[0].id + window.kwinOutput.serialNumber).addWindow(window, this.windows);
    }
  };

  /**
   * Callback triggered whenever `window`'s size changes.
   * Finds the `window`'s current {@link Desktop} from `this.desktops` and calls its {@link Desktop.resizeWindow|resizeWindow}.
   * @param window {@link Window} window that triggered the callback
   * @param oldRect {@link QRect} before the size changed
   */
  windowSizeChanged = (windowA: Window, oldRect: QRect) => {
    const windows = this.windows.filter((windowB) => windowB.enabled && windowB.isOnLayoutWith(windowA));

    this.layouts.get(windowA.layoutId).resizeWindow(windowA, windows, oldRect);

    this.tileWindows(windowA);
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
    const windows = this.windows.filter((windowB) => windowB !== windowA && windowB.isOnLayoutWith(windowA));

    const newRect = new Rect(windowA.kwin.frameGeometry);

    let nearestWindow = windowA;
    let nearestDistance = newRect.distance(oldRect);

    windows.forEach((windowB, index) => {
      const distance = newRect.distance(windowB.kwin.frameGeometry);

      if (distance < nearestDistance) {
        nearestWindow = windowB;
        nearestDistance = distance;
      }
    });

    if (nearestWindow !== windowA) {
      this.swapWindows(this.windows.indexOf(windowA), this.windows.indexOf(nearestWindow));
    }

    this.tileWindows(windowA);
  };

  callbacks = {
    windowAdded: this.windowAdded,
    windowRemoved: this.windowRemoved,
    windowOutputChanged: this.windowOutputChanged,
    windowDesktopsChanged: this.windowDesktopsChanged,
    windowEnabledChanged: this.windowEnabledChanged,
    windowPositionChanged: this.windowPositionChanged,
    windowSizeChanged: this.windowSizeChanged,
  };

  /**
   *
   * KWIN SHORTCUTS AND MENU ENTRIES
   *
   */

  /**
   * Creates a new {@link KWinActionsMenuEntry}.
   * @param kwinWindow {@link KWinWindow} to create an entry for
   * @returns Entry to show in `kwinWindow`'s right-click menu
   */
  createMenuEntry = (kwinWindow: KWinWindow): KWinActionsMenuEntry => {
    const window = this.windows.find((window) => window.kwin === kwinWindow);
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

  /**
   * Finds `workspace.activeWindow` in `this.windows` and calls {@link toggleWindow} with it.
   */
  toggleActiveWindow = () => {
    const window = this.windows.find((window) => window.kwin === workspace.activeWindow);
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
}
