export class Vector2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2D) {
    this.x += v.x;
    this.y += v.y;
  }

  subtract(v: Vector2D) {
    this.x -= v.x;
    this.y -= v.y;
  }

  multiply(v: Vector2D) {
    this.x *= v.x;
    this.y *= v.y;
  }

  divide(v: Vector2D) {
    this.x /= v.x;
    this.y /= v.y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static add(v1: Vector2D, v2: Vector2D) {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1: Vector2D, v2: Vector2D) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  static multiply(v1: Vector2D, v2: Vector2D) {
    return new Vector2D(v1.x * v2.x, v1.y * v2.y);
  }

  static divide(v1: Vector2D, v2: Vector2D) {
    return new Vector2D(v1.x / v2.x, v1.y / v2.y);
  }

  static distance(v1: Vector2D, v2: Vector2D) {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
  }
}

export class Area {
  constrainingRect: DOMRect | null = null;
  public start!: Vector2D
  public end!: Vector2D

  constructor(start: Vector2D, end: Vector2D, constrainElement?: HTMLElement) {
    this.constrainingRect = constrainElement?.getBoundingClientRect() || null;
    this.set(start, end)
  }

  set(start: Vector2D, end: Vector2D) {
    this.start = start;
    this.end = end;

    if (this.constrainingRect) {
      if (this.topLeft.x < this.constrainingRect.left) {
        this.end.x = this.constrainingRect.left;
      }

      if (this.topLeft.y < this.constrainingRect.top) {
        this.end.y = this.constrainingRect.top;
      }

      if (this.bottomRight.x > this.constrainingRect.right) {
        this.end.x = this.constrainingRect.right;
      }

      if (this.bottomRight.y > this.constrainingRect.bottom) {
        this.end.y = this.constrainingRect.bottom;
      }
    }
  }

  is(area: Area) {
    return (
      this.start.x === area.start.x &&
      this.start.y === area.start.y &&
      this.end.x === area.end.x &&
      this.end.y === area.end.y
    );
  }

  get width() {
    return Math.abs(this.end.x - this.start.x);
  }

  get height() {
    return Math.abs(this.end.y - this.start.y);
  }

  get center() {
    return new Vector2D(this.start.x + this.width / 2, this.start.y + this.height / 2);
  }

  get area() {
    return this.width * this.height;
  }

  get topLeft() {
    return new Vector2D(Math.min(this.start.x, this.end.x), Math.min(this.start.y, this.end.y));
  }

  get topRight() {
    return new Vector2D(Math.max(this.start.x, this.end.x), Math.min(this.start.y, this.end.y));
  }

  get bottomLeft() {
    return new Vector2D(Math.min(this.start.x, this.end.x), Math.max(this.start.y, this.end.y));
  }

  get bottomRight() {
    return new Vector2D(Math.max(this.start.x, this.end.x), Math.max(this.start.y, this.end.y));
  }

  get points(): [Vector2D, Vector2D, Vector2D, Vector2D] {
    return [this.topLeft, this.topRight, this.bottomRight, this.bottomLeft];
  }

  intersects(area: Area): boolean {
    return (
      this.topLeft.x < area.topLeft.x + area.width &&
      this.topLeft.x + this.width > area.topLeft.x &&
      this.topLeft.y < area.topLeft.y + area.height &&
      this.height + this.topLeft.y > area.topLeft.y
    );
  }

  static fromElement(element: HTMLElement, buffer = new Vector2D(0, 0)) {
    const boundingRect = element.getBoundingClientRect();
    const rect = {
      top: boundingRect.top + buffer.y,
      left: boundingRect.left + buffer.x,
      bottom: boundingRect.bottom + buffer.y,
      right: boundingRect.right + buffer.x,
    };

    return new Area(new Vector2D(rect.left, rect.top), new Vector2D(rect.right, rect.bottom));
  }

  static fromDOMRect(rect: DOMRect, buffer = new Vector2D(0, 0)) {
    return new Area(
      new Vector2D(rect.left + buffer.x, rect.top + buffer.y),
      new Vector2D(rect.right + buffer.x, rect.bottom + buffer.y)
    );
  }
}
