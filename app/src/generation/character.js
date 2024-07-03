import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterControls } from '../controls/characterControls.js'; // Adjust path according to project structure
import Ammo from 'ammo.js';
import { FirstPersonCamera } from "../camera_control/FirstPersonCamera.js";
import { ThirdPersonCamera } from "../camera_control/ThirdPersonCamera.js";

export class Character {
    constructor(scene, camera, orbitControls, physicsWorld, scale = 5, position = { x: 0, y: -2.5, z: -70 }, rotationY = Math.PI) {
        this.scene = scene;
        this.camera = camera;
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.physicsWorld = physicsWorld;
        this.orbitControls = orbitControls;
        this.initInput(); // Initialize input events

        document.addEventListener("keypress", (e) => this.onKeyPressed(e), false);

        this.characterControlsPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load('../../asset/model/Character/Lumberjack.glb', (gltf) => {
                this.model = gltf.scene;
                this.model.traverse((object) => {
                    if (object.isMesh) object.castShadow = true;
                });
                this.model.scale.set(scale, scale, scale);
                this.model.position.set(position.x, position.y, position.z);
                this.model.rotation.y = rotationY;

                this.scene.add(this.model);

                const gltfAnimations = gltf.animations;
                const mixer = new THREE.AnimationMixer(this.model);
                const animationsMap = new Map();
                gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
                    animationsMap.set(a.name, mixer.clipAction(a));
                });

                if (!this.orbitControls) {
                    console.error('OrbitControls is undefined');
                    reject('OrbitControls is undefined');
                    return;
                }

                this.characterControls = new CharacterControls(this.model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
                resolve(this.characterControls);
            }, undefined, (error) => {
                console.error('An error occurred loading the character model:', error);
                reject(error);
            });
        });

        this.cameraControl = new ThirdPersonCamera(this.camera, this.position);
        this.cameraControl.movementSpeed = 10;
        this.cameraControl.rotationSpeed = 1;

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y, this.position.z));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const colShape = new Ammo.btBoxShape(new Ammo.btVector3(5, 0.5, 5));
        colShape.setMargin(0.05);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(1, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
        rbInfo.set_m_linearSleepingThreshold(0); // Set sleep threshold to appropriate values
        rbInfo.set_m_angularSleepingThreshold(0); // Set sleep threshold to appropriate values
        this.body = new Ammo.btRigidBody(rbInfo);

        this.body.setDamping(0.0, 0.0); // Set linear and angular damping

        // Set the character as a kinematic object to prevent falling
        this.body.setActivationState(Ammo.btCollisionObject.DISABLE_DEACTIVATION);
        this.body.setCollisionFlags(this.body.getCollisionFlags() | Ammo.btCollisionObject.CF_KINEMATIC_OBJECT);

        physicsWorld.addRigidBody(this.body);

        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
        };

        this.velocity = new Ammo.btVector3(0, 0, 0);
        this.direction = new THREE.Vector3();
    }

    onKeyPressed(e) {
        switch (e.key.toUpperCase()) {
            case 'T':
                this.cameraControl = new ThirdPersonCamera(this.camera, this.position);
                this.cameraControl.movementSpeed = 10;
                this.cameraControl.rotationSpeed = 1;
                break;

            case 'P':
                this.cameraControl = new FirstPersonCamera(this.camera, this.position);
                this.cameraControl.movementSpeed = 10;
                this.cameraControl.rotationSpeed = 1;
                console.log('Switched to First Person Camera');
                break;

            default:
                break;
        }
    }

    initInput() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyS':
                    this.input.forward = true;
                    break;
                case 'ArrowDown':
                case 'KeyW':
                    this.input.backward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyD':
                    this.input.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyA':
                    this.input.right = true;
                    break;
                case 'Space':
                    this.input.jump = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyS':
                    this.input.forward = false;
                    break;
                case 'ArrowDown':
                case 'KeyW':
                    this.input.backward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyD':
                    this.input.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyA':
                    this.input.right = false;
                    break;
                case 'Space':
                    this.input.jump = false;
                    break;
            }
        });
    }

    update(dt) {
        this.characterControlsPromise.then(() => {
            this.cameraControl.update(dt);
            if (this.model != null) {
                // Simpan posisi saat ini karakter sebelum diperbarui
                const currentPosition = this.model.position.clone();

                // Update posisi dan rotasi karakter sesuai dengan kamera
                this.model.position.copy(this.cameraControl.position);
                this.model.rotation.set(0, this.cameraControl.THETA + Math.PI, 0);

                // Hitung perbedaan vektor antara posisi baru dan posisi saat ini
                this.direction.copy(this.model.position).sub(currentPosition).normalize();

                // Set kecepatan berdasarkan arah yang dihitung
                const speed = 0.1; // Atur kecepatan sesuai kebutuhan
                this.velocity.copy(this.direction).multiplyScalar(speed);

                // Aktifkan tubuh agar tidak tidur dan atur kecepatan linier
                this.body.activate();
                this.body.setLinearVelocity(this.velocity);

                // Sinkronisasi posisi dan rotasi model dengan tubuh fisik
                const ms = this.body.getMotionState();
                if (ms) {
                    const transform = new Ammo.btTransform();
                    ms.getWorldTransform(transform);
                    const origin = transform.getOrigin();
                    const rotation = transform.getRotation();
                    this.model.position.set(origin.x(), origin.y(), origin.z());
                    this.model.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

                    // Arah karakter menghadap arah gerakan horizontal
                    if (this.direction.lengthSq() > 0) {
                        const angle = Math.atan2(this.direction.x, this.direction.z);
                        this.model.rotation.y = angle;
                    }
                }
            }
        }).catch((error) => {
            console.error('Error updating character controls:', error);
        });
    }



}
