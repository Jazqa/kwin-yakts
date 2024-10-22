import { Layout } from "../types/layout";
import { QRect } from "../types/qt";
import { Window } from "../window";

let id = 0;
export class BaseLayout implements Layout {
  name: string;
  id: string;

  rect: QRect;
  limit: number;

  constructor(rect: QRect) {
    this.id = id.toString();
    id++;

    this.rect = rect;
  }

  adjustRect = (newRect: QRect) => {};

  tileWindows = (windows: Array<Window>) => {};

  resizeWindow = (window: Window, oldRect: QRect) => {};

  reset() {}
}
