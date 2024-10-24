import { Ori, Rect } from "../rect";
import { Layout } from "../types/layout";
import { QRect } from "../types/qt";
import { Window } from "../window";
import { BaseLayout } from "./BaseLayout";
import { Columns } from "./Columns";

export class Full extends BaseLayout {
  name: string = "Full";

  rect: QRect;
  limit: number = 0;
  layouts: Array<Layout> = [];

  constructor(rect: QRect) {
    super(rect);
    const layout = new Columns(rect);
    this.addLayout(layout);
  }

  addLayout = (layout: Layout) => {
    this.layouts.push(layout);
    this.limit += layout.limit;
  };

  createLayout = (layoutA: Layout) => {
    const [rectA, rectB] = new Rect(layoutA.rect).split(Ori.V);

    layoutA.setRect(rectA);
    const layoutB = new Columns(rectB);

    this.addLayout(layoutB);
  };

  removeLayout = () => {
    const length = this.layouts.length;

    const layoutA = this.layouts[length - 2];
    const layoutB = this.layouts.splice(length - 1)[0];

    this.limit -= layoutB.limit;
    layoutA.setRect(new Rect(layoutA.rect).combine(layoutB.rect));
  };

  // @param layoutA - The layout in which a window triggered the resize event
  // @param rect    - "Raw" resize rect from the resize event (even if it goes way over bounds)
  resizeLayout = (layoutA: Layout, rect: QRect) => {
    // Actual resize rect used to resize layoutA (has values only on overlap)
    const rectA = new Rect(layoutA.rect);
    const overlapA = new Rect();

    this.layouts.forEach((layoutB) => {
      if (layoutB.id === layoutA.id) return;
      // Overlap rect between layoutB and layoutA
      const rectB = new Rect(layoutB.rect);
      const overlapB = new Rect();

      if (rectA.y === rectB.y2) {
        overlapA.y = rect.y;
        overlapB.height = -rect.y;
      }

      if (rectB.y === rectA.y2) {
        overlapB.y = rect.height;
        overlapA.height = -rect.height;
      }

      if (rectA.x === rectB.x2) {
        overlapA.x = rect.x;
        overlapB.width = -rect.x;
      }

      if (rectB.x === rectA.x2) {
        overlapB.x = rect.width;
        overlapA.width = -rect.width;
      }

      layoutB.setRect(new Rect(rectB).add(overlapB));
    });

    layoutA.setRect(new Rect(rectA).add(overlapA));
  };

  tileWindows = (windows: Array<Window>) => {
    const length = this.layouts.length;
    const layoutA = this.layouts[length - 1];

    if (windows.length > this.limit) {
      this.createLayout(layoutA);
    } else if (length > 1 && windows.length <= this.limit - layoutA.limit) {
      this.removeLayout();
    }

    let i = 0;
    this.layouts.forEach((layout) => {
      const j = i + layout.limit;
      const w = windows.slice(i, j);
      layout.tileWindows(w);
      i = j;
    });
  };

  resizeWindow = (window: Window, oldRect: QRect) => {
    this.layouts.some((layout) => {
      if (new Rect(oldRect).intersects(layout.rect)) {
        const rect = layout.resizeWindow(window, oldRect);

        if (rect) {
          this.resizeLayout(layout, rect);
        }

        return true;
      }
    });
  };

  reset() {}
}
