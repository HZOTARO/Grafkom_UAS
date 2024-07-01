import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { physicsWorld, setupPhysicalWorld } from './Physics.js';
import { camera } from './Camera.js';
import { scene } from './Scene.js';
import { Platform } from '../generation/Platform.js';
import { Player } from '../generation/Player.js';
import { Tree, generateTrees } from '../generation/tree.js'
import { CharacterControls } from '../controls/characterControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KeyDisplay } from '../utils/utils.js';

export class Environment {
    constructor() {
        this.keysPressed = {};
        this.keyDisplayQueue = new KeyDisplay();
        this.characterControls = null;
        this.isFlying = false;
        this.flyControls = null;
        this.clock = new THREE.Clock();

        this.scene = scene;
        this.camera = camera;
        setupPhysicalWorld();
        this.physicsWorld = physicsWorld;

        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.createButtons();
        this.createGround();
        this.generateCharacter();
        generateTrees(scene, 10000, 1);

        this.initEventListeners();
        this.animate();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.minDistance = 10;
        this.orbitControls.maxDistance = 20;
        this.orbitControls.enablePan = false;
        this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.orbitControls.minPolarAngle = Math.PI / 6;
        this.orbitControls.update();

        this.flyControls = new PointerLockControls(this.camera, document.body);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1).normalize();
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
    }

    createButtons() {
        const flyBtn = this.createButton('Fly Mode (F)', '10px', '10px', () => this.toggleMode('fly'));
        const walkBtn = this.createButton('Walk Mode (G)', '10px', '120px', () => this.toggleMode('walk'));
        document.body.appendChild(flyBtn);
        document.body.appendChild(walkBtn);
    }

    createButton(innerText, top, left, onClick) {
        const button = document.createElement('button');
        button.innerText = innerText;
        button.style.position = 'absolute';
        button.style.top = top;
        button.style.left = left;
        button.addEventListener('click', onClick);
        return button;
    }

    createGround() {
        const groundGeo = new THREE.PlaneGeometry(5000, 5000, 1000, 1000);
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setPath("../../asset/terrain/");

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
                this.scene.add(groundMesh);

            }, undefined, err => {
                console.error('An error occurred loading the displacement texture:', err);
            });

        }, undefined, err => {
            console.error('An error occurred loading the diffuse texture:', err);
        });
    }

    generateCharacter() {
        const loader = new GLTFLoader();
        loader.load('../../asset/model/Character/Lumberjack.glb', (gltf) => {
            const model = gltf.scene;
            model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            model.scale.set(5, 5, 5);
            model.position.set(10, -2, 50);
            model.rotation.y = Math.PI; // Rotate model 180 degrees

            this.scene.add(model);

            const gltfAnimations = gltf.animations;
            const mixer = new THREE.AnimationMixer(model);
            const animationsMap = new Map();
            gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
                animationsMap.set(a.name, mixer.clipAction(a));
            });

            this.characterControls = new CharacterControls(model, mixer, animationsMap, this.orbitControls, this.camera, 'Idle');
        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
        });
    }

    initEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keyDisplayQueue.down(event.key);
            if (event.shiftKey && this.characterControls) {
                this.characterControls.switchRunToggle();
            } else {
                this.keysPressed[event.key.toLowerCase()] = true;
                if (event.key.toLowerCase() === 'f') {
                    this.toggleMode('fly');
                } else if (event.key.toLowerCase() === 'g') {
                    this.toggleMode('walk');
                }
            }
        }, false);

        document.addEventListener('keyup', (event) => {
            this.keyDisplayQueue.up(event.key);
            this.keysPressed[event.key.toLowerCase()] = false;
        }, false);
    }

    toggleMode(mode) {
        if (mode === 'fly') {
            this.isFlying = true;
            this.flyControls.lock();
            this.orbitControls.enabled = false;
        } else if (mode === 'walk') {
            this.isFlying = false;
            this.flyControls.unlock();
            this.orbitControls.enabled = true;
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();

        if (this.physicsWorld) {
            this.physicsWorld.stepSimulation(delta, 10);
        }

        if (this.isFlying) {
            this.handleFlyControls(delta);
        } else {
            if (this.characterControls) {
                this.characterControls.update(delta, this.keysPressed);
            }
            this.orbitControls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleFlyControls(delta) {
        const velocity = new THREE.Vector3();
        if (this.keysPressed['w']) velocity.z -= 5000.0 * delta;
        if (this.keysPressed['s']) velocity.z += 5000.0 * delta;
        if (this.keysPressed['a']) velocity.x -= 5000.0 * delta;
        if (this.keysPressed['d']) velocity.x += 5000.0 * delta;
        if (this.keysPressed[' ']) velocity.y += 5000.0 * delta;
        if (this.keysPressed['shift']) velocity.y -= 5000 * delta;

        this.flyControls.getObject().translateX(velocity.x * delta);
        this.flyControls.getObject().translateY(velocity.y * delta);
        this.flyControls.getObject().translateZ(velocity.z * delta);
    }
}