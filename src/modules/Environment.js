import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { physicsWorld, setupPhysicalWorld } from './Physics.js';
import { camera } from './Camera.js';
import { scene } from './Scene.js';
import { KeyDisplay } from '../utils/utils.js';
import { Character } from '../generation/character.js';
import { Platform } from '../generation/Platform.js';
import { generateTrees } from '../generation/tree.js';
import { Light } from '../utils/lighting.js';

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

        this.runGeneration();
        this.initEventListeners();
        this.animate();
    }

    runGeneration() {
        this.createGround();
        generateTrees(this.scene,500,1);
        // this.platform = new Platform(this.scene, physicsWorld);
        this.character = new Character(this.scene, this.camera, this.orbitControls, this.physicsWorld);
        // Move the assignment of characterControls inside the callback of Character's constructor
        // to ensure it's assigned only after initialization is complete.
        this.character.characterControlsPromise.then((controls) => {
            this.characterControls = controls;
            console.log('CharacterControls initialized', this.characterControls);
        }).catch((error) => {
            console.error('Failed to initialize character controls:', error);
        });

    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();

        console.log(this.characterControls);

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

        // this.character.update(delta);

        this.renderer.render(this.scene, this.camera);
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
        this.light = new Light(scene);
        this.light.createAmbientLight(0.8);
        this.light.createHemisphericLight(0x87CEEB, 0x444444, 0.6);
        // this.scene.add(this.light.ambientLight);

        // const ambientLight = new THREE.AmbientLight(0x404040);
        // this.scene.add(ambientLight);

        // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        // directionalLight.position.set(1, 1, 1).normalize();
        // directionalLight.castShadow = true;
        // directionalLight.shadow.mapSize.width = 2048;
        // directionalLight.shadow.mapSize.height = 2048;
        // directionalLight.shadow.camera.near = 0.5;
        // directionalLight.shadow.camera.far = 500;
        // this.scene.add(directionalLight);
    }

    createButtons() {
        const flyBtn = this.createButton('Fly Mode (F)', '10px', '10px', () => this.toggleMode('fly'));
        const walkBtn = this.createButton('Walk Mode (G)', '10px', '120px', () => this.toggleMode('walk'));
        const dayBtn = this.createButton('Day Mode', '10px', '250px', () => this.setDayMode());
        const nightBtn = this.createButton('Night Mode', '10px', '350px', () => this.setNightMode());
        document.body.appendChild(flyBtn);
        document.body.appendChild(walkBtn);
        document.body.appendChild(dayBtn);
        document.body.appendChild(nightBtn);
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

    setDayMode() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.light.setAmbientLightIntensity(0.8);
        this.light.setHemisphericLightIntensity(0.6);
        this.light.setHemisphericLightColors(0x87CEEB, 0x444444);
    }

    setNightMode() {
        this.scene.background = new THREE.Color(0x000000);
        this.light.setAmbientLightIntensity(0.1);
        this.light.setHemisphericLightIntensity(0.2);
        this.light.setHemisphericLightColors(0x000000, 0x080808);
    }

}
