import { Edge, overlapsWith, rectAdd, rectCombineV, rectDivideV } from "../math";
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
  // @param edge    - "Raw" resize edge from the resize event (even if it goes way over bounds)
  resizeLayout = (layoutA: Layout, edge: Edge) => {
    // Actual resize edge used to resize layoutA (sides have values only if another layer was resized towards the side)
    const edgeA = new Edge();

    this.layouts.forEach((layoutB) => {
      if (layoutB.id === layoutA.id) return;

      // Overlap edge between layoutB and layoutA
      const edgeB = new Edge();

      if (layoutB.rect.top === layoutA.rect.bottom) {
        edgeA.bottom = edge.bottom;
        edgeB.top += edge.bottom;
      }

      if (layoutB.rect.left === layoutA.rect.right) {
        edgeA.right = edge.right;
        edgeB.left += edge.right;
      }

      if (layoutB.rect.bottom === layoutA.rect.top) {
        edgeA.top = edge.top;
        edgeB.bottom += edge.top;
      }

      if (layoutB.rect.right === layoutA.rect.left) {
        edgeA.left = edge.left;
        edgeB.right += edge.left;
      }

      const rectB = rectAdd(layoutB.rect, edgeB);
      layoutB.adjustRect(rectB);
    });

    const rectA = rectAdd(layoutA.rect, edgeA);
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
