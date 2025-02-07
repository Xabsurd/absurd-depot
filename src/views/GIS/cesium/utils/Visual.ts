import type { Viewer } from 'cesium';

export namespace Visual {
  export class VisualVolumeAnalysis {
    viewer: Viewer;
    constructor(viewer: Viewer) {
      this.viewer = viewer; 
    }
  }
}
