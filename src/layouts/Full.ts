import { Sides, overlapsWith, rectAdd, rectCombineV, rectDivideV } from "../math";
import { QRect } from "../types/qt";
import { Window } from "../window";
import { Layout } from "../types/layout";
import { Columns } from "./Columns";
import { Rows } from "./Rows";

export class Full implements Layout {
  id: string = "Full";

  rect: QRect;
  limit: number = 0;
  layouts: Array<Layout> = [];

  constructor(rect: QRect) {
    this.rect = rect;

    const layout = new Columns(rect);
    this.addLayout(layout);
  }

  adjustRect = (newRect: QRect) => {};

  addLayout = (layout: Layout) => {
    this.layouts.push(layout);
    this.limit += layout.limit;
  };

  createLayout = (layoutA: Layout) => {
    const rects = rectDivideV(layoutA.rect);

    layoutA.adjustRect(rects[0]);
    const layoutB = new Columns(rects[1]);

    this.addLayout(layoutB);
  };

  removeLayout = () => {
    const length = this.layouts.length;

    const layoutA = this.layouts[length - 2];
    const layoutB = this.layouts.splice(length - 1)[0];

    this.limit -= layoutB.limit;
    layoutA.adjustRect(rectCombineV(layoutA.rect, layoutB.rect));
  };

  // @param layoutA - The layout in which a window triggered the resize event
  // @param sides    - "Raw" resize sides from the resize event (even if it goes way over bounds)
  resizeLayout = (layoutA: Layout, sides: Sides) => {
    // Actual resize sides used to resize layoutA (sides have values only if another layer was resized towards the side)
    const sidesA = new Sides();

    this.layouts.forEach((layoutB) => {
      if (layoutB.id === layoutA.id) return;

      // Overlap edge between layoutB and layoutA
      const sidesB = new Sides();

      if (layoutB.rect.top === layoutA.rect.bottom) {
        sidesA.bottom = sides.bottom;
        sidesB.top += sides.bottom;
      }

      if (layoutB.rect.left === layoutA.rect.right) {
        sidesA.right = sides.right;
        sidesB.left += sides.right;
      }

      if (layoutB.rect.bottom === layoutA.rect.top) {
        sidesA.top = sides.top;
        sidesB.bottom += sides.top;
      }

      if (layoutB.rect.right === layoutA.rect.left) {
        sidesA.left = sides.left;
        sidesB.right += sides.left;
      }

      const rectB = rectAdd(layoutB.rect, sidesB);
      layoutB.adjustRect(rectB);
    });

    const rectA = rectAdd(layoutA.rect, sidesA);
    layoutA.adjustRect(rectA);
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
