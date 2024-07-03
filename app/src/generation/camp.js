import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from "three/addons";


export class Camp {
    constructor(scene,  scale = 20, position  = {x: 0, y: 5.5, z: 0}) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;

        const loader = new GLTFLoader();
        loader.load('../../asset/model/Camp/Camp.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(this.scale, this.scale, this.scale);
            this.model.position.set(this.position.x, this.position.y, this.position.z);

            this.scene.add(this.model);

            // const gltfAnimations = gltf.animations;
            // const mixer = new THREE.AnimationMixer(this.model);
            // const animationsMap = new Map();
            // gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
            //     animationsMap.set(a.name, mixer.clipAction(a));
            // });

            // if (!this.orbitControls) {
            //     console.error('OrbitControls is undefined');
            //     reject('OrbitControls is undefined');
            //     return;
            // }

            // this.characterControls = new CharacterControls(this.model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });
    }

    // loadModel() {
    //     const mtlLoader = new MTLLoader();
    //     mtlLoader.setPath('../../asset/model/Camp/');
    //     mtlLoader.load('materials.mtl', (materials) => {
    //         materials.preload();
    //
    //         const objLoader = new OBJLoader();
    //         objLoader.setMaterials(materials);
    //         objLoader.setPath('../../asset/model/Camp/');
    //         objLoader.load('model.obj', (object) => {
    //             object.scale.set(this.scale, this.scale, this.scale);
    //             object.position.set(this.pos.x, this.pos.y, this.pos.z);
    //
    //             this.mesh = object;
    //             this.scene.add(this.mesh);
    //
    //             console.log('Camp mesh added to scene:', this.mesh);
    //
    //             // Add physics
    //             // this.addPhysics();
    //         }, undefined, (error) => {
    //             console.error('An error occurred loading the OBJ:', error);
    //         });
    //     }, undefined, (error) => {
    //         console.error('An error occurred loading the MTL:', error);
    //     });
    // }

    // addPhysics() {
    //     if (!this.mesh) {
    //         console.error('Mesh not found, cannot add physics.');
    //         return;
    //     }

    //     const box = new THREE.Box3().setFromObject(this.mesh);
    //     const boxSize = new THREE.Vector3();
    //     box.getSize(boxSize);

    //     const halfExtents = new Ammo.btVector3(boxSize.x * 0.5, boxSize.y * 0.5, boxSize.z * 0.5);
    //     const transform = new Ammo.btTransform();
    //     transform.setIdentity();
    //     transform.setOrigin(new Ammo.btVector3(this.pos.x, this.pos.y + (boxSize.y * 0.5), this.pos.z));

    //     const mass = 0; // Static object
    //     const localInertia = new Ammo.btVector3(0, 0, 0);
    //     const shape = new Ammo.btBoxShape(halfExtents);
    //     shape.calculateLocalInertia(mass, localInertia);

    //     const motionState = new Ammo.btDefaultMotionState(transform);
    //     const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
    //     const body = new Ammo.btRigidBody(rbInfo);

    //     this.physicsWorld.addRigidBody(body);
    //     this.physicsBody = body;

    //     console.log('Camp physics body added to physics world:', this.physicsBody);
    // }
}