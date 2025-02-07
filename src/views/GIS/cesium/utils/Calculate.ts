import {
  type Viewer,
  Cartesian3,
  PolygonGeometry,
  PerInstanceColorAppearance,
  Cartographic
} from 'cesium';
export type earthVolumeAnalysisResult = {
  fillVolume: number;
  cutVolume: number;
  maxHeight: number;
  allArea: number;
  center: Cartographic;
};
export class Calculate {
  viewer: Viewer;
  #granularity: number;

  constructor(viewer: Viewer, _granularity: number = Math.PI / Math.pow(2, 19)) {
    this.viewer = viewer;
    this.#granularity = _granularity;
  }
  //修改粒度
  setGranularity(_granularity: number) {
    this.#granularity = Math.PI / Math.pow(2, _granularity);
  }
  computeAreaOfTriangle(p1: Cartesian3, p2: Cartesian3, p3: Cartesian3) {
    const v1 = Cartesian3.subtract(p1, p2, new Cartesian3());
    const v2 = Cartesian3.subtract(p3, p2, new Cartesian3());
    const v3 = Cartesian3.cross(v1, v2, new Cartesian3());
    return 0.5 * Cartesian3.magnitude(v3);
  }
  /**
   * 计算多边形的中心点
   * @param positions 点集合
   * @returns 中心点
   */
  computeCentroidOfPolygon(positions: Array<Cartesian3>) {
    const x = [];
    const y = [];

    for (let i = 0; i < positions.length; i++) {
      const cartographic = Cartographic.fromCartesian(positions[i]);

      x.push(cartographic.longitude);
      y.push(cartographic.latitude);
    }

    let x0 = 0.0,
      y0 = 0.0,
      x1 = 0.0,
      y1 = 0.0;
    let signedArea = 0.0;
    let a = 0.0;
    let centroidx = 0.0,
      centroidy = 0.0;

    for (let i = 0; i < positions.length; i++) {
      x0 = x[i];
      y0 = y[i];

      if (i == positions.length - 1) {
        x1 = x[0];
        y1 = y[0];
      } else {
        x1 = x[i + 1];
        y1 = y[i + 1];
      }

      a = x0 * y1 - x1 * y0;
      signedArea += a;
      centroidx += (x0 + x1) * a;
      centroidy += (y0 + y1) * a;
    }

    signedArea *= 0.5;
    centroidx /= 6.0 * signedArea;
    centroidy /= 6.0 * signedArea;

    return new Cartographic(centroidx, centroidy);
  }
  // 计算土方量
  earthVolumeAnalysis(
    points: Cartesian3[],
    targetHeight: number
  ): Promise<earthVolumeAnalysisResult> {
    return new Promise((resolve, reject) => {
      let fillVolume = 0;
      let cutVolume = 0;
      if (!this.viewer.terrainProvider.availability) {
        throw new Error('地形数据未加载完成');
      }
      const polygonGeometry = PolygonGeometry.fromPositions({
        positions: points,
        vertexFormat: PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: this.#granularity
      });
      const geom = PolygonGeometry.createGeometry(polygonGeometry);
      //最大高度
      let maxHeight = 0;
      //三角形的三个顶点源数据中的位置
      let i0, i1, i2;
      //三角形的三个顶点的地形高度
      let [height1, height2, height3] = [0, 0, 0];
      //三角形的三个顶点的的坐标
      let p1, p2, p3;
      //三角形的三个顶点的无高程坐标
      let bottomP1, bottomP2, bottomP3;
      const scratchCartesian = new Cartesian3();
      let cartographic: Cartographic;
      let bottomArea;
      //源数据
      const subTrianglePositions = geom?.attributes.position.values;
      let allArea = 0;
      if (!geom?.indices || !subTrianglePositions) {
        return;
      }
      for (let i = 0; i < geom.indices.length; i += 3) {
        i0 = geom.indices[i]; //点1
        i1 = geom.indices[i + 1]; //点2
        i2 = geom.indices[i + 2]; //点3
        //点1的笛卡尔坐标
        scratchCartesian.x = subTrianglePositions[i0 * 3];
        scratchCartesian.y = subTrianglePositions[i0 * 3 + 1];
        scratchCartesian.z = subTrianglePositions[i0 * 3 + 2];
        //点1的经纬度坐标
        cartographic = Cartographic.fromCartesian(scratchCartesian);
        //点1的高度
        height1 = this.viewer.scene.globe.getHeight(cartographic) as number;

        p1 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height1);
        bottomP1 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
        if (maxHeight < height1) maxHeight = height1;

        scratchCartesian.x = subTrianglePositions[i1 * 3];
        scratchCartesian.y = subTrianglePositions[i1 * 3 + 1];
        scratchCartesian.z = subTrianglePositions[i1 * 3 + 2];

        cartographic = Cartographic.fromCartesian(scratchCartesian);

        height2 = this.viewer.scene.globe.getHeight(cartographic) as number;

        p2 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height2);
        bottomP2 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);

        if (maxHeight < height2) maxHeight = height2;

        scratchCartesian.x = subTrianglePositions[i2 * 3];
        scratchCartesian.y = subTrianglePositions[i2 * 3 + 1];
        scratchCartesian.z = subTrianglePositions[i2 * 3 + 2];

        cartographic = Cartographic.fromCartesian(scratchCartesian);

        height3 = this.viewer.scene.globe.getHeight(cartographic) as number;

        p3 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height3);
        bottomP3 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);

        if (maxHeight < height3) maxHeight = height3;
        //计算三角形的面积，为防止三角形相对于椭球体是斜面所忽略高程计算
        bottomArea = this.computeAreaOfTriangle(bottomP1, bottomP2, bottomP3);
        //统计三角形面积
        allArea += bottomArea;
        //三角形平均高度，用于绘制三角柱和计算体积
        const averageHeight = (height1 + height2 + height3) / 3;
        if (averageHeight > targetHeight) {
          //统计挖方，平均高度大于目标高度即为挖方
          cutVolume += bottomArea * (averageHeight - targetHeight);
        }
        if (averageHeight < targetHeight) {
          //统计填方，平均高度小于目标高度为填方
          fillVolume += bottomArea * (targetHeight - averageHeight);
        }
        // const positionsarr = [];
        // //组合成三角形
        // positionsarr.push(p1);
        // positionsarr.push(p2);
        // positionsarr.push(p3);
      }
      resolve({
        fillVolume,
        cutVolume,
        maxHeight,
        allArea,
        center: this.computeCentroidOfPolygon(points)
      });
    });
  }
}
