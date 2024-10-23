import config from "./config";
import { maximizeArea } from "./kwin";
import { outputIndex } from "./output";
import { Rect } from "./rect";
import { KWinOutput, KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { QRect } from "./types/qt";

export class Window {
  kwin: KWinWindow;

  // Enabled  can      be changed manually by the user or automatically by the script
  // Disabled can only be changed                         automatically by the script
  // In practice, disabled = true tiles can be re-enabled automatically by the script, but disabled = false tiles can only be re-enabled manually by the user
  enabled: boolean;
  disabled: boolean;

  private kwinOutput: KWinOutput;
  private kwinDesktops: Array<KWinVirtualDesktop>;

  private move: boolean;
  private resize: boolean;

  private oldRect: QRect;

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

  constructor(kwin: KWinWindow) {
    this.kwin = kwin;

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
  }

  remove = () => {
    this.kwin.moveResizedChanged.disconnect(this.moveResizedChanged);
    this.kwin.outputChanged.disconnect(this.outputChanged);
    this.kwin.desktopsChanged.disconnect(this.desktopsChanged);
    this.kwin.maximizedChanged.disconnect(this.maximizedChanged);
    this.kwin.fullScreenChanged.disconnect(this.fullScreenChanged);
    this.affectedOthers(this);
  };

  // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
  // @param push    - Indicates whether the window should be moved to the bottom of the Window stack
  enable = (manual?: boolean, push?: boolean) => {
    if (manual || (this.disabled && !this.enabledByDefault)) {
      this.disabled = false;
      this.enabled = true;
      if (push) {
        this.movedToBottom(this);
      }
    }
  };

  // @param manual  - Indicates whether the action was performed manually by the user or automatically by the script
  disable = (manual?: boolean) => {
    if (!manual) this.disabled = true;
    this.enabled = false;
    this.affectedOthers(this);
  };

  // b43a
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

  startMove = (oldRect: QRect) => {
    this.move = true;
    this.oldRect = new Rect(oldRect).kwin;
  };

  stopMove = () => {
    if (this.kwinOutput !== this.kwin.output) {
      this.outputChanged(true);
    } else if (this.enabled) {
      this.positionChanged(this, this.oldRect);
    }

    this.move = false;
  };

  startResize = (oldRect: QRect) => {
    this.resize = true;
    this.oldRect = new Rect(oldRect).kwin;
  };

  stopResize = () => {
    this.sizeChanged(this, this.oldRect);
    this.resize = false;
  };

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

  fullScreenChanged = () => {
    if (this.kwin.fullScreen) {
      this.disable();
    } else {
      this.enable(false, false);
    }
  };

  maximizedChanged = () => {
    if (this.kwin.fullScreen) return;

    if (this.isMaximized()) {
      this.disable();
    } else {
      this.enable(false, false);
    }
  };

  minimizedChanged = () => {
    if (this.kwin.minimized) {
      this.disable();
    } else {
      this.enable(false, true);
    }
  };

  isMaximized = () => {
    const desktop = this.kwin.desktops[0] || workspace.desktops[0];
    const area = maximizeArea(this.kwin.output, desktop);

    const h = this.kwin.frameGeometry.width === area.width && this.kwin.frameGeometry.x === area.x;
    const v = this.kwin.frameGeometry.height === area.height && this.kwin.frameGeometry.y === area.y;

    if (h || v) {
      return true;
    }
  };

  // @param force - Ignores the move check (used to ignore outputChanged signal if moveResizedChanged might do the same later)
  outputChanged = (force?: boolean) => {
    if (force || !this.move) {
      this.kwinOutput = this.kwin.output;

      if (this.enabledByDefault) {
        this.enable(false, true);
      } else {
        this.disable();
      }
    }
  };

  // cf3f
  desktopsChanged = () => {
    if (this.kwin.desktops.length > 1) {
      this.disable();
    } else if (this.kwin.desktops.length === 1) {
      this.enable(false, true);
    }

    this.kwinDesktops = this.kwin.desktops;
  };

  // Callbacks from WM
  affectedOthers: (window: Window) => void; // Only if the effect ISN'T communicated by one of the signals below
  movedToBottom: (window: Window) => void;
  positionChanged: (window: Window, oldRect: QRect) => void;
  sizeChanged: (window: Window, oldRect: QRect) => void;
}
