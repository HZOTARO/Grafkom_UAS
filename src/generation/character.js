import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Character {
    constructor(physicsWorld) {
        this.physicsWorld = physicsWorld;
        this.model = null;
        this.mixer = null;
        this.animationsMap = new Map(); // Initialize as a Map
        this.characterControls = null;
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load('models/Soldier.glb', (gltf) => {
            const model = gltf.scene;
            model.traverse(function (object) {
                if (object.isMesh) object.castShadow = true;
            });
            model.scale.set(5, 5, 5);
            model.position.copy(this.position); // Adjust according to the provided position
            scene.add(model);

            this.model = model; // Save reference to the model
            
            // Extract animations and mixer
            const animations = gltf.animations;
            if (animations && animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model);
                animations.filter(a => a.name !== 'TPose').forEach((a) => {
                    this.animationsMap.set(a.name, this.mixer.clipAction(a));
                });
            }

        }, undefined, (error) => {
            console.error('An error occurred loading the GLTF:', error);
        });
    }

    addPhysics() {
        if (!this.model) {
            console.error('Model not found, cannot add physics.');
            return;
        }

        const box = new THREE.Box3().setFromObject(this.model);
        const boxSize = new THREE.Vector3();
        box.getSize(boxSize);

        const halfExtents = new Ammo.btVector3(boxSize.x * 0.5, boxSize.y * 0.5, boxSize.z * 0.5);
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(this.position.x, this.position.y + (boxSize.y * 0.5), this.position.z));

        const mass = 10; // Example: character with mass
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const shape = new Ammo.btBoxShape(halfExtents);
        shape.calculateLocalInertia(mass, localInertia);

        const motionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);

        this.physicsWorld.addRigidBody(body);
        this.physicsBody = body;

        console.log('Character physics body added to physics world:', this.physicsBody);
    }

    update(deltaTime) {
        if (!this.model || !this.physicsBody) return;

        const ms = this.physicsBody.getMotionState();
        if (ms) {
            const transform = new Ammo.btTransform();
            ms.getWorldTransform(transform);
            const position = transform.getOrigin();
            const quaternion = transform.getRotation();

            this.model.position.set(position.x(), position.y(), position.z());
            this.model.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());
        }
    }
}
