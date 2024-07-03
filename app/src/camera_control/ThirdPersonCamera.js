import { CameraBase } from "./CameraBase";

export class ThirdPersonCamera extends CameraBase{
    constructor(camera, pos){
        super(camera, pos);

        this.distance = 10;
        this.ALPHA = -Math.PI * 0.75;

        this.zoomSpeed = 1;
        this.minZoom = 1;
        this.maxZoom = 100;

        this.maxALPHA = -Math.PI * 0.5;
        this.minALPHA = -Math.PI * 1;
    }

    updateRotate(dt){
        const targetPosition = this.position;
        const position = this.camera.position;

        position.setFromSphericalCoords( -this.distance, this.ALPHA, this.THETA ).add( targetPosition );
        
        this.camera.lookAt( targetPosition );
    }

    updatePos(dt){
        super.updatePos(dt);
        this.camera.position.set(...this.position);
    }
}