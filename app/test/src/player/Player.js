import * as THREE from 'three';
import { FirstPersonCamera } from '../camera_control/FirstPersonCamera';
import { ThirdPersonCamera } from '../camera_control/ThirdPersonCamera';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player{
    constructor(scene, camera, world){
        this.world = world;
        this.state = 'Idle';
        this.thirdPerson = true;
        this.scene = scene;
        this.camera = camera;
        this.model = null;
        this.position = new THREE.Vector3(0,0,0);
        this.prevPos =  new THREE.Vector3(0,0,0);
        this.dir = new THREE.Vector3(0,0,-1);
        this.animations = {};
        this.mixer = null;
        this.collide = true;
        
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
                if (object.isMesh) {
                    object.castShadow = true;
                    object.material.wireframe = true;
                }
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

        this.BB = new THREE.Box3();
        this.BB.setFromCenterAndSize( new THREE.Vector3(0,0.75,0), new THREE.Vector3(1,2,1) );
        // this.BB.setFromObject( this.model );
        this.helper = new THREE.Box3Helper( this.BB, 0xffff00 );
        this.scene.add( this.helper );
        // console.log(this.BB)

        // this.world.BB.push(this.BB);
    }

    checkCollision(){
        // console.log(this.world.BB)
        this.collide = false;
        this.world.BB.forEach(box => {
            if(this.BB.intersectsBox(box)){
                this.collide = true;
                this.position.copy
                return;
            }
        });
    }

    update(dt){
        this.prevPos.copy(this.position);
        this.cameraControl.update( dt );

        
        if(this.model!=null){
            // console.log(this.BB);
            // console.log(this.helper);
            // this.BB.position = this.model.position;
            this.BB.setFromCenterAndSize(this.position, new THREE.Vector3(1,2,1));
            this.helper.updateMatrixWorld(true);
            this.checkCollision();
            if(this.collide){
                this.cameraControl.position.copy(this.prevPos);
            }

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
