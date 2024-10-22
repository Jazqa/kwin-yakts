import { Margin } from "./config";
import { QRect, QSize } from "./types/qt";

export const toX2 = (rect: QRect): number => {
  return rect.x + rect.width;
};

export const toY2 = (rect: QRect): number => {
  return rect.y + rect.height;
};

export const rectClone = (rect: QRect): QRect => {
  const { x, y, width, height } = rect;
  return { x, y, width, height };
};

export const rectCombine = (rectA: QRect, rectB: QRect): QRect => {
  const newRect = rectClone(rectA);

  newRect.x = Math.min(rectA.x, rectB.x);
  newRect.y = Math.min(rectA.y, rectB.y);

  const x2 = Math.max(rectA.x + rectA.width, rectB.x + rectB.width);
  const y2 = Math.max(rectA.y + rectA.height, rectB.y + rectB.height);

  newRect.width = x2 - newRect.x;
  newRect.height = y2 - newRect.y;

  return newRect;
};

export const rectAdd = (rectA: QRect, rectB: QRect): QRect => {
  const newRect = rectClone(rectA);

  newRect.x += rectB.x;
  newRect.y += rectB.y;
  newRect.width -= rectB.width + rectB.x;
  newRect.height -= rectB.height + rectB.y;

  return newRect;
};

// No clue what happens when with and height are modified in the same call, but it's completely broken
// Values look fine on JavaScript side of things, but windows go crazy
export const rectDivide = (rect: QRect, size: QSize): Array<QRect> => {
  const rectA = rectClone(rect);

  // rectA.width = rect.width * size.width;
  rectA.height = rect.height * size.height;

  const rectB = rectClone(rectA);

  // rectB.x = rectA.x + rectA.width;
  rectB.y = rectA.y + rectA.height;

  return [rectA, rectB];
};

export const rectGap = (rect: QRect, gap: number): QRect => {
  let { x, y, width, height } = rect;

  x += gap;
  y += gap;
  width -= gap * 2;
  height -= gap * 2;

  return { x, y, width, height };
};

export const rectMargin = (rect: QRect, margin: Margin): QRect => {
  let { x, y, width, height } = rect;

  x += margin.left;
  y += margin.top;
  width -= margin.left + margin.right;
  height -= margin.top + margin.bottom;

  return { x, y, width, height };
};

export const rectCenterTo = (rectA: QRect, rectB: QRect): QRect => {
  let { x, y, width, height } = rectA;

  x = (rectB.x + rectB.width) * 0.5 - width * 0.5;
  y = (rectB.y + rectB.height) * 0.5 - height * 0.5;

  return { x, y, width, height };
};

export const distanceTo = (rectA: QRect, rectB: QRect): number => {
  return Math.abs(rectA.x - rectB.x) + Math.abs(rectA.y - rectB.y);
};

const inRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

export const overlapsWith = (rectA: QRect, rectB: QRect): boolean => {
  const x = inRange(rectA.x, rectB.x, rectB.x + rectB.width) || inRange(rectB.x, rectA.x, rectA.x + rectA.width);
  const y = inRange(rectA.y, rectB.y, rectB.y + rectB.height) || inRange(rectB.y, rectA.y, rectA.y + rectA.height);
  return x && y;
};
