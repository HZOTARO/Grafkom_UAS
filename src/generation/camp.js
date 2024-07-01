import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


export class Camp {
    constructor(scene, scale, pos, physicsWorld) {
        this.scene = scene;
        this.scale = scale;
        this.pos = pos;
        this.physicsWorld = physicsWorld;
        this.loadModel();
    }

    loadModel() {
        const mtlLoader = new MTLLoader();
        mtlLoader.setPath('./models/Camp/');
        mtlLoader.load('materials.mtl', (materials) => {
            materials.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath('./models/Camp/');
            objLoader.load('model.obj', (object) => {
                object.scale.set(this.scale, this.scale, this.scale);
                object.position.set(this.pos.x, this.pos.y, this.pos.z);

                this.mesh = object;
                this.scene.add(this.mesh);

                console.log('Camp mesh added to scene:', this.mesh);

                // Add physics
                // this.addPhysics();
            }, undefined, (error) => {
                console.error('An error occurred loading the OBJ:', error);
            });
        }, undefined, (error) => {
            console.error('An error occurred loading the MTL:', error);
        });
    }

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