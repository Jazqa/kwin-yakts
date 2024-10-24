import { Window } from "../window";
import { QRect } from "./qt";

export interface Layout {
  /**
   * Name of the layout.
   */
  readonly name: string;

  /**
   * @property Unique identifier for each instance of the layout.
   */
  readonly id: string;

  /**
   * @property {@link QRect} of the layout
   */
  rect: QRect;

  /**
   * Maximum amount of Windows the layout can tile.
   */
  limit: number;

  /**
   * @param rect {@link QRect} of the layout
   */
  setRect: (rect: QRect) => void;

  /**
   * Tiles all `windows` according to the layout's tiling logic.
   *
   * @param windows Array of {@link Window|Windows} managed by the layout
   */
  tileWindows: (windows: Array<Window>) => void;

  /**
   * Resizes `window` and adjusts the layout accordingly.
   * @param window {@link Window} that was resized
   * @param oldRect {@link QRect} of the {@link Window} before it was resized
   */
  resizeWindow: (window: Window, oldRect: QRect) => QRect | void;

  /**
   * Resets the layout to its original state.
   */
  reset: () => void;
}
