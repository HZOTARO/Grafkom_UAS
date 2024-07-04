import * as THREE from "three";
import { CameraBase } from "./CameraBase";

export class ThirdPersonCamera extends CameraBase{
    constructor(camera, pos, scene){
        super(camera, pos);
        this.scene = scene;

        this.offset = new THREE.Vector3(0,10,0);

        this.distance = 25;
        this.ALPHA = -Math.PI * 0.75;

        this.zoomSpeed = 10;
        this.minZoom = 10;
        this.maxZoom = 100;

        this.maxALPHA = -Math.PI * 0.3;
        this.minALPHA = -Math.PI * 0.8;

        // this.raycaster = new THREE.Raycaster();
        // this.pointer = new THREE.Vector2(0,0);
        // this.raycaster.setFromCamera( this.pointer, this.camera );
    }

    updateRotate(dt){
        // const intersects = this.raycaster.intersectObjects( this.scene.children );
        // console.log(intersects)
        
        // this.distance = Math.min(...intersects);

        const targetPosition = new THREE.Vector3().copy(this.position);
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