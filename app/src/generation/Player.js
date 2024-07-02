// src/Player.js

import * as THREE from 'three';
import Ammo from 'ammo.js';

export class Player {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        // Three.js Mesh
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = 1;
        this.mesh.castShadow = true;  // Enable casting shadows
        this.mesh.receiveShadow = true;  // Enable receiving shadows
        scene.add(this.mesh);

        console.log(scene);

        // Ammo.js Physics
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(0, 1, 0));
        const motionState = new Ammo.btDefaultMotionState(transform);

        const colShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 1, 0.5));
        const localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(1, localInertia);

        const rbInfo = new Ammo.btRigidBodyConstructionInfo(1, motionState, colShape, localInertia);
        this.body = new Ammo.btRigidBody(rbInfo);

        physicsWorld.addRigidBody(this.body);

        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
        };

        this.velocity = new Ammo.btVector3(0, 0, 0);

        this.initInput();
    }

    initInput() {
        document.addEventListener('keydown', (event) => {
            console.log("bruh");
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.input.forward = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.backward = true;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
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
                case 'KeyW':
                    this.input.forward = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    this.input.backward = false;
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    this.input.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    this.input.right = false;
                    break;
                case 'Space':
                    this.input.jump = false;
                    break;
            }
        });
    }

    update(delta) {
        // Player movement
        const force = 10;
        if (this.input.forward) {
            this.velocity.setZ(-force);
        } else if (this.input.backward) {
            this.velocity.setZ(force);
        } else {
            this.velocity.setZ(0);
        }

        if (this.input.left) {
            this.velocity.setX(-force);
        } else if (this.input.right) {
            this.velocity.setX(force);
        } else {
            this.velocity.setX(0);
        }

        if (this.input.jump) {
            this.velocity.setY(force);
        }

        this.body.setLinearVelocity(this.velocity);

        // Sync Three.js object with Ammo.js physics
        const ms = this.body.getMotionState();
        if (ms) {
            const transform = new Ammo.btTransform();
            ms.getWorldTransform(transform);
            const origin = transform.getOrigin();
            const rotation = transform.getRotation();
            this.mesh.position.set(origin.x(), origin.y(), origin.z());
            this.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }
    }
}
