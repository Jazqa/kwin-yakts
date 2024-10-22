import { overlapsWith, rectAdd, rectCombine, rectDivide, toX2, toY2 } from "../math";
import { QRect } from "../types/qt";
import { Window } from "../window";
import { Layout } from "../types/layout";
import { Columns } from "./Columns";
import { Rows } from "./Rows";
import { BaseLayout } from "./BaseLayout";

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

  adjustRect = (newRect: QRect) => {};

  addLayout = (layout: Layout) => {
    this.layouts.push(layout);
    this.limit += layout.limit;
  };

  createLayout = (layoutA: Layout) => {
    const rects = rectDivide(layoutA.rect, { width: 1, height: 0.5 });

    layoutA.adjustRect(rects[0]);
    const layoutB = new Columns(rects[1]);

    this.addLayout(layoutB);
  };

  removeLayout = () => {
    const length = this.layouts.length;

    const layoutA = this.layouts[length - 2];
    const layoutB = this.layouts.splice(length - 1)[0];

    this.limit -= layoutB.limit;
    layoutA.adjustRect(rectCombine(layoutA.rect, layoutB.rect));
  };

  // @param layoutA - The layout in which a window triggered the resize event
  // @param rect    - "Raw" resize rect from the resize event (even if it goes way over bounds)
  resizeLayout = (layoutA: Layout, rect: QRect) => {
    // Actual resize rect used to resize layoutA (has values only on overlap)
    const rectA = { x: 0, y: 0, width: 0, height: 0 };

    this.layouts.forEach((layoutB) => {
      if (layoutB.id === layoutA.id) return;
      // Overlap rect between layoutB and layoutA
      const rectB = { x: 0, y: 0, width: 0, height: 0 };

      if (layoutA.rect.y === toY2(layoutB.rect)) {
        rectA.y = rect.y;
        rectB.height = -rect.y;
      }

      if (layoutB.rect.y === toY2(layoutA.rect)) {
        rectB.y = rect.height;
        rectA.height = -rect.height;
      }

      if (layoutA.rect.x === toX2(layoutB.rect)) {
        rectA.x = rect.x;
        rectB.width = -rect.x;
      }

      if (layoutB.rect.x === toX2(layoutA.rect)) {
        rectB.x = rect.width;
        rectA.width = -rect.width;
      }

      layoutB.adjustRect(rectAdd(layoutB.rect, rectB));
    });

    layoutA.adjustRect(rectAdd(layoutA.rect, rectA));
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
      if (overlapsWith(layout.rect, oldRect)) {
        const edge = layout.resizeWindow(window, oldRect);

        if (edge) {
          this.resizeLayout(layout, edge);
        }

        return true;
      }
    });
  };

  reset() {}
}
