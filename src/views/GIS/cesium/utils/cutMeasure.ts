import type { Viewer, Entity, PositionProperty } from 'cesium';
import {
  Cartographic,
  CustomDataSource,
  ScreenSpaceEventHandler,
  Cartesian3,
  PolygonGeometry,
  PerInstanceColorAppearance,
  Color,
  ScreenSpaceEventType,
  defined,
  CallbackProperty,
  PolygonHierarchy,
  ColorMaterialProperty
} from 'cesium';

export class cutMeasure {
  //私有变量
  #viewer: Viewer; //地图对象
  #granularity: number; //计算粒度
  #drawLayer: CustomDataSource; //绘制的图层
  #handle: ScreenSpaceEventHandler | undefined;
  /**
   *
   * @param _viewer Viewer
   * @param _granularity 计算粒度,数字越大越精确,建议15-22区间，默认值:19
   */
  constructor(_viewer: Viewer, _granularity: number = Math.PI / Math.pow(2, 19)) {
    if (!_viewer) {
      throw new Error('必要参数:_viewer: Viewer');
    }
    this.#viewer = _viewer;
    this.#drawLayer = new CustomDataSource('cutMeasureLayer');
    this.#granularity = _granularity;
    this.#viewer.dataSources.add(this.#drawLayer);
  }
  /**
   * 创建一个土方量分析
   * @param cutHeight 目标高度
   * @returns Promise
   */
  createCutVolumeAnalysis(cutHeight: number) {
    this.#viewer.scene.globe.depthTestAgainstTerrain = true;
    this.#handle = new ScreenSpaceEventHandler(this.#viewer.scene.canvas);
    return new Promise((reslove) => {
      this.#Draw(cutHeight).then((points) => {
        this.#CutVolumeAnalysis(points as Array<Cartesian3>, cutHeight).then((data) => {
          reslove(data);
        });
      });
    });
  }
  changeGranularity(val: number) {
    this.#granularity = Math.PI / Math.pow(2, val);
  }
  clearMeasure() {
    this.#drawLayer.entities.removeAll();
  }
  destroy() {
    try {
      this.#handle?.destroy();
      this.#handle = undefined;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * 土方量分析
   * @param points
   * @param cutHeight
   * @returns Promise
   */
  #CutVolumeAnalysis(points: Array<Cartesian3>, cutHeight: number) {
    return new Promise((reslove, reject) => {
      if (points) {
        this.#computeCutVolume(points, cutHeight).then((data) => {
          reslove(data);
        });
      } else {
        reject();
      }
    });
  }
  /**
   * 计算多边形的中心点
   * @param positions 点集合
   * @returns 中心点
   */
  #computeCentroidOfPolygon(positions: Array<Cartesian3>) {
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
  /**
   * 计算三角形的面积
   * @param {*} pos1 三角形的第一个顶点
   * @param {*} pos2 三角形的第二个顶点
   * @param {*} pos3 三角形的第三个顶点
   * @return 面积
   */
  #computeAreaOfTriangle(pos1: Cartesian3, pos2: Cartesian3, pos3: Cartesian3) {
    const a = Cartesian3.distance(pos1, pos2);
    const b = Cartesian3.distance(pos2, pos3);
    const c = Cartesian3.distance(pos3, pos1);

    const S = (a + b + c) / 2;

    return Math.sqrt(S * (S - a) * (S - b) * (S - c));
  }
  /**
   * 计算土方量
   * @param positions 点集合
   * @param cutHeight 目标高度
   * @returns Promise->reslove(data)
   */
  #computeCutVolume(positions: Cartesian3[], cutHeight: number) {
    return new Promise((reslove) => {
      let waCutVolume = 0,
        tianCutVolume = 0;
      if (!this.#viewer.terrainProvider.availability) {
        throw new Error('未获取到地形');
      }
      //微分成三角形
      const polygonGeometry = PolygonGeometry.fromPositions({
        positions: positions,
        vertexFormat: PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: this.#granularity
      });

      const geom = PolygonGeometry.createGeometry(polygonGeometry);
      //最大高度
      let maxHeight = 0;
      //三角形的三个顶点在源数据中的位置
      let i0, i1, i2;
      //三角形的三个顶点的高度
      let height1 = 0,
        height2 = 0,
        height3 = 0;
      //三角形的三个顶点的坐标
      let p1, p2, p3;
      //三角形的三个顶点的无高程坐标
      let bottomP1, bottomP2, bottomP3;
      const scratchCartesian = new Cartesian3();
      let cartographic: Cartographic;
      let bottomArea;
      //源数据
      const subTrianglePositions = geom?.attributes.position?.values;
      let allArea = 0;
      if (!geom?.indices || !subTrianglePositions) {
        return;
      }
      //三角形有三个顶点，所以每次循环下标都+3
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
        height1 = this.#viewer.scene.globe.getHeight(cartographic) as number;

        p1 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height1);
        bottomP1 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
        if (maxHeight < height1) maxHeight = height1;

        scratchCartesian.x = subTrianglePositions[i1 * 3];
        scratchCartesian.y = subTrianglePositions[i1 * 3 + 1];
        scratchCartesian.z = subTrianglePositions[i1 * 3 + 2];

        cartographic = Cartographic.fromCartesian(scratchCartesian);

        height2 = this.#viewer.scene.globe.getHeight(cartographic) as number;

        p2 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height2);
        bottomP2 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);

        if (maxHeight < height2) maxHeight = height2;

        scratchCartesian.x = subTrianglePositions[i2 * 3];
        scratchCartesian.y = subTrianglePositions[i2 * 3 + 1];
        scratchCartesian.z = subTrianglePositions[i2 * 3 + 2];

        cartographic = Cartographic.fromCartesian(scratchCartesian);

        height3 = this.#viewer.scene.globe.getHeight(cartographic) as number;

        p3 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height3);
        bottomP3 = Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);

        if (maxHeight < height3) maxHeight = height3;
        //计算三角形的面积，为防止三角形相对于椭球体是斜面所忽略高程计算
        bottomArea = this.#computeAreaOfTriangle(bottomP1, bottomP2, bottomP3);
        //统计三角形面积
        allArea += bottomArea;
        //三角形平均高度，用于绘制三角柱和计算体积
        const averageHeight = (height1 + height2 + height3) / 3;
        if (averageHeight > cutHeight) {
          //统计挖方，平均高度大于目标高度即为挖方
          waCutVolume += bottomArea * (averageHeight - cutHeight);
        }
        if (averageHeight < cutHeight) {
          //统计填方，平均高度小于目标高度为填方
          tianCutVolume += bottomArea * (cutHeight - averageHeight);
        }
        const positionsarr = [];
        //组合成三角形
        positionsarr.push(p1);
        positionsarr.push(p2);
        positionsarr.push(p3);
        //添加三角柱
        const drawingPolygon = {
          polygon: {
            hierarchy: {
              positions: positionsarr
            },
            height: averageHeight,
            extrudedHeight: cutHeight,
            // perPositionHeight: true,
            material: Color.fromBytes(10, 101, 10, 0),
            outline: true,
            // closeTop: true,
            // closeBottom: true,
            outlineColor: Color.WHITE
          }
        } as unknown as Entity;

        this.#drawLayer.entities.add(drawingPolygon);
      }
      //几何的中心点坐标，用于文字显示
      const centroid = this.#computeCentroidOfPolygon(positions);
      //显示的几何的顶面高度
      let showHeight = cutHeight > maxHeight ? cutHeight : maxHeight;
      let showPoistion;
      //底面积过小时文字不能显示的太高不然很奇怪
      if (allArea < 1000) {
        showHeight += (20 * allArea) / 1000 < 2 ? 2 : (20 * allArea) / 1000;
      } else {
        showHeight += 20;
      }

      if (allArea < 400) {
        //面积过小时的显示在第一个点位置
        const car = Cartographic.fromCartesian(positions[0]);
        showPoistion = Cartesian3.fromRadians(car.longitude, car.latitude, showHeight);
      } else {
        //否则显示在中心点位置
        showPoistion = Cartesian3.fromRadians(centroid.longitude, centroid.latitude, showHeight);
      }
      //添加文字
      this.#drawLayer.entities.add({
        position: showPoistion,
        label: {
          text: '挖方体积: ' + waCutVolume + 'm³\n 填方体积: ' + tianCutVolume + 'm³',
          fillColor: Color.WHITE,
          showBackground: true,
          font: '14px monospace'
        }
      });
      reslove({
        waCutVolume: waCutVolume,
        tianCutVolume: tianCutVolume,
        maxHeight: maxHeight
        // minHeight: minHeight,
      });
      // return maxHeight;
    });
  }
  //创建一个点实体
  #createPoint(worldPosition: Cartesian3) {
    return this.#drawLayer.entities.add({
      position: worldPosition,
      point: {
        color: Color.WHITE,
        pixelSize: 8
        // heightReference: HeightReference.CLAMP_TO_GROUND,
      }
    });
  }
  /**
   * 绘制一个多边形
   * @param cutHeight 目标高度
   * @returns  Promise->reslove(几何的点)
   */
  #Draw(cutHeight: number) {
    return new Promise((reslove) => {
      let activeShapePoints: Array<Cartesian3> = [];
      let activeShape: Entity | null;
      let floatingPoint: Entity | null;

      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const earthPosition = this.#viewer.scene.pickPosition(event.position);
        if (defined(earthPosition)) {
          if (activeShapePoints.length === 0) {
            floatingPoint = this.#createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            const dynamicPositions = new CallbackProperty(() => {
              return new PolygonHierarchy(activeShapePoints);
            }, false);
            activeShape = this.#drawLayer.entities.add({
              //绘制动态图
              polygon: {
                //heightReference: HeightReference.RELATIVE_TO_GROUND,
                hierarchy: dynamicPositions,
                material: new ColorMaterialProperty(Color.WHITE.withAlpha(0.7))
                // heightReference:HeightReference.NONE
                // shadows:ShadowMode.RECEIVE_ONLY
              }
            });
          }
          activeShapePoints.pop();
          activeShapePoints.push(earthPosition);
          activeShapePoints.push(earthPosition);
          this.#createPoint(earthPosition); //添加点
        }
        return false;
      }, ScreenSpaceEventType.LEFT_CLICK);

      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
        if (defined(floatingPoint)) {
          const newPosition = this.#viewer.scene.pickPosition(event.endPosition);
          if (defined(newPosition)) {
            if (floatingPoint?.position) {
              floatingPoint.position = newPosition as unknown as PositionProperty;
            }
            // floatingPoint?.position.setValue(newPosition);
            // activeShapePoints.pop();
            // activeShapePoints.push(newPosition);
            activeShapePoints[activeShapePoints.length - 1] = newPosition;
          }
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      this.#handle?.setInputAction(() => {
        activeShapePoints.pop(); //去除最后一个动态点
        activeShapePoints.pop();
        terminateShape();
        this.#viewer.trackedEntity = undefined;
        return false;
      }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      this.#handle?.setInputAction(() => {
        terminateShape();
        this.#viewer.trackedEntity = undefined;
        return false;
      }, ScreenSpaceEventType.RIGHT_CLICK);
      //绘制最终几何
      const terminateShape = () => {
        this.#drawLayer.entities.add({
          polygon: {
            hierarchy: activeShapePoints, //getAllHeight(activeShapePoints),
            extrudedHeight: cutHeight,
            perPositionHeight: true,
            material: Color.CYAN.withAlpha(0.5),
            outline: true,
            closeTop: false,
            closeBottom: false,
            outlineColor: Color.WHITE
          }
        });
        this.#viewer.entities.remove(floatingPoint as Entity); //去除动态点图形（当前鼠标点）
        this.#viewer.entities.remove(activeShape as Entity); //去除动态图形
        floatingPoint = null;
        activeShape = null;
        this.#handle?.destroy();
        reslove(activeShapePoints);
        outputGEO(activeShapePoints);

        activeShapePoints = [];
      };
      //获取所有点的经纬度和实际高度并转换成笛卡尔坐标
      // const getAllHeight = (points: Array<Cartesian3>) => {
      //   const hp = [];
      //   for (let i = 0; i < points.length; i++) {
      //     const cartographic = Cartographic.fromCartesian(points[i]);
      //     hp.push(
      //       Cartesian3.fromRadians(
      //         cartographic.longitude,
      //         cartographic.latitude,
      //         this.#viewer.scene.globe.getHeight(cartographic)
      //       )
      //     );
      //   }
      //   return hp;
      // };
    });
  }
}

function outputGEO(points: Cartesian3[]) {
  let str = '';
  for (let i = 0; i < points.length; i++) {
    const element = points[i];
    str += `new Cartesian3(${element.x}, ${element.y}, ${element.z}),\n`;
  }
  console.log(str);
}
