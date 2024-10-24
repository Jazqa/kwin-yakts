import { QPoint, QRect, QSize } from "./qt";

export interface KWinWorkspaceWrapper {
  readonly activities: Array<string>;

  readonly desktops: Array<KWinVirtualDesktop>;
  currentDesktop: KWinVirtualDesktop;

  readonly screens: Array<KWinOutput>;
  readonly activeScreen: KWinOutput;

  readonly stackingOrder: Array<KWinWindow>;
  activeWindow: KWinWindow;

  clientArea: (option: 2, output: KWinOutput, desktop: KWinVirtualDesktop) => QRect;

  currentDesktopChanged: {
    connect: (cb: (oldDesktop: KWinVirtualDesktop) => void) => void;
    disconnect: (cb: (oldDesktop: KWinVirtualDesktop) => void) => void;
  };

  windowAdded: {
    connect: (cb: (window: KWinWindow) => void) => void;
    disconnect: (cb: (window: KWinWindow) => void) => void;
  };
  windowRemoved: {
    connect: (cb: (window: KWinWindow) => void) => void;
    disconnect: (cb: (window: KWinWindow) => void) => void;
  };
  windowActivated: {
    connect: (cb: (window: KWinWindow) => void) => void;
    disconnect: (cb: (window: KWinWindow) => void) => void;
  };
}

export interface KWinOutput {
  geometry: QRect;
  serialNumber: string;
}

export interface KWinVirtualDesktop {
  id: string;
}

export interface KWinWindow {
  hidden: any;
  readonly internalId: string;

  readonly pos: QPoint;
  readonly size: QSize;
  readonly rect: QRect;

  readonly output: KWinOutput;
  desktops: Array<KWinVirtualDesktop>;

  readonly resourceName: string;
  readonly resourceClass: string;
  readonly caption: string;

  readonly move: boolean;
  readonly resize: boolean;

  readonly normalWindow: boolean;
  readonly managed: boolean;
  readonly active: boolean;
  readonly maximizable: boolean;
  readonly minimizable: boolean;
  readonly moveable: boolean;
  readonly resizeable: boolean;

  readonly minSize: QSize;
  readonly maxSize: QSize;

  fullScreen: boolean;
  minimized: boolean;

  frameGeometry: QRect;

  desktopsChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };
  outputChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };

  fullScreenChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };
  maximizedChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };
  minimizedChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };

  moveResizedChanged: {
    connect: (cb: () => void) => void;
    disconnect: (cb: () => void) => void;
  };
  frameGeometryAboutToChange: {
    connect: (cb: (rect: QRect) => void) => void;
    disconnect: (cb: (rect: QRect) => void) => void;
  };
  frameGeometryChanged: {
    connect: (cb: (rect: QRect) => void) => void;
    disconnect: (cb: (rect: QRect) => void) => void;
  };
}

interface KWinActionsMenuEntry {
  text: string;
  checkable?: boolean;
  checked?: boolean;
  triggered: () => void;
}
