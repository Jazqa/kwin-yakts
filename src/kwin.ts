import { KWinOutput, KWinVirtualDesktop, KWinWindow } from "./types/kwin";
import { Window } from "./window";

export const readConfigString = (key: string, defaultValue: any): string => {
  return readConfig(key, defaultValue).toString();
};

export const maximizeArea = (output: KWinOutput, desktop: KWinVirtualDesktop) => {
  return workspace.clientArea(2, output, desktop);
};

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

export const getLayoutId = (kwinActivity: string, kwinDesktop: KWinVirtualDesktop, kwinOutput: KWinOutput) => {
  return kwinActivity + kwinDesktop?.id + kwinOutput.serialNumber;
};

export const getCurrentLayoutId = () => {
  return getLayoutId(workspace.currentActivity, workspace.currentDesktop, workspace.activeScreen);
};

export const getOutputLayoutId = (kwinOutput: KWinOutput) => {
  return getLayoutId(workspace.currentActivity, workspace.currentDesktop, kwinOutput);
};

export const getWindowLayoutId = (window: Window) => {
  return getLayoutId(window.kwinActivities[0], window.kwinDesktops[0], window.kwinOutput);
};
