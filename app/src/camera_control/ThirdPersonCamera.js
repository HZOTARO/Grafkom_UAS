import * as THREE from "three";
import { CameraBase } from "./CameraBase";

export class ThirdPersonCamera extends CameraBase{
    constructor(camera, world, pos, scene){
        super(camera, world, pos);
        this.scene = scene;

        this.offset = new THREE.Vector3(0,10,0);

        this.distance = 30;
        this.ALPHA = -Math.PI * 0.75;

        this.zoomSpeed = 2;
        // this.minZoom = 15;
        // this.maxZoom = 100;
        this.minZoom = 10;
        this.maxZoom = 60;

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

    updateCameraPos(){
        super.updateCameraPos();
        if(this.collide){
            this.temp_distance = Math.min(Math.max(this.minZoom, (this.distance - this.zoomSpeed * 0.4)), this.maxZoom);
            this.camera.setFocalLength( Math.min(Math.max(this.minZoom, (this.camera.getFocalLength() + this.zoomSpeed * 1)), this.maxZoom));
        }
    }
}