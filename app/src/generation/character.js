import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FirstPersonCamera } from "../camera_control/FirstPersonCamera.js";
import { ThirdPersonCamera } from "../camera_control/ThirdPersonCamera.js";
import { OBB } from 'three/examples/jsm/Addons.js';

export class Character {
    constructor(scene, camera, world, scale = 5, position = { x: 12, y: -2.5, z: 70 }) {
        this.init_idle = false;
        this.world = world;
        this.scene = scene;
        this.camera = camera;
        this.state = 'Idle';
        this.thirdPerson = true;
        this.dir = new THREE.Vector3(0,0,-1);
        this.animations = {};
        this.mixer = null;
        this.collide = true;
        
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.prevPos =  new THREE.Vector3(0,0,0);

        this.scale = new THREE.Vector3(5,8,5);

        this.loadModel();

        document.addEventListener("keypress", (e) => this.onKeyPressed(e), false);


        this.cameraControl = new ThirdPersonCamera(this.camera, this.world, this.position, this.scene);


        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.position.set(this.position.x, this.position.y + 10, this.position.z);
        this.spotLight.angle = Math.PI / 6;
        this.spotLight.penumbra = 0.1;
        this.spotLight.decay = 2;
        this.spotLight.distance = 50;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.bias = -0.0001;
        this.spotLight.shadow.radius = 4;

        this.scene.add(this.spotLight);

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.scene.add(this.spotLightHelper);

        this.spotLightTarget = new THREE.Object3D();
        this.spotLightTarget.position.set(this.position.x, this.position.y, this.position.z - 10);
        this.scene.add(this.spotLightTarget);
        this.spotLight.target = this.spotLightTarget;
    }

    loadModel(){
        const loader = new GLTFLoader();
        loader.load('./asset/model/Character/Lumberjack.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(5,5,5);
            this.model.position.set(0,0,0);
            // this.model.rotation.y = rotationY;
            this.scene.add(this.model);
            const gltfAnimations = gltf.animations;
            this.mixer = new THREE.AnimationMixer(this.model);
            this.animations = new Map();
            gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
                this.animations.set(a.name, this.mixer.clipAction(a));
            });
        });
        this.BB = new THREE.Box3();
        this.BB.setFromCenterAndSize( new THREE.Vector3(0,2.5,0), this.scale );
        // this.BB.setFromObject( this.model );
        this.helper = new THREE.Box3Helper( this.BB, 0xffff00 );
        // this.scene.add( this.helper );

        this.obb = new OBB();
        this.obb = this.obb.fromBox3(this.BB);
        // obb.rotation.rotate();
    }

    checkCollision(){
        // console.log(this.world.BB)
        this.collide = false;
        this.world.BB.forEach(box => {
            if(this.obb.intersectsOBB(box)){
                this.collide = true;
                this.position.copy(this.prevPos);
                return;
            }
        });
    }

    onKeyPressed(e){
        switch (e.key.toUpperCase()) {
            case 'T':
                this.cameraControl = new ThirdPersonCamera( this.camera, this.world, this.position, this.scene );
                this.thirdPerson = true;
                break;
                
            case 'P':
                this.cameraControl = new FirstPersonCamera( this.camera, this.world, new THREE.Vector3(0,30,0).add(this.position) );
                this.thirdPerson = false;
                this.mixer.stopAllAction();
                this.animations.get('Poses').play();
                this.state = 'Idle';
                break;

            // case 'C':
            //     this.cinematic = true;
            //     this.Cinematic = new Cinematic(this.scene, this.world, this);
            //     break;
        
            default:
                break;
        }
    }


    
    update(dt) {

        this.prevPos.copy(this.position);
        this.cameraControl.update(dt);

            if(this.model!=null){
                this.BB.setFromCenterAndSize(new THREE.Vector3(0,4,0).add(this.position), this.scale);
                this.obb.fromBox3(this.BB)
                this.helper.updateMatrixWorld(true);
                this.checkCollision();
                if(this.collide){
                    this.cameraControl.position.copy(this.prevPos);
                }

                if(this.thirdPerson){
                    if(!this.init_idle) {
                        this.animations.get('Poses').play();
                        this.init_idle = true;
                    }
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

                this.cameraControl.updateCameraPos();
            }

            if(this.model) {
                this.spotLight.position.copy(this.model.position).add(new THREE.Vector3(0, 10, 0));
                this.spotLightTarget.position.copy(this.model.position).add(this.dir);
                this.spotLight.target.updateMatrixWorld();
                this.spotLightHelper.update();
            }

        }
    }
