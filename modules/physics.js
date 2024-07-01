import * as THREE from 'three';
import { scene } from './scene.js';

export let physicsWorld;
let tmpTrans;

export function setupPhysicsWorld() {
    tmpTrans = new Ammo.btTransform();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

const rigidBodies = [];
const STATE = {
    DISABLE_DEACTIVATION: 4
};
const FLAGS = {
    CF_KINEMATIC_OBJECT: 2
};

export function createRigidBody(threeObject, physicsShape, mass, pos, quat) {
    let rbInfo;
    let body;

    threeObject.position.copy(pos);
    threeObject.quaternion.copy(quat);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia);
    body = new Ammo.btRigidBody(rbInfo);

    threeObject.userData.physicsBody = body;

    scene.add(threeObject);

    if (mass > 0) {
        rigidBodies.push(threeObject);
        body.setActivationState(STATE.DISABLE_DEACTIVATION);
    } else {
        body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT);
    }

    physicsWorld.addRigidBody(body);

    return body;
}

export function updatePhysics(deltaTime) {
    physicsWorld.stepSimulation(deltaTime, 10);

    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i];
        let objAmmo = objThree.userData.physicsBody;

        let ms = objAmmo.getMotionState();
        if (ms) {
            ms.getWorldTransform(tmpTrans);
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();

            if (objThree.name === 'character') {
                objThree.quaternion.set(0, q.y(), 0, q.w());
                objThree.position.set(p.x(), 0, p.z());
            } else {
                objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
                objThree.position.set(p.x(), p.y(), p.z());
            }
        }
    }
}
