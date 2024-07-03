import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterControls } from '../controls/characterControls.js'; // Sesuaikan path sesuai struktur proyek
import Ammo from 'ammo.js';
import { Light } from '../utils/lighting.js';

export class Character {
    constructor(scene, camera, orbitControls, physicsWorld, scale = 5, position = { x: 0, y: -2.5, z: -70 }, rotationY = Math.PI) {
        this.scene = scene;
        this.camera = camera;
        this.orbitControls = orbitControls;
        // this.light = new Light(scene);
        // this.light.createDirectionalLight({ x: 0, y: 10, z: 10 }, 0.5);

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

                // this.model.add(this.light.directionalLight);
                // this.model.add(this.light.directionalLight.target);

            
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

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const colShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
        colShape.setMargin(100);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(1, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
        rbInfo.set_m_linearSleepingThreshold(0); // Atur sleep threshold ke nilai yang sesuai
        rbInfo.set_m_angularSleepingThreshold(0); // Atur sleep threshold angular ke nilai yang sesuai
        this.body = new Ammo.btRigidBody(rbInfo);


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

        this.initInput();
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
            }
        });
    }

    update(delta) {
        if (this.model) {
            const force = 5 * 4;
            this.direction.set(0, 0, 0);

            if (this.input.forward) {
                this.direction.z -= force;
            }
            if (this.input.backward) {
                this.direction.z += force;
            }
            if (this.input.left) {
                this.direction.x -= force;
            }
            if (this.input.right) {
                this.direction.x += force;
            }

            this.direction.normalize().multiplyScalar(force);
            this.velocity.setValue(this.direction.x, this.velocity.y(), this.direction.z);

            this.body.activate(); // Aktifkan karakter agar tidak tidur
            this.body.setLinearVelocity(this.velocity);

            const ms = this.body.getMotionState();
            if (ms) {
                const transform = new Ammo.btTransform();
                ms.getWorldTransform(transform);
                const origin = transform.getOrigin();
                const rotation = transform.getRotation();
                this.model.position.set(origin.x(), origin.y(), origin.z());
                this.model.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());

                if (this.direction.lengthSq() > 0) {
                    const angle = Math.atan2(this.direction.x, this.direction.z);
                    this.model.rotation.y = angle;
                }
            }
        }
    }

}
