/**
 * Represents a point in two-dimensional space
 *
 * @interface
 */
export interface QPoint {
  x: number;
  y: number;
}

/**
 * Represents a rectangle with an unknown position
 *
 * @interface
 */
export interface QSize {
  width: number;
  height: number;
}

/**
 * Represents a rectangle in two-dimensional space
 *
 * @interface
 */
export type QRect = QPoint & QSize;
