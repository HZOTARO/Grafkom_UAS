import * as THREE from 'three';
import { FirstPersonCamera } from '../camera_control/FirstPersonCamera';
import { ThirdPersonCamera } from '../camera_control/ThirdPersonCamera';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player{
    constructor(scene, camera){
        this.state = 'Idle';
        this.thirdPerson = true;
        this.scene = scene;
        this.camera = camera;
        this.model = null;
        this.position = new THREE.Vector3(0,0,0);
        this.dir = new THREE.Vector3(0,0,-1);
        this.animations = {};
        this.mixer = null;
        
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
                this.thirdPerson = true;
                break;
                
                case 'F':
                this.cameraControl = new FirstPersonCamera( this.camera, new THREE.Vector3(0,3,0).add(this.position) );
                this.cameraControl.movementSpeed = 10;
                this.cameraControl.rotationSpeed = 1;
                this.thirdPerson = false;
                this.mixer.stopAllAction();
                this.animations.get('Poses').play();
                this.state = 'Idle';
                break;
        
            default:
                break;
        }
    }

    loadModel(){
        const loader = new GLTFLoader();
        loader.load('./asset/Lumberjack.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(1,1,1);
            this.model.position.set(0,0,0);
            // this.model.rotation.y = rotationY;
            this.scene.add(this.model);
            const gltfAnimations = gltf.animations;
            this.mixer = new THREE.AnimationMixer(this.model);
            this.animations = new Map();
            gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
                this.animations.set(a.name, this.mixer.clipAction(a));
            });
        })
    }

    update(dt){
        this.cameraControl.update( dt );

        if(this.model!=null){
            if(this.thirdPerson){
                if(this.state != 'Idle' && this.cameraControl.idle){
                    this.animations.get('Walk').fadeOut(1);
                    this.animations.get('Poses').fadeIn(1).play();
                    this.state = 'Idle';
                }else if(this.state != 'Walk' && !this.cameraControl.idle){
                    this.mixer.stopAllAction();
                    this.animations.get('Walk').fadeIn(1).play();
                    this.state = 'Walk';
                }

                this.model.position.copy(this.cameraControl.position);
                if(!this.cameraControl.idle){
                    this.dir.copy(this.model.position).add(this.cameraControl.deltaMove).multiplyScalar(1);
                }
                this.model.lookAt(this.dir);
            }

            if(this.mixer){
                this.mixer.update(dt);
            }
            // this.mesh.rotation.set(0, this.cameraControl.THETA - Math.PI,0);
            
            // const dir = new THREE.Vector3()
        }
    }
}
