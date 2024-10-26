import config from "./config";
import { maximizeArea, outputIndex } from "./kwin";
import { Rect } from "./rect";
import { KWinOutput, KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { QRect } from "./types/qt";

/**
 * Callbacks for {@link YAKTS}.
 */
interface YAKTSCallbacks {
  /** Triggered only if the effect **isn't** communicated by other signals (e.g. {@link movedToBottom}) */
  windowAdded: (window: Window) => void;
  windowRemoved: (window: Window) => void;
  windowEnabledChanged: (window: Window, manual: boolean, push?: boolean) => void;
  windowPositionChanged: (window: Window, oldRect: QRect) => void;
  windowSizeChanged: (window: Window, oldRect: QRect) => void;
  windowOutputChanged: (window: Window, from: KWinOutput, to: KWinOutput) => void;
  windowDesktopsChanged: (window: Window, from: KWinVirtualDesktop[], to: KWinVirtualDesktop[]) => void;
}

/**
 * Represents a window managed by the script.
 * @augments KWinWindow Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
export class Window {
  /**
   * @property Pointer to the {@link KWinWindow} `this` augments
   */
  kwin: KWinWindow;

  callbacks: YAKTSCallbacks;

  /**
   * @property Should `this` this be tiled by {@link YAKTS}.
   *
   *
   * Can be toggled *automatically by the script* or **manually by the user**.
   */
  enabled: boolean;

  /**
   * @property Was `this.enabled` changed to `false` *automatically* by the script or **manually** by the user.
   *
   * - True: `this` can be re-enabled *automatically by the script*.
   *
   * - False: `this` can only be re-enabled **manually by the user**.
   */
  disabled: boolean;

  kwinOutput: KWinOutput;
  kwinDesktops: KWinVirtualDesktop[];

  get kwinDesktop() {
    return this.kwinDesktops[0];
  }

  get layoutId() {
    return this.kwinDesktop.id + this.kwinOutput.serialNumber;
  }

  private move: boolean;
  private resize: boolean;

  /**
   * @property Temporarily stores `this.kwin.frameGeometry` when moving or resizing starts
   */
  private oldRect: QRect;

  /**
   * @getter Much like {@link YAKTS.isKwinWindowAllowed}, checks if `this.enabled` should be `true` by default
   */
  get enabledByDefault() {
    return (
      !this.kwin.minimized &&
      !this.kwin.fullScreen &&
      !this.isMaximized() &&
      this.kwin.frameGeometry.width >= config.minWidth &&
      this.kwin.frameGeometry.height >= config.minHeight &&
      config.auto[outputIndex(this.kwin.output)] &&
      config.processes.indexOf(this.kwin.resourceClass.toString().toLowerCase()) === -1 &&
      config.processes.indexOf(this.kwin.resourceName.toString().toLowerCase()) === -1 &&
      !config.captions.some((caption) => this.kwin.caption.toLowerCase().includes(caption.toLowerCase()))
    );
  }

  constructor(kwin: KWinWindow, callbacks: YAKTSCallbacks) {
    this.kwin = kwin;
    this.callbacks = callbacks;

    this.kwinOutput = kwin.output;
    this.kwinDesktops = kwin.desktops;

    this.move = false;
    this.resize = false;

    this.disabled = !this.enabledByDefault;
    this.enabled = this.enabledByDefault;

    this.kwin.moveResizedChanged.connect(this.moveResizedChanged);
    this.kwin.outputChanged.connect(this.outputChanged);
    this.kwin.desktopsChanged.connect(this.desktopsChanged);
    this.kwin.maximizedChanged.connect(this.maximizedChanged);
    this.kwin.minimizedChanged.connect(this.minimizedChanged);
    this.kwin.fullScreenChanged.connect(this.fullScreenChanged);

    this.callbacks.windowAdded(this);
  }

  remove = () => {
    this.kwin.moveResizedChanged.disconnect(this.moveResizedChanged);
    this.kwin.outputChanged.disconnect(this.outputChanged);
    this.kwin.desktopsChanged.disconnect(this.desktopsChanged);
    this.kwin.maximizedChanged.disconnect(this.maximizedChanged);
    this.kwin.fullScreenChanged.disconnect(this.fullScreenChanged);

    this.callbacks.windowRemoved(this);
  };

  /**
   *
   * @param manual Action was performed **manually by the user** instead of *automatically by the script*
   * @param push Moves `this` to the bottom of {@link YAKTS.windows}
   * @mutates `this.enabled`, `this.disabled`
   */
  enable = (manual?: boolean, push?: boolean) => {
    if (manual || this.disabled) {
      this.disabled = false;
      this.enabled = true;
      this.callbacks.windowEnabledChanged(this, manual, push);
    }
  };

  /**
   *
   * @param manual Action was performed **manually by the user** instead of *automatically by the script*
   * @mutates `this.enabled`, `this.disabled`
   */
  disable = (manual?: boolean) => {
    if (!manual) this.disabled = true;
    this.enabled = false;
    this.callbacks.windowEnabledChanged(this, manual);
  };

  /**
   * @todo b43a
   *
   * Sets `this.kwin.frameGeometry` to `rect` but caps its `width` and `height` to `this.kwin.minSize`.
   * @param rect Target {@link QRect}
   * @mutates `this.kwin.frameGeometry`
   */
  setFrameGeometry = (rect: QRect) => {
    const frameGeometry = new Rect(rect).gap(config.gap[outputIndex(this.kwin.output)]);

    if (rect.width < this.kwin.minSize.width) {
      frameGeometry.width = this.kwin.minSize.width;
    }

    if (rect.height < this.kwin.minSize.height) {
      frameGeometry.height = this.kwin.minSize.height;
    }

    this.kwin.frameGeometry = frameGeometry.kwin;
  };

  /**
   * Callback triggered when `kwin` starts moving.
   * @param oldRect {@link QRect} before `kwin` moved
   * @mutates `this.move`
   * @mutates `this.oldRect`
   */
  startMove = (oldRect: QRect) => {
    this.move = true;
    this.oldRect = new Rect(oldRect);
  };

  /**
   * Callback triggered when `kwin` stops moving.
   * Calls {@link outputChanged} if output before moving (`this.kwinOutput`) doesn't match output after moving (`this.kwin.output`).
   * @mutates `this.move`
   */
  stopMove = () => {
    if (this.kwinOutput !== this.kwin.output) {
      this.outputChanged(true);
    } else if (this.enabled) {
      this.callbacks.windowPositionChanged(this, this.oldRect);
    }

    this.move = false;
  };

  /**
   * Callback triggered when `kwin` starts being resized.
   * @param oldRect {@link QRect} before `kwin` was resized
   * @mutates `this.resize`
   * @mutates `this.oldRect`
   */
  startResize = (oldRect: QRect) => {
    this.resize = true;
    this.oldRect = new Rect(oldRect).kwin;
  };

  /**
   * Callback triggered when `kwin` stops being resized.
   * Calls {@link sizeChanged}.
   * @mutates `this.resize`
   */
  stopResize = () => {
    this.callbacks.windowSizeChanged(this, this.oldRect);
    this.resize = false;
  };

  /**
   * Callback triggered when `kwin` starts and stops being moved and resized.
   * Identifies the event and calls {@link startMove}, {@link stopMove}, {@link startResize} or {@link stopResize} accordingly.
   */
  moveResizedChanged = () => {
    if (this.kwin.move && !this.move) {
      this.startMove(this.kwin.frameGeometry);
    } else if (!this.kwin.move && this.move) {
      this.stopMove();
    } else if (!this.enabled) {
      return;
    } else if (this.kwin.resize && !this.resize) {
      this.startResize(this.kwin.frameGeometry);
    } else if (!this.kwin.resize && this.resize) {
      this.stopResize();
    }
  };

  /**
   * Callback triggered when `kwin.fullScreen` changes.
   * Toggles `this.enabled` accordingly.
   * @mutates `this.enabled`, `this.disabled`
   */
  fullScreenChanged = () => {
    if (this.kwin.fullScreen) {
      this.disable();
    } else {
      this.enable(false, false);
    }
  };

  /**
   * Callback triggered when `kwin` is maximized.
   * Toggles `this.enabled` accordingly.
   * @mutates `this.enabled`, `this.disabled`
   */
  maximizedChanged = () => {
    if (this.kwin.fullScreen) return;

    if (this.isMaximized()) {
      this.disable();
    } else {
      this.enable(false, false);
    }
  };

  /**
   * Callback triggered when `kwin.minimized` changes.
   * Toggles `this.enabled` accordingly.
   * @mutates `this.enabled`, `this.disabled`
   */
  minimizedChanged = () => {
    if (this.kwin.minimized) {
      this.disable();
    } else {
      this.enable(false, true);
    }
  };

  /**
   * {@link KWinWindow} has no property for maximized, so its size has to be compared to {@link maximizeArea}.
   * @returns Whether `this.kwin` is maximized or not
   */
  isMaximized = () => {
    const desktop = this.kwin.desktops[0] || workspace.desktops[0];
    const area = maximizeArea(this.kwin.output, desktop);

    const h = this.kwin.frameGeometry.width === area.width && this.kwin.frameGeometry.x === area.x;
    const v = this.kwin.frameGeometry.height === area.height && this.kwin.frameGeometry.y === area.y;

    if (h || v) {
      return true;
    }
  };

  /**
   * Callback triggered when `kwin`'s output changes.
   * Identifies whether the output was changed by manually moving the window or via shortcuts.
   * Toggles `this.enabled` accordingly.
   * @param force Ignore the `this.move`-check, so outputChanged signal isn't triggered if moveResizedChanged might trigger it later
   * @mutates `this.kwinOutput`, `this.enabled`, `this.disabled`
   */
  outputChanged = (force?: boolean) => {
    if (force || !this.move) {
      this.callbacks.windowOutputChanged(this, this.kwinOutput, this.kwin.output);
      this.kwinOutput = this.kwin.output;
    }
  };

  /**
   * @todo cf3f
   *
   * Callback triggered when `kwin`'s desktops change.
   * Toggles `this.enabled` accordingly.
   * @mutates `this.kwinDesktops`, `this.enabled`, `this.disabled`
   */
  desktopsChanged = () => {
    // TODO
    this.callbacks.windowDesktopsChanged(this, this.kwinDesktops, this.kwin.desktops);
    this.kwinDesktops = this.kwin.desktops;
  };

  wasOnLayoutWith = (window: Window) => {
    return this.kwinDesktop === window.kwinDesktop && this.kwinOutput === window.kwinOutput;
  };

  isOnLayoutWith = (window: Window) => {
    return (
      window.kwin.desktops.length === 1 &&
      this.kwin.desktops.length === 1 &&
      this.kwin.desktops[0] === window.kwin.desktops[0] &&
      this.kwin.output === window.kwin.output
    );
  };

  isOnOutput = (output: KWinOutput) => {
    return (
      this.kwin.desktops.length === 1 &&
      this.kwin.desktops[0] === workspace.currentDesktop &&
      this.kwin.output === output
    );
  };
}
