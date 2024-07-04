import { Euler, Vector3 } from "three";
import { CameraBase } from "./CameraBase";

export class FirstPersonCamera extends CameraBase{
    constructor(camera, pos){
        super(camera, pos);

        this.distance = 0;
        this.ALPHA = -Math.PI/2;

        this.zoomSpeed = -1;
        this.minZoom = 0;
        this.maxZoom = 10;

        this.maxALPHA = -Math.PI * 0.25;
        this.minALPHA = -Math.PI * 0.75;
        this.roll = 0;
    }

    updateRotate(dt){
        const targetPosition = new Vector3();
        const position = this.camera.position;

        targetPosition.setFromSphericalCoords( 1, this.ALPHA, this.THETA ).add( position );
        
        this.camera.lookAt( targetPosition );
        // this.roll+=0.1;
        // this.camera.rotateZ(this.roll);
    }

    updatePos(dt){
        super.updatePos(dt);

        // this.deltaMove.y = 0;
        this.deltaMove.normalize();
        this.deltaMove.multiplyScalar(dt * this.movementSpeed);
        this.position.add(this.deltaMove);

        const posAftZoom = new Vector3().add(this.position);
        const dir = new Vector3().setFromSphericalCoords( 1, this.ALPHA, this.THETA );
        this.camera.position.set(...(posAftZoom.add(dir.multiplyScalar(this.distance))));
    }
}