import { KeyDisplay } from './utils.js';
import { CharacterControls } from './characterControls.js';
import { Tree, generateTrees } from './Objects/tree.js';
import { Camp } from './Objects/camp.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 1000); // Efek kabut

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 1000, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.minDistance = 10;
orbitControls.maxDistance = 20;
orbitControls.enablePan = false;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.5;
orbitControls.update();

const flyControls = new PointerLockControls(camera, document.body);
let isFlying = false;

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

const flyBtn = document.createElement('button');
flyBtn.innerText = 'Fly Mode (F)';
flyBtn.style.position = 'absolute';
flyBtn.style.top = '10px';
flyBtn.style.left = '10px';
flyBtn.addEventListener('click', () => toggleMode('fly'));
document.body.appendChild(flyBtn);

const walkBtn = document.createElement('button');
walkBtn.innerText = 'Walk Mode (G)';
walkBtn.style.position = 'absolute';
walkBtn.style.top = '10px';
walkBtn.style.left = '120px';
walkBtn.addEventListener('click', () => toggleMode('walk'));
document.body.appendChild(walkBtn);

const ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(100, 100, 100).normalize();
directionalLight.castShadow = true;
scene.add(directionalLight);

directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500;

function createGround() {
    const groundGeo = new THREE.PlaneGeometry(5000, 5000, 1000, 1000);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setPath("./heightmap/");

    textureLoader.load("grass_texture.png", texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50);

        textureLoader.load("terrain_texture.png", dispTexture => {
            dispTexture.wrapS = dispTexture.wrapT = THREE.RepeatWrapping;
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

createGround();

let characterControls;
new GLTFLoader().load('models/Soldier.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;
    });
    model.scale.set(5, 5, 5);
    model.position.set(0, -2, 0);
    scene.add(model);

    const gltfAnimations = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap = new Map();
    gltfAnimations.filter(a => a.name !== 'TPose').forEach((a) => {
        animationsMap.set(a.name, mixer.clipAction(a));
    });

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera, 'Idle');

    // Set camera position and lookAt target
    camera.position.set(0, 20, 15); // Adjust position as needed
    const modelHeadPosition = new THREE.Vector3();
    model.traverse(function (child) {
        if (child.isMesh && child.name === 'Head') { // Assuming 'Head' is the name of the head mesh
            modelHeadPosition.copy(child.getWorldPosition(new THREE.Vector3()));
        }
    });
    camera.lookAt(modelHeadPosition);
});

const keysPressed = {};
const keyDisplayQueue = new KeyDisplay();
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

generateTrees(scene, 5000, 2);
new Camp(scene, 20, {x: 0, y: 5, z: 0});

// Load skybox textures
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('./skybox/'); // Path to your skybox textures

const skyboxTexture = cubeTextureLoader.load([
    'px.png', 'nx.png', // Right, Left
    'py.png', 'ny.png', // Top, Bottom
    'pz.png', 'nz.png'  // Front, Back
]);

// Create skybox
const skybox = new THREE.Mesh(
    new THREE.BoxGeometry(10000, 10000, 10000),
    new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide })
);
scene.add(skybox);

const clock = new THREE.Clock();
function animate() {
    const delta = clock.getDelta();

    if (isFlying) {
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
    } else {
        if (characterControls) {
            characterControls.update(delta, keysPressed);
        }
        orbitControls.update();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
