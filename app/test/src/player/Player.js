import * as THREE from 'three';
import { FirstPersonCamera } from '../camera_control/FirstPersonCamera';
import { ThirdPersonCamera } from '../camera_control/ThirdPersonCamera';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export class Player{
    constructor(scene, camera){
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        this.position = new THREE.Vector3(0,0,0);
        this.animations = {};
        
        document.addEventListener("keypress", (e) => this.onKeyPressed(e), false);

        this.loadModel();
        
        this.cameraControl = new ThirdPersonCamera( this.camera, this.position );
        this.cameraControl.movementSpeed = 10;
        this.cameraControl.rotationSpeed = 1;
    }

    onKeyPressed(e){
        switch (e.key.toUpperCase()) {
            case 'T':
                this.cameraControl = new ThirdPersonCamera( this.camera, this.position );
                this.cameraControl.movementSpeed = 10;
                this.cameraControl.rotationSpeed = 1;
                break;
                
                case 'F':
                this.cameraControl = new FirstPersonCamera( this.camera, this.position );
                this.cameraControl.movementSpeed = 10;
                this.cameraControl.rotationSpeed = 1;
                break;
        
            default:
                break;
        }
    }

    loadModel(){
        var loader = new FBXLoader();
        loader.setPath('./asset/');
        loader.load('Dwarf Idle.fbx', (fbx) => {
            fbx.scale.setScalar(0.01);
            fbx.traverse(c => {
              c.castShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.mesh.rotation.y += Math.PI/2;
            
            this.mixer = new THREE.AnimationMixer(this.mesh);
            
            var onLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this.mixer.clipAction(clip);
          
                this.animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };
            
            const loader = new FBXLoader();
            loader.setPath('./asset/');
            loader.load('Dwarf Idle.fbx', (fbx) => { onLoad('idle', fbx) });
            loader.load('Sword And Shield Run.fbx', (fbx) => { onLoad('run', fbx) });
        });
    }

    update(dt){
        this.cameraControl.update( dt );
        if(this.mesh!=null){
            this.mesh.position.copy(this.cameraControl.position);
            this.mesh.rotation.set(0, this.cameraControl.THETA + Math.PI,0);
        }
    }
}
