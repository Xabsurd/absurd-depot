export type Point = {
  x: number;
  y: number;
};
export class Rect {
  public lt: Point;
  public rt: Point;
  public rb: Point;
  public lb: Point;
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    this.lt = { x, y };
    this.rt = { x: x + width, y };
    this.rb = { x: x + width, y: y + height };
    this.lb = { x, y: y + height };
  }
  static form(lt: Point, rb: Point) {
    return new Rect(lt.x, lt.y, rb.x - lt.x, rb.y - lt.y);
  }
}
/**
 * 计算两个点之间的欧几里得距离。
 *
 * @param {Point} p1 - 第一个点。
 * @param {Point} p2 - 第二个点。
 * @return {number} 两个点之间的距离。
 */
export function getDistance(p1: Point, p2: Point) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
/**
 * 计算一个点绕另一个点旋转一定角度后的新位置
 * @param {Point} p1 - 要旋转的点
 * @param {Point} p2 - 旋转中心点
 * @param {number} angle - 旋转角度（弧度制）
 * @returns {Point} 旋转后的新点
 */
export function rotatePoint(p1: Point, p2: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = p1.x - p2.x;
  const y = p1.y - p2.y;
  const xNew = x * cos - y * sin;
  const yNew = x * sin + y * cos;
  return {
    x: xNew + p2.x,
    y: yNew + p2.y
  };
}
/**
 * 根据给定的中心点和旋转角度，旋转一个矩形。
 *
 * @param {Rect} rect - 要旋转的矩形。
 * @param {Point} center - 旋转中心点。
 * @param {number} angle - 旋转角度（弧度）。
 * @return {Rect} 旋转后的矩形。
 */
export function rotateRect(rect: Rect, center: Point, angle: number) {
  const lt = rotatePoint(rect.lt, center, angle);
  const rb = rotatePoint(rect.rb, center, angle);
  return Rect.form(lt, rb);
}
/**
 * 计算两个给定点的中心点。
 *
 * @param {Point} p1 - 第一个点。
 * @param {Point} p2 - 第二个点。
 * @return {Point} p1 和 p2 的中心点。
 */
export function getCenterPoint(p1: Point, p2: Point) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}
