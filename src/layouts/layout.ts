import { YAKTSLayout } from "../types/layout";
import { QRect } from "../types/qt";
import { Window } from "../window";

let nextLayoutId = 0;
export class Layout implements YAKTSLayout {
  name: string;
  id: number;

  rect: QRect;
  limit: number = 99;

  constructor(rect: QRect) {
    this.id = nextLayoutId++;
    this.rect = rect;
  }

  setRect = (newRect: QRect) => {
    this.rect = newRect;
  };

  tileWindows = (windows: Array<Window>) => {};

  addWindow = (window: Window, windows: Array<Window>, activeWindow?: Window) => {};

  removeWindow = (window: Window, windows: Array<Window>) => {};

  resizeWindow = (window: Window, windows: Array<Window>, oldRect: QRect) => {};

  reset() {}
}
