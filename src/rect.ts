import { Margin } from "./config";
import { QPoint, QRect } from "./types/qt";

/**
 * Enum for direction in two-dimensional space.
 * @enum
 */
export enum Dir {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
}

/**
 * Checks if `value` is between `min` and `max`.
 * @param value Value to check
 * @param min Minimum acceptable value
 * @param max Maximum acceptable value
 * @returns Whether the `value` is between `min` and `max`
 */
const between = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

/**
 * Represents a rectangle in two-dimensional space.
 * @extends QRect Adds additional helpers for easy two-dimensional math
 */
export class Rect implements QRect {
  x: number;
  y: number;
  width: number;
  height: number;

  get kwin(): QRect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  get x2() {
    return this.x + this.width;
  }

  get y2() {
    return this.y + this.height;
  }

  /**
   *
   * @param rect {@link QRect} to base `this` on
   */
  constructor(rect?: QRect) {
    if (!rect) rect = { x: 0, y: 0, width: 0, height: 0 };
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Clones `this`.
   * @returns New instance of `this`
   */
  clone = (): Rect => {
    return new Rect(this);
  };

  /**
   * Checks if `this` intersects with `rect`.
   * @param rect {@link QRect} to check
   * @returns Whether there is an intersection between `this` and `rect`
   */
  intersects = (rect: QRect): boolean => {
    const x = between(this.x, rect.x, rect.x + rect.width) || between(rect.x, this.x, this.x + this.width);
    const y = between(this.y, rect.y, rect.y + rect.height) || between(rect.y, this.y, this.y + this.height);
    return x && y;
  };

  /**
   * Calculates the distance between `this` and `rect`.
   * @param rect {@link QRect} to calculate distance to
   * @returns Distance between `this` and `rect`
   */
  distance = (rect: QRect): number => {
    return Math.abs(this.x - rect.x) + Math.abs(this.y - rect.y);
  };

  /**
   * Positions `this` in the center of `rect`.
   * @param rect {@link QRect} to center in
   * @mutates `this`
   * @returns {this} `this`
   */
  center = (rect: QRect): Rect => {
    this.x = (rect.x + rect.width) * 0.5 - this.width * 0.5;
    this.y = (rect.y + rect.height) * 0.5 - this.height * 0.5;
    return this;
  };

  /**
   * Adjusts `this` by `rect`.
   * @param rect {@link QRect} to adjust by
   * @mutates `this`
   * @returns `this`
   */
  add = (rect: QRect): Rect => {
    this.x += rect.x;
    this.y += rect.y;
    this.width -= rect.width + rect.x;
    this.height -= rect.height + rect.y;
    return this;
  };

  /**
   * Combines `this` with `rect`.
   * @param rect {@link QRect} to combine with
   * @mutates `this`
   * @returns `this`
   */
  combine = (rect: QRect): Rect => {
    const x2 = Math.max(this.x2, rect.x + rect.width);
    const y2 = Math.max(this.y2, rect.y + rect.height);

    this.x = Math.min(this.x, rect.x);
    this.y = Math.min(this.y, rect.y);

    this.width = x2 - this.x;
    this.height = y2 - this.y;

    return this;
  };

  /**
   * Creates two halves of `this`.
   * @param v Creates vertical halves instead of horizontal ones
   * @returns Two halves of `this`
   */
  split = (v: boolean): [Rect, Rect] => {
    const rectA = this.clone();
    const rectB = rectA.clone();

    if (v) {
      rectA.height *= 0.5;
      rectB.height *= 0.5;
      rectB.y = rectA.y + rectA.height;
    } else {
      rectA.width *= 0.5;
      rectB.width *= 0.5;
      rectB.x = rectA.x + rectA.width;
    }

    return [rectA, rectB];
  };

  /**
   * Adds space around `this`.
   * @param size Amount of space to add
   * @mutates `this`
   * @returns `this`
   */
  gap = (size: number): Rect => {
    this.x += size;
    this.y += size;
    this.width -= size * 2;
    this.height -= size * 2;

    return this;
  };

  /**
   * Adds space around `this`.
   * @param margin {@link Margin} to add
   * @mutates `this`
   * @returns `this`
   */
  margin = (margin: Margin): Rect => {
    this.x += margin.left;
    this.y += margin.top;
    this.width -= margin.left + margin.right;
    this.height -= margin.top + margin.bottom;

    return this;
  };
}
