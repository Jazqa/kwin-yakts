export interface QPoint {
  x: number;
  y: number;
}

export interface QSize {
  width: number;
  height: number;
}

export interface QSides {
  left: number;
  top: number;
  bottom: number;
  right: number;
}

export type QRect = QPoint & QSize & QSides;
