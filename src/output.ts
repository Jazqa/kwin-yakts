import config, { Margin } from "./config";
import { Layouts } from "./layouts";
import { Rect } from "./rect";
import { KWinOutput } from "./types/kwin";
import { Layout } from "./types/layout";
import { QRect } from "./types/qt";
import { Window } from "./window";

/**
 * @todo 2ed6
 *
 * Unlike proper `.qml` interface, the `.ui` interface required by KWin doesn't support detecting outputs.
 * As a result, the configuration interface is hard-coded for up to 4 outputs
 * @param kwinOutput {@link KWinOutput} for which to find the index
 * @returns Index of the output in {@link Workspace.screens}, which can be used to fetch configuration values that use the format:
 * `kcfg_<key>_<output_index>`
 */
export const outputIndex = (kwinOutput: KWinOutput) => {
  let index = workspace.screens.findIndex(({ serialNumber }) => serialNumber === kwinOutput.serialNumber);

  // Supports more than 4 outputs by defaulting to 1st's configuration
  if (index === -1) {
    index = 0;
  }

  return index;
};

/**
 * Represents a screen managed by the script (KWin *mostly* uses the term output)
 * @augments KWinOutput Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
export class Output {
  /**
   * @property Pointer to the {@link KWinOutput} `this` augments
   */
  kwin: KWinOutput;

  /**
   * @property Index of the output in {@link Workspace.screens}
   */
  index: number;

  /**
   * @property {@link Margin} configured for the screen in {@link config.margin}
   */
  margin: Margin;

  /**
   * @property {@link Layout} configured for the screen in {@link config.layout}
   */
  layout: Layout;

  constructor(kwin: KWinOutput, rect: QRect) {
    this.kwin = kwin;

    this.index = outputIndex(kwin);

    this.margin = config.margin[this.index];
    this.layout = new Layouts[config.layout[this.index]](new Rect(rect).margin(this.margin));

    /** Uses the lower value between `this.layout.limit` and {@link config.limit} */
    const limit = config.limit[this.index];
    if (limit > -1) {
      this.layout.limit = Math.min(this.layout.limit, limit);
    }
  }

  /**
   * Filters `windows` to exclude {@link Window|Windows} that are not on `this.kwin`.
   * @param windows {@link Window|Windows} to be filtered
   * @returns Filtered copy of `windows`
   */
  filterWindows = (windows: Array<Window>) => {
    return windows.filter((window) => window.kwin.output.serialNumber === this.kwin.serialNumber);
  };

  /**
   * Calls `this.layout`'s {@link Layout.tileWindows|tileWindows}.
   */
  tileWindows = (windows: Array<Window>) => {
    this.layout.tileWindows(this.filterWindows(windows));
  };

  /**
   * Calls `this.layout`'s {@link Layout.resizeWindow|resizeWindow}.
   */
  resizeWindow = (window: Window, oldRect: QRect) => {
    this.layout.resizeWindow(window, oldRect);
  };
}
