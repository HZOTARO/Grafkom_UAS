import { Vector3 } from "three";
import { CameraBase } from "./CameraBase";

export class ThirdPersonCamera extends CameraBase{
    constructor(camera, pos){
        super(camera, pos);

        this.offset = new Vector3(0,10,0);

        this.distance = 25;
        this.ALPHA = -Math.PI * 0.75;

        this.zoomSpeed = 10;
        this.minZoom = 10;
        this.maxZoom = 100;

        this.maxALPHA = -Math.PI * 0.3;
        this.minALPHA = -Math.PI * 0.8;
    }

    updateRotate(dt){
        const targetPosition = new Vector3().copy(this.position);
        const position = this.camera.position;

        targetPosition.add(this.offset);
        position.setFromSphericalCoords( -this.distance, this.ALPHA, this.THETA ).add( targetPosition ).add(this.offset);
        
        this.camera.lookAt( targetPosition );
    }

    updatePos(dt){
        super.updatePos(dt);
        
        this.deltaMove.y = 0;
        this.deltaMove.normalize();
        this.deltaMove.multiplyScalar(dt * this.movementSpeed);
        this.position.add(this.deltaMove);

        this.camera.position.set(...this.position);
    }
}