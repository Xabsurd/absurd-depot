// import type { Scene } from 'cesium';
declare module 'cesium' {
    interface Scene {
        pickFromRay(ray:Ray, objectsToExclude?:Object[], width?:number);
        drillPickFromRay(ray:Ray,limit?:number, objectsToExclude?:Object[], width?:number);
    }
    export {
        EllipsoidalOccluder,
    };
}