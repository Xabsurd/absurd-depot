import { getCenterPoint, getDistance, type Point } from './geometric';

export class BezierCurve {
  //点与点之间的中心点
  centerPoints: Point[] = [];
  /**
   * 曲线穿过的点
   */
  public points: (Point & {
    /**
     * 控制点相对与当前点的偏移量
     * */
    bezier?: {
      /**
       * 与上一个点的偏移量
       */
      prev: Point;
      /**
       * 与下一个点的偏移量
       */
      next: Point;
    };
  })[];
  public constructor(
    _points: Point[],
    public close = true
  ) {
    this.points = _points;
    this.calculatControlPoints();
  }
  /**
   * 计算贝塞尔曲线的控制点。
   *
   * 该函数遍历曲线上的点并计算每个线段的控制点。如果曲线是闭合的，它还计算最后一个线段的控制点，该线段连接最后一个点和第一个点。
   *
   * @return {{ p1: Point; p2: Point; }[]} 控制点数组，每个控制点是一个对象，具有两个属性：`p1`和`p2`，分别是控制点的坐标。
   */
  getControlPoints() {
    if (this.points.length < 3) {
      return [];
    }
    const controlPoints: {
      p1: Point;
      p2: Point;
    }[] = [];
    for (let i = 1; i < this.points.length; i++) {
      const point = this.points[i];
      let p1 = this.points[i - 1];
      let p2 = point;
      if (p1.bezier) {
        p1 = { x: p1.x + p1.bezier.next.x, y: p1.y + p1.bezier.next.y };
      }
      if (p2.bezier) {
        p2 = { x: p2.x + p2.bezier.prev.x, y: p2.y + p2.bezier.prev.y };
      }
      controlPoints.push({ p1, p2 });
    }
    //如果需要闭合曲线，那么需要计算最后一个点和第一个点的控制点
    if (this.close && this.points.length > 2) {
      let p1 = this.points[this.points.length - 1];
      let p2 = this.points[0];
      if (p1.bezier) {
        p1 = { x: p1.x + p1.bezier.next.x, y: p1.y + p1.bezier.next.y };
      }
      if (p2.bezier) {
        p2 = { x: p2.x + p2.bezier.prev.x, y: p2.y + p2.bezier.prev.y };
      }
      controlPoints.push({ p1, p2 });
    }
    return controlPoints;
  }
  /**
   * 计算贝塞尔曲线的控制点。
   *
   * 该函数根据给定的点计算贝塞尔曲线的控制点。
   * 首先，它计算曲线的中心点，然后使用这些中心点计算控制点。
   * 如果曲线是闭合的，它还计算最后一个点和第一个点的控制点。
   *
   * @return {void}
   */
  calculatControlPoints() {
    if (this.points.length > 2) {
      for (let i = 1; i < this.points.length; i++) {
        const point = this.points[i];
        this.centerPoints[i - 1] = getCenterPoint(this.points[i - 1], point);
      }
      if (this.close)
        //如果需要闭合曲线，那么需要计算最后一个点和第一个点的中心点
        this.centerPoints[this.points.length - 1] = getCenterPoint(
          this.points[this.points.length - 1],
          this.points[0]
        );

      //计算贝塞尔曲线
      if (this.centerPoints.length > 1) {
        for (
          let i = this.centerPoints.length - (this.close ? 2 : 1);
          i < this.centerPoints.length - (this.close ? 1 : 0);
          i++
        ) {
          const cp = this.centerPoints[i];
          //计算当前点与上一个点的距离
          const dist1 = getDistance(this.points[i - 1], this.points[i]);
          //计算当前点与下一个点的距离
          const dist2 = getDistance(this.points[i], this.points[i + 1]);
          //计算贝塞尔曲线
          this.points[i].bezier = this.getBezier(
            this.centerPoints[i - 1],
            cp,
            dist1 / (dist1 + dist2)
          );
        }
        if (this.close) {
          //最后一个点
          const lastdist1 = getDistance(
            this.points[this.points.length - 1],
            this.points[this.points.length - 2]
          );
          const lastdist2 = getDistance(this.points[this.points.length - 1], this.points[0]);
          this.points[this.points.length - 1].bezier = this.getBezier(
            this.centerPoints[this.centerPoints.length - 2],
            this.centerPoints[this.centerPoints.length - 1],
            lastdist1 / (lastdist1 + lastdist2)
          );
          //第一个点
          const firstdist1 = getDistance(this.points[0], this.points[1]);
          const firstdist2 = getDistance(this.points[0], this.points[this.points.length - 1]);
          this.points[0].bezier = this.getBezier(
            this.centerPoints[this.centerPoints.length - 1],
            this.centerPoints[0],
            firstdist1 / (firstdist1 + firstdist2)
          );
        }
      }
    }
  }
  /**
   * 根据给定的点和比率计算控制点的相对偏移量。
   *
   * @param {Point} p1 - 线段的第一个点。
   * @param {Point} p2 - 线段的第二个点。
   * @param {number} ratio - 长度比率。
   * @return {Object} 相对偏移量
   */
  getBezier(p1: Point, p2: Point, ratio: number) {
    const prev = { x: (p2.x - p1.x) * ratio * -1, y: (p2.y - p1.y) * ratio * -1 };
    const next = { x: (p2.x - p1.x) * (1 - ratio), y: (p2.y - p1.y) * (1 - ratio) };
    return { prev, next };
  }
}
