import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterControls } from '../controls/characterControls.js'; // Adjust path according to project structure
import Ammo from 'ammo.js';
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
        // this.physicsWorld = physicsWorld;
        // this.orbitControls = orbitControls;
        // this.initInput(); // Initialize input events

        this.loadModel();

        document.addEventListener("keypress", (e) => this.onKeyPressed(e), false);

        // this.characterControlsPromise = new Promise((resolve, reject) => {
        //     const loader = new GLTFLoader();
        //     loader.load('../../asset/model/Character/Lumberjack.glb', (gltf) => {
        //         this.model = gltf.scene;
        //         this.model.traverse((object) => {
        //             if (object.isMesh) object.castShadow = true;
        //         });
        //         this.model.scale.set(scale, scale, scale);
        //         this.model.position.set(position.x, position.y, position.z);
        //         this.model.rotation.y = rotationY;

        //         this.scene.add(this.model);

        //         const gltfAnimations = gltf.animations;
        //         const mixer = new THREE.AnimationMixer(this.model);
        //         const animationsMap = new Map();
        //         gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
        //             animationsMap.set(a.name, mixer.clipAction(a));
        //         });

        //         // if (!this.orbitControls) {
        //         //     console.error('OrbitControls is undefined');
        //         //     reject('OrbitControls is undefined');
        //         //     return;
        //         // }

        //         // this.characterControls = new CharacterControls(this.model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
        //         resolve(this.characterControls);
        //     }, undefined, (error) => {
        //         console.error('An error occurred loading the character model:', error);
        //         reject(error);
        //     });
        // });

        this.cameraControl = new ThirdPersonCamera(this.camera, this.world, this.position, this.scene);
        this.cameraControl.movementSpeed = 25;
        this.cameraControl.rotationSpeed = 0.5;

        // const transform = new Ammo.btTransform();
        // transform.setIdentity();
        // transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.z));
        // const motionState = new Ammo.btDefaultMotionState(transform);

        // const colShape = new Ammo.btBoxShape(new Ammo.btVector3(5, 0.5, 5));
        // colShape.setMargin(0.05);
        // const localInertia = new Ammo.btVector3(0, 0, 0);
        // colShape.calculateLocalInertia(1, localInertia);

        // const rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
        // rbInfo.set_m_linearSleepingThreshold(0); // Set sleep threshold to appropriate values
        // rbInfo.set_m_angularSleepingThreshold(0); // Set sleep threshold to appropriate values
        // this.body = new Ammo.btRigidBody(rbInfo);

        // this.body.setDamping(0.0, 0.0); // Set linear and angular damping

        // Set the character as a kinematic object to prevent falling
        // this.body.setActivationState(Ammo.btCollisionObject.DISABLE_DEACTIVATION);
        // this.body.setCollisionFlags(this.body.getCollisionFlags() | Ammo.btCollisionObject.CF_KINEMATIC_OBJECT);

        // physicsWorld.addRigidBody(this.body);

        // this.input = {
        //     forward: false,
        //     backward: false,
        //     left: false,
        //     right: false,
        //     jump: false,
        // };

        // this.velocity = new Ammo.btVector3(0, 0, 0);
        // this.direction = new THREE.Vector3();
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
        })
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
                this.cameraControl.movementSpeed = 25;
                this.cameraControl.rotationSpeed = 0.5;
                this.thirdPerson = true;
                break;
                
            case 'P':
                this.cameraControl = new FirstPersonCamera( this.camera, this.world, new THREE.Vector3(0,30,0).add(this.position) );
                this.thirdPerson = false;
                this.mixer.stopAllAction();
                this.animations.get('Poses').play();
                this.state = 'Idle';
                break;
        
            default:
                break;
        }
    }

    initInput() {
        document.addEventListener('keydown', (event) => {
            // switch (event.code) {
            //     case 'ArrowUp':
            //     case 'KeyS':
            //         this.input.forward = true;
            //         break;
            //     case 'ArrowDown':
            //     case 'KeyW':
            //         this.input.backward = true;
            //         break;
            //     case 'ArrowLeft':
            //     case 'KeyD':
            //         this.input.left = true;
            //         break;
            //     case 'ArrowRight':
            //     case 'KeyA':
            //         this.input.right = true;
            //         break;
            //     case 'Space':
            //         this.input.jump = true;
            //         break;
            // }
        });

        document.addEventListener('keyup', (event) => {
            // switch (event.code) {
            //     case 'ArrowUp':
            //     case 'KeyS':
            //         this.input.forward = false;
            //         break;
            //     case 'ArrowDown':
            //     case 'KeyW':
            //         this.input.backward = false;
            //         break;
            //     case 'ArrowLeft':
            //     case 'KeyD':
            //         this.input.left = false;
            //         break;
            //     case 'ArrowRight':
            //     case 'KeyA':
            //         this.input.right = false;
            //         break;
            //     case 'Space':
            //         this.input.jump = false;
            //         break;
            // }
        });
    }

    addSpotLight() {
        this.light = new Light(this.scene);
        this.light.createSpotLight({ x: 0, y: 10, z: 0 }, this.model.position, 1000, 100, Math.PI / 8, 0.1, 2);
        
        this.light.spotLight.target = this.model;
        this.scene.add(this.light.spotLight.target);
        this.light.spotLight.position.set(0, 10, 0);
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

            // if (this.model != null) {
            //     // Simpan posisi saat ini karakter sebelum diperbarui
            //     const currentPosition = this.model.position.clone();

            //     // Update posisi dan rotasi karakter sesuai dengan kamera
            //     this.model.position.copy(this.cameraControl.position);
            //     this.model.rotation.set(0, this.cameraControl.THETA + Math.PI, 0);

            //     // Hitung perbedaan vektor antara posisi baru dan posisi saat ini
            //     // this.direction.copy(this.model.position).sub(currentPosition).normalize();

            //     // Set kecepatan berdasarkan arah yang dihitung
            //     // const speed = 1; // Atur kecepatan sesuai kebutuhan
            //     // this.velocity.copy(this.direction).multiplyScalar(speed);

            //     // Aktifkan tubuh agar tidak tidur dan atur kecepatan linier
            //     // this.body.activate();
            //     // this.body.setLinearVelocity(this.velocity);

            //     // Sinkronisasi posisi dan rotasi model dengan tubuh fisik
            //     const ms = this.body.getMotionState();
            //     if (ms) {
            //         const transform = new Ammo.btTransform();
            //         ms.getWorldTransform(transform);
            //         const origin = transform.getOrigin();
            //         const rotation = transform.getRotation();
            //         this.model.position.set(origin.x(), origin.y(), origin.z());
            //         this.model.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

            //         // Arah karakter menghadap arah gerakan horizontal
            //         if (this.direction.lengthSq() > 0) {
            //             const angle = Math.atan2(this.direction.x, this.direction.z);
            //             this.model.rotation.y = angle;
            //         }
            //     }
            // }
        // }).catch((error) => {
        //     console.error('Error updating character controls:', error);
        // });
            // this.light.spotLight.position.set(this.model.position.x, this.model.position.y + 20, this.model.position.z);
        }
    }
