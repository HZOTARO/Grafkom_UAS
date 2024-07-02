import * as THREE from 'three';
import Ammo from 'ammo.js';


export let physicsWorld;
let transform;

export function setupPhysicalWorld() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
    console.log('this is setupphysicalworld')
}

export function createRigidBody(physicsWorld, threeObject, physicsShape, mass, pos, quat, scene) {
    let rbInfo;
    let body;

    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    var motionState = new Ammo.btDefaultMotionState(transform);

    var localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);

    threeObject.userData.physicsBody = body;

    scene.add(threeObject);


    if (mass > 0) {
        rigidBodies.push(threeObject);
        body.setActivationState(STATE.DISABLE_DEACTIVATION);
    }
    else {
        //body.setActivationState(STATE.DISABLE_DEACTIVATION);
        body.setCollisionFlags(body.getCollisionFlags() | Ammo.btCollisionObject.CF_STATIC_OBJECT);
    }

    physicsWorld.addRigidBody(body);

    return body;
}