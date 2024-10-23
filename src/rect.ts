import { Margin } from "./config";
import { QPoint, QRect } from "./types/qt";

const inRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export class Rect {
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

  constructor(rect?: QRect) {
    if (!rect) rect = { x: 0, y: 0, width: 0, height: 0 };
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }

  clone = (): Rect => {
    return new Rect(this);
  };

  intersects = (rect: QRect): boolean => {
    const x = inRange(this.x, rect.x, rect.x + rect.width) || inRange(rect.x, this.x, this.x + this.width);
    const y = inRange(this.y, rect.y, rect.y + rect.height) || inRange(rect.y, this.y, this.y + this.height);
    return x && y;
  };

  distance = (rect: QRect): number => {
    return Math.abs(this.x - rect.x) + Math.abs(this.y - rect.y);
  };

  center = (rect: QRect): Rect => {
    this.x = (rect.x + rect.width) * 0.5 - this.width * 0.5;
    this.y = (rect.y + rect.height) * 0.5 - this.height * 0.5;

    return this;
  };

  add = (rect: QRect): Rect => {
    this.x += rect.x;
    this.y += rect.y;
    this.width -= rect.width + rect.x;
    this.height -= rect.height + rect.y;

    return this;
  };

  combine = (rect: QRect): Rect => {
    const x2 = Math.max(this.x2, rect.x + rect.width);
    const y2 = Math.max(this.y2, rect.y + rect.height);

    this.x = Math.min(this.x, rect.x);
    this.y = Math.min(this.y, rect.y);

    this.width = x2 - this.x;
    this.height = y2 - this.y;

    return this;
  };

  // No clue what happens when with and height are modified in the same call, but it's completely broken
  // Values look fine on JavaScript side of things, but windows go crazy
  divide = (point: QPoint): Array<Rect> => {
    // this.width *= point.x;
    this.height *= point.y;

    const rect = new Rect(this);

    // rect.x = this.x + this.width;
    rect.y = this.y + this.height;

    return [this, rect];
  };

  gap = (gap: number): Rect => {
    this.x += gap;
    this.y += gap;
    this.width -= gap * 2;
    this.height -= gap * 2;

    return this;
  };

  margin = (margin: Margin): Rect => {
    this.x += margin.left;
    this.y += margin.top;
    this.width -= margin.left + margin.right;
    this.height -= margin.top + margin.bottom;

    return this;
  };
}
