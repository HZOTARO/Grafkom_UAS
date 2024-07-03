import * as THREE from 'three';

export function handleFlyControls(environment, delta) {
    const fly = new THREE.Vector3();
    if (environment.keysPressed['KeyW']) fly.z += 5000.0 * delta;
    if (environment.keysPressed['KeyS']) fly.z -= 5000.0 * delta;
    if (environment.keysPressed['KeyA']) fly.x += 5000.0 * delta;
    if (environment.keysPressed['KeyD']) fly.x -= 5000.0 * delta;
    if (environment.keysPressed['Space']) fly.y += 5000.0 * delta;
    if (environment.keysPressed['Shift']) fly.y -= 5000 * delta;

    environment.flyControls.getObject().translateX(fly.x * delta);
    environment.flyControls.getObject().translateY(fly.y * delta);
    environment.flyControls.getObject().translateZ(fly.z * delta);
}
