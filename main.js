import * as THREE from 'three';
import { KeyDisplay } from './utils.js';
import { CharacterControls } from './characterControls.js';
import { Tree, generateTrees } from './Objects/tree.js';
import { Camp } from './Objects/camp.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './modules/scene.js';
import { setupPhysicsWorld, physicsWorld, updatePhysics } from './modules/physics.js';
import { camera } from './modules/camera.js';

let renderer, orbitControls, flyControls;
let characterControls, isFlying = false;
const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
const clock = new THREE.Clock();

function init() {
    Ammo().then(() => {
        setupRenderer();
        setupControls();
        setupLighting();
        createButtons();
        createGround();
        generateCharacter();
        generateParrot();
        initEventListeners();
        generateTrees(scene, 5000, 1);
        new Camp(scene, 20, {x: 0, y: 5.5, z: 0}, physicsWorld);
        setupPhysicsWorld();
        start();
    });
}

function setupRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}

function setupControls() {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 20;
    orbitControls.enablePan = false;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05; // prevent camera below ground
    orbitControls.minPolarAngle = Math.PI / 6;        // prevent top down view
    orbitControls.update();
    
    flyControls = new PointerLockControls(camera, document.body);
}

function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100).normalize();
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

function createButtons() {
    const flyBtn = createButton('Fly Mode (F)', '10px', '10px', () => toggleMode('fly'));
    const walkBtn = createButton('Walk Mode (G)', '10px', '120px', () => toggleMode('walk'));
    document.body.appendChild(flyBtn);
    document.body.appendChild(walkBtn);
}

function createButton(innerText, top, left, onClick) {
    const button = document.createElement('button');
    button.innerText = innerText;
    button.style.position = 'absolute';
    button.style.top = top;
    button.style.left = left;
    button.addEventListener('click', onClick);
    return button;
}

function createGround() {
    const groundGeo = new THREE.PlaneGeometry(5000, 5000, 1000, 1000);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath("./heightmap/");

    textureLoader.load("grass_texture.png", texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);

        textureLoader.load("terrain_texture.png", dispTexture => {
            dispTexture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            dispTexture.repeat.set(1, 1);

            const groundMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                map: texture,
                displacementMap: dispTexture,
                displacementScale: 200,
            });

            const groundMesh = new THREE.Mesh(groundGeo, groundMat);
            groundMesh.rotation.x = -Math.PI / 2;
            groundMesh.position.y = -3;
            groundMesh.receiveShadow = true;
            scene.add(groundMesh);

        }, undefined, err => {
            console.error('An error occurred loading the displacement texture:', err);
        });

    }, undefined, err => {
        console.error('An error occurred loading the diffuse texture:', err);
    });
}

function generateCharacter() {
    new GLTFLoader().load('models/Soldier.glb', function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        model.scale.set(5, 5, 5);
        model.position.set(10, -2, 50);
        scene.add(model);

        const gltfAnimations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);
        const animationsMap = new Map();
        gltfAnimations.filter(a => a.name !== 'TPose').forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a));
        });

        characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle');
    });
}

function generateParrot() {
    new GLTFLoader().load('models/Parrot.glb', function (gltf) {
        const model = gltf.scene;
        model.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        model.scale.set(0.1, 0.1, 0.1);
        model.position.set(0, 5, 50);
        scene.add(model);

        const gltfAnimations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);

        // Menemukan dan memainkan animasi terbang
        const flyAction = mixer.clipAction(gltf.animations[0]); // Ganti [0] dengan indeks animasi terbang yang sesuai
        flyAction.play();
    });
}

function initEventListeners() {
    document.addEventListener('keydown', (event) => {
        keyDisplayQueue.down(event.key);
        if (event.shiftKey && characterControls) {
            characterControls.switchRunToggle();
        } else {
            keysPressed[event.key.toLowerCase()] = true;
            if (event.key.toLowerCase() === 'f') {
                toggleMode('fly');
            } else if (event.key.toLowerCase() === 'g') {
                toggleMode('walk');
            }
        }
    }, false);

    document.addEventListener('keyup', (event) => {
        keyDisplayQueue.up(event.key);
        keysPressed[event.key.toLowerCase()] = false;
    }, false);
}

function toggleMode(mode) {
    if (mode === 'fly') {
        isFlying = true;
        flyControls.lock();
        orbitControls.enabled = false;
    } else if (mode === 'walk') {
        isFlying = false;
        flyControls.unlock();
        orbitControls.enabled = true;
    }
}

function start() {
    function animate() {
        const delta = clock.getDelta();
        updatePhysics(delta);

        if (isFlying) {
            handleFlyControls(delta);
        } else {
            handleCharacterControls(delta);
            orbitControls.update();
        }

        renderer.render(scene, camera);

        // Assuming particleFireMesh0 and particleFireMesh1 are defined elsewhere
        // particleFireMesh0.material.update(delta * 0.75);
        // particleFireMesh1.material.update(delta);
        requestAnimationFrame(animate);
    }

    animate();
}

function handleFlyControls(delta) {
    const velocity = new THREE.Vector3();
    if (keysPressed['w']) velocity.z -= 5000.0 * delta;
    if (keysPressed['s']) velocity.z += 5000.0 * delta;
    if (keysPressed['a']) velocity.x -= 5000.0 * delta;
    if (keysPressed['d']) velocity.x += 5000.0 * delta;
    if (keysPressed[' ']) velocity.y += 5000.0 * delta;
    if (keysPressed['shift']) velocity.y -= 5000 * delta;

    flyControls.getObject().translateX(velocity.x * delta);
    flyControls.getObject().translateY(velocity.y * delta);
    flyControls.getObject().translateZ(velocity.z * delta);
}

function handleCharacterControls(delta) {
    if (characterControls) {
        characterControls.update(delta, keysPressed);
    }
}

init();
