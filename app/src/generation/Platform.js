// src/Platform.js

import * as THREE from 'three';
import Ammo from 'ammo.js';

export class Platform {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        // Three.js Mesh
        const geometry = new THREE.BoxGeometry(20, 1, 20);
        const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, -0.5, 0);
        this.mesh.castShadow = true;  // Enable casting shadows
        this.mesh.receiveShadow = true;  // Enable receiving shadows
        scene.add(this.mesh);

        // Glass object
        const glassGeometry = new THREE.BoxGeometry(5, 0.5, 5);
        const glassMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.5,
            shininess: 100,
        });
        // this.glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        // this.glassMesh.position.set(0, 2, 0);
        // this.glassMesh.castShadow = true;
        // this.glassMesh.receiveShadow = true;
        // scene.add(this.glassMesh);

        // Ammo.js Physics
        // const transform = new Ammo.btTransform();
        // transform.setIdentity();
        // transform.setOrigin(new Ammo.btVector3(0, -0.5, 0));
        // const motionState = new Ammo.btDefaultMotionState(transform);

        // const colShape = new Ammo.btBoxShape(new Ammo.btVector3(10, 0.5, 10));
        // const localInertia = new Ammo.btVector3(0, 0, 0);
        // colShape.calculateLocalInertia(0, localInertia);

        // const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, colShape, localInertia);
        // this.body = new Ammo.btRigidBody(rbInfo);

        // physicsWorld.addRigidBody(this.body);
    }

    update(delta) {
        // Add any updates to the platform here if needed
    }
}