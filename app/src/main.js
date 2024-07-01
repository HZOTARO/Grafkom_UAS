// src/main.js

import * as THREE from 'three';
import Ammo from 'ammo.js';
import { Player } from './Player.js';
import { Platform } from './Platform.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Basic setup
let scene, camera, renderer, physicsWorld;
let player, platform, controls;
let clock = new THREE.Clock();
let cameraMode = 'third-person';  // Possible values: 'orbit', 'first-person', 'third-person'

async function init() {
    // Initialize Ammo.js
    // await Ammo();

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    scene.camera = camera;  // Attach camera to the scene

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadow maps
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Shadow map type
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true; // Enable shadows for the light
    directionalLight.shadow.mapSize.width = 2048; // Shadow map size
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    scene.add(directionalLight);

    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Player
    player = new Player(scene, physicsWorld);

    // Platform
    platform = new Platform(scene, physicsWorld);

    // Switch camera mode on key press
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Digit1') {
            cameraMode = 'orbit';
        } else if (event.code === 'Digit2') {
            cameraMode = 'first-person';
        } else if (event.code === 'Digit3') {
            cameraMode = 'third-person';
        }
    });

    // Start rendering loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    let delta = clock.getDelta();

    physicsWorld.stepSimulation(delta, 10);

    player.update(delta);
    platform.update(delta);

    if (cameraMode === 'orbit') {
        controls.enabled = true;
        controls.update();
    } else {
        controls.enabled = false;
        if (cameraMode === 'first-person') {
            updateFirstPersonCamera();
        } else if (cameraMode === 'third-person') {
            updateThirdPersonCamera();
        }
    }

    renderer.render(scene, scene.camera);
}

// Update camera positions for different views
function updateFirstPersonCamera() {
    const playerPosition = player.mesh.position.clone();
    const playerDirection = new THREE.Vector3();
    player.mesh.getWorldDirection(playerDirection);

    camera.position.copy(playerPosition);
    camera.position.y += 1.5;  // Adjust the height of the camera
    camera.lookAt(playerPosition.add(playerDirection));
}

function updateThirdPersonCamera() {
    const playerPosition = player.mesh.position.clone();
    const cameraOffset = new THREE.Vector3(0, 5, 10);
    const cameraPosition = playerPosition.add(cameraOffset);
    camera.position.copy(cameraPosition);
    camera.lookAt(player.mesh.position);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
