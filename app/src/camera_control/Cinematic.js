import { Character } from "../generation/character";
import * as THREE from "three";
import { ThirdPersonCamera } from "./ThirdPersonCamera";

export class Cinematic {
    constructor(scene, world, player){
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.time = 0;
        this.timeLimit = 10;

        this.position = new THREE.Vector3(12, -2.5, 70);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 5);
        this.cameraControl = new ThirdPersonCamera(this.camera, this.world, this.player.position, this.scene);

        this.player.position = this.position;
        this.player.camera = this.camera;
        this.player.cameraControl = this.cameraControl;
    }
    update(dt){
        this.time += dt;
        this.cameraControl.THETA += 1;
        console.log(this.camera, this.player.camera)

        if(this.time>=this.timeLimit){
            this.player.cinematic = false;
            this.player.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.player.camera.position.set(0, 5, 10);
            this.player.position = new THREE.Vector3(12, -2.5, 70);
            this.player.cameraControl = new ThirdPersonCamera(this.camera, this.world, this.player.position, this.scene);
        }
    }
}