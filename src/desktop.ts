import { maximizeArea } from "./kwin";
import { Output } from "./output";
import { KWinOutput, KWinVirtualDesktop } from "./types/kwin";
import { QRect } from "./types/qt";
import { Window } from "./window";

/**
 * @param kwinVirtualDesktop {@link KWinVirtualDesktop} for which to find the index
 * @returns Index of the output in {@link Workspace.screens}
 */
export const kwinDesktopIndex = (kwinVirtualDesktop: KWinVirtualDesktop) => {
  return workspace.desktops.findIndex(({ id }) => id === kwinVirtualDesktop.id);
};

/**
 * Represents a virtual desktop managed by the script
 * @augments KWinVirtualDesktop Adds additional helpers, temporary variables and signal callbacks necessary for window management.
 */
export class Desktop {
  /**
   * @property Pointer to the {@link KWinVirtualDesktop} `this` augments
   */
  kwin: KWinVirtualDesktop;

  outputs: Array<Output> = [];

  constructor(kwin: KWinVirtualDesktop) {
    this.kwin = kwin;
    workspace.screens.forEach(this.addKwinOutput);
  }

  /**
   * @todo
   * 04c1
   *
   * Creates a new {@link Output} based on `kwinOutput` and adds it to `this.outputs`.
   * @param kwinOutput {@link KWinOutput} to add
   * @mutates `this.outputs`
   */
  addKwinOutput = (kwinOutput: KWinOutput) => {
    // KWinOutput is already added
    if (this.outputs.some((output) => output.kwin.serialNumber === kwinOutput.serialNumber)) return;

    const output = new Output(kwinOutput, maximizeArea(kwinOutput, this.kwin));
    this.outputs.push(output);
  };

  /**
   * Filters `windows` to exclude {@link Window|Windows} that are not on `this.kwin`.
   * @param windows {@link Window|Windows} to be filtered
   * @returns Filtered copy of `windows`
   */
  filterWindows = (windows: Array<Window>) => {
    return windows.filter((window) => window.kwin.desktops.length === 1 && window.kwin.desktops[0].id === this.kwin.id);
  };

  /**
   * Calls {@link Output.tileWindows|tileWindows} of each {@link Output} in `this.outputs`.
   */
  tileWindows = (windows: Array<Window>) => {
    this.outputs.forEach((output) => output.tileWindows(this.filterWindows(windows)));
  };

  /**
   * Finds the {@link Output} `window` is on and calls its {@link Output.resizeWindow|resizeWindow}.
   */
  resizeWindow = (window: Window, oldRect: QRect) => {
    const output = this.outputs.find((output) => output.kwin.serialNumber === window.kwin.output.serialNumber);
    output.resizeWindow(window, oldRect);
  };
}
