import * as THREE from 'three';
import Ammo from 'ammo.js';
import { createRigidBody } from '../modules/Physics';

/* 
    this.mesh.visible = false -> supaya tidak keliatan
*/

export class Wall {
    constructor(scene, physicsWorld, size, position) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        // Three.js Mesh
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.castShadow = true;  // Enable casting shadows
        this.mesh.receiveShadow = true;  // Enable receiving shadows
        this.mesh.visible = true;
        scene.add(this.mesh);

        let wallShape = new Ammo.btBoxShape(new Ammo.btVector3(size.x / 2, size.y / 2, size.z / 2));
        wallShape.setMargin(0.1);
        createRigidBody(physicsWorld, this.mesh, wallShape, 0, this.mesh.position, this.mesh.quaternion, scene);

        // Ammo.js Physics
        // const transform = new Ammo.btTransform();
        // transform.setIdentity();
        // transform.setOrigin(new Ammo.btVector3(10, -0.5, 0));
        // const motionState = new Ammo.btDefaultMotionState(transform);

        // const colShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 10, 10));
        // const localInertia = new Ammo.btVector3(0, 0, 0);
        // colShape.calculateLocalInertia(0, localInertia);

        // const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, colShape, localInertia);
        // this.body = new Ammo.btRigidBody(rbInfo);

        // // Set collision flags to make the wall non-physics-penetrable
        // this.body.setCollisionFlags(this.body.getCollisionFlags() | Ammo.btCollisionObject.CF_STATIC_OBJECT);

        // // Set collision group and mask
        // const group = 1 << 1; // group 2 (binary: 10)
        // const mask = -1 ^ (1 << 1); // collide with all except group 2

        // physicsWorld.addRigidBody(this.body, group, mask);
    }

    update(delta) {
        // Add any updates to the platform here if needed
    }
}
