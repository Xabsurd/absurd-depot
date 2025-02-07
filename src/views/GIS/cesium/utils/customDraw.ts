import { cloneDeep } from 'lodash';
import type { Viewer, Cartesian3, Entity } from 'cesium';
import {
  ScreenSpaceEventHandler,
  CustomDataSource,
  Color,
  CallbackProperty,
  PolygonHierarchy,
  PolylineGlowMaterialProperty,
  defined,
  ScreenSpaceEventType
} from 'cesium';
enum DrawType {
  polygon = 'polygon',
  polyline = 'polyline'
}
export default class customDraw {
  //私有变量
  #viewer: Viewer; //地图对象
  #drawLayer: CustomDataSource; //绘制的图层
  #handle: ScreenSpaceEventHandler | undefined;
  /**
   *
   * @param _viewer Viewer
   */
  constructor(_viewer: Viewer) {
    if (!_viewer) {
      throw new Error('必要参数:_viewer: Viewer');
    }
    this.#viewer = _viewer;
    this.#drawLayer = new CustomDataSource('customDrawLayer');
    this.#viewer.dataSources.add(this.#drawLayer);
  }
  clearDraw() {
    this.#drawLayer.entities.removeAll();
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
  #draw(type: DrawType): Promise<Cartesian3[]> {
    const baseTerrain = this.#viewer.scene.globe.depthTestAgainstTerrain;
    this.#viewer.scene.globe.depthTestAgainstTerrain = true;
    this.#handle = new ScreenSpaceEventHandler(this.#viewer.scene.canvas);
    return new Promise((reslove, reject) => {
      let activeShapePoints: Array<Cartesian3> = [];
      let outputPoints: Array<Cartesian3> = [];
      let activeShape: Entity | null;
      let floatingPoint: Entity | null;
      let lastEntity: Entity | null;
      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const earthPosition = this.#viewer.scene.pickPosition(event.position);
        if (defined(earthPosition)) {
          if (activeShapePoints.length === 0) {
            floatingPoint = this.#createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            switch (type) {
              case DrawType.polygon:
                {
                  const dynamicPositions = new CallbackProperty(() => {
                    return new PolygonHierarchy(activeShapePoints);
                  }, false);
                  activeShape = this.#drawLayer.entities.add({
                    //绘制动态图
                    polygon: {
                      hierarchy: dynamicPositions,
                      material: Color.ORANGE.withAlpha(0.5),
                      outline: true,
                      outlineColor: Color.BLACK
                    }
                  });
                }
                break;
              case DrawType.polyline: {
                const dynamicPositions = new CallbackProperty(() => {
                  return activeShapePoints;
                }, false);
                activeShape = this.#drawLayer.entities.add({
                  //绘制动态图
                  polyline: {
                    positions: dynamicPositions,
                    width: 10,
                    material: new PolylineGlowMaterialProperty({
                      glowPower: 0.1,
                      color: Color.YELLOW
                    }),
                    clampToGround: true
                  }
                });
              }
            }
          }
          outputPoints.push(cloneDeep(earthPosition));
          activeShapePoints.push(cloneDeep(earthPosition));
          lastEntity = this.#createPoint(earthPosition); //添加点
        }
        return false;
      }, ScreenSpaceEventType.LEFT_CLICK);

      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.MotionEvent) => {
        if (defined(floatingPoint)) {
          const newPosition = this.#viewer.scene.pickPosition(event.endPosition);
          if (defined(newPosition)) {
            if (floatingPoint?.position) {
              floatingPoint.position = newPosition as any;
            }
            activeShapePoints[activeShapePoints.length - 1] = newPosition;
          }
        }
      }, ScreenSpaceEventType.MOUSE_MOVE);

      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const earthPosition = this.#viewer.scene.pickPosition(event.position);
        activeShapePoints.pop(); //去除最后一个动态点
        activeShapePoints.pop();
        activeShapePoints.pop();
        outputPoints.pop();
        outputPoints.pop();
        activeShapePoints.push(cloneDeep(earthPosition));
        outputPoints.push(cloneDeep(earthPosition));
        if (lastEntity) {
          this.#viewer.entities.remove(lastEntity);
        }
        this.#viewer.trackedEntity = undefined;
        terminateShape();

        return false;
      }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const earthPosition = this.#viewer.scene.pickPosition(event.position);
        activeShapePoints.pop();
        activeShapePoints.push(cloneDeep(earthPosition));
        outputPoints.push(cloneDeep(earthPosition));
        this.#viewer.trackedEntity = undefined;
        terminateShape();
        return false;
      }, ScreenSpaceEventType.RIGHT_CLICK);

      //绘制最终几何
      const terminateShape = () => {
        this.#viewer.entities.remove(floatingPoint as Entity); //去除动态点图形（当前鼠标点）
        this.#viewer.entities.remove(activeShape as Entity); //去除动态图形
        switch (type) {
          case DrawType.polygon: {
            this.#drawLayer.entities.add({
              //绘制动态图
              polygon: {
                hierarchy: outputPoints,
                material: Color.ORANGE.withAlpha(0.5),
                outline: true,
                outlineColor: Color.BLACK
              }
            });
            break;
          }
          case DrawType.polyline: {
            this.#drawLayer.entities.add({
              polyline: {
                positions: activeShapePoints,
                width: 10,
                material: new PolylineGlowMaterialProperty({
                  glowPower: 0.1,
                  color: Color.YELLOW
                }),
                clampToGround: true
              }
            });
            break;
          }
        }

        floatingPoint = null;
        activeShape = null;
        // this.#handle?.destroy();
        reslove(outputPoints);
        this.#viewer.scene.globe.depthTestAgainstTerrain = baseTerrain;
        activeShapePoints = [];
        outputPoints = [];
        this.#handle?.destroy();
      };
    });
  }
  drawPolyline(): Promise<Cartesian3[]> {
    return this.#draw(DrawType.polyline);
  }
  drawPolygon(): Promise<Cartesian3[]> {
    return this.#draw(DrawType.polygon);
  }
  drawPoint(): Promise<Cartesian3> {
    return new Promise((reslove, reject) => {
      const baseTerrain = this.#viewer.scene.globe.depthTestAgainstTerrain;
      this.#viewer.scene.globe.depthTestAgainstTerrain  = true;
      this.#handle = new ScreenSpaceEventHandler(this.#viewer.scene.canvas);
      this.#handle?.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
        const earthPosition = this.#viewer.scene.pickPosition(event.position);
        if (defined(earthPosition)) {
          const point = this.#createPoint(earthPosition);
          this.#viewer.scene.globe.depthTestAgainstTerrain = baseTerrain;
          reslove(earthPosition);
          this.#handle?.destroy();
        }
      }, ScreenSpaceEventType.LEFT_CLICK);
    });
  }
}
