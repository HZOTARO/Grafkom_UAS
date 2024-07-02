import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { physicsWorld, setupPhysicalWorld } from './Physics.js';
import { camera } from './Camera.js';
import { scene } from './Scene.js';
import { KeyDisplay } from '../utils/utils.js';
import { Character } from '../generation/character.js';
import { Platform } from '../generation/Platform.js';
import { Camp } from '../generation/camp.js';
import { generateTrees } from '../generation/tree.js';
import { Wall } from '../generation/Wall.js';
import { Fence } from '../generation/Fence.js';
import { Grass, generateGrass } from '../generation/Grass.js';
import { Firefly, generateFireflyCluster } from '../generation/Firefly.js'; // Import Firefly

export class Environment {
    constructor() {
        this.keysPressed = {};
        this.keyDisplayQueue = new KeyDisplay();
        this.characterControls = null;
        this.isFlying = false;
        this.flyControls = null;
        this.clock = new THREE.Clock();
        this.fireflyClusters = []; // Store fireflies

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
        this.character = new Character(this.scene, this.camera, this.orbitControls, this.physicsWorld);
        this.character.characterControlsPromise.then((controls) => {
            this.characterControls = controls;
            console.log('CharacterControls initialized', this.characterControls);
        }).catch((error) => {
            console.error('Failed to initialize character controls:', error);
        });
        this.camp = new Camp(this.scene, this.physicsWorld);
        this.platform = new Wall(this.scene, this.physicsWorld, { x: 5000, y: 3, z: 5000 }, { x: 0, y: -4.505, z: 0 });
        this.wall1 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 1000 }, { x: 14, y: 5, z: -620 });
        this.wall2 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 1000 }, { x: -70, y: 5, z: -620 });
        this.wall3 = new Wall(this.scene, this.physicsWorld, { x:70, y:30, z:5}, {x:-100, y:5, z:-120});
        this.wall4 = new Wall(this.scene, this.physicsWorld, { x:90, y:30, z:5}, {x:60, y:5, z:-120});
        this.wall5 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 200 }, { x: -135, y: 5, z: -20 });
        this.wall6 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 200 }, { x: 100, y: 5, z: -20 });
        this.wall6 = new Wall(this.scene, this.physicsWorld, {x:250, y:30, z:5}, {x:-20, y:5, z:80});


        this.fence1 = new Fence(this.scene, {x:30, y:-3, z:-140}, 20, Math.PI/4);
        this.fence2 = new Fence(this.scene, {x:80, y:-3, z:-130}, 20, Math.PI/2 + 0.05);
        this.fence3 = new Fence(this.scene, {x:110, y:-3, z:-100}, 20, Math.PI/12);
        this.fence4 = new Fence(this.scene, {x:110, y:-3, z:-40}, 20, Math.PI/12 -0.2);
        this.fence5 = new Fence(this.scene, {x:110, y:-3, z:20}, 20, Math.PI/12 -0.5);
        this.fence6 = new Fence(this.scene, {x:110, y:-3, z:80}, 20, Math.PI - 0.3);
        this.fence7 = new Fence(this.scene, {x:50, y:-3, z:90}, 20, Math.PI/2 + 0.1);
        this.fence8 = new Fence(this.scene, {x:-20, y:-3, z:90}, 20, Math.PI/2 - 0.05);
        this.fence9 = new Fence(this.scene, {x:-80, y:-3, z:90}, 20, Math.PI/2 - 0.1);
        this.fence10 = new Fence(this.scene, {x:-140, y:-3, z:80}, 20, Math.PI/4);
        this.fence10 = new Fence(this.scene, {x:-140, y:-3, z:30}, 20, -Math.PI/12);
        this.fence10 = new Fence(this.scene, {x:-140, y:-3, z:-40}, 20, Math.PI/24);
        this.fence11 = new Fence(this.scene, {x:-140, y:-3, z:-100}, 20, -Math.PI/24);
        this.fence12 = new Fence(this.scene, {x:-100, y:-3, z:-140}, 20, -Math.PI/4);

        // Harusnya 5000, tapi biar render e ga lama
        // generateTrees(this.scene, 2500, 1);
        this.grass = new Grass(this.scene, {x:50, y:-3, z:90}, 30, 0);
        generateGrass(this.scene, 400, 30);

        // Create multiple firefly clusters at random positions
        for (let i = 0; i < 5; i++) {
            const clusterPosition = new THREE.Vector3(
                Math.random() * 300 - 100,   // Random x position within a range
                Math.random() * 10,     // Random y position within a range
                Math.random() * 300 - 100    // Random z position within a range
            );
            const fireflyCluster = generateFireflyCluster(this.scene, 10, 0xffff00, clusterPosition);
            this.fireflyClusters.push(fireflyCluster);
        }
        
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();
    
        this.keysPressed = {
            Space: this.character.input.jump,
            KeyW: this.character.input.forward,
            KeyS: this.character.input.backward,
            KeyA: this.character.input.left,
            KeyD: this.character.input.right,
        };
    
        if (this.physicsWorld) {
            this.physicsWorld.stepSimulation(delta, 10);
        }
    
        console.log('is flying : ' + this.isFlying);
        if (this.isFlying) {
            this.handleFlyControls(delta);
        } else {
            if (this.characterControls) {
                this.characterControls.update(delta, this.keysPressed);
            }
            this.orbitControls.update();
        }
    
        this.character.update(delta);
    
        // Update all fireflies
        if (this.fireflyClusters) {
            this.fireflyClusters.forEach(cluster => {
                cluster.forEach(firefly => {
                    firefly.update();
                });
            });
        }
    
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

        document.addEventListener('click', () => {
            this.flyControls.lock();
        });

        this.flyControls.addEventListener('lock', () => {
            console.log('Pointer locked');
        });

        this.flyControls.addEventListener('unlock', () => {
            console.log('Pointer unlocked');
        });
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

    initEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.keyDisplayQueue.down(event.key);
            console.log(`Key down: ${event.key} (code: ${event.code})`);
            if (event.shiftKey && this.characterControls) {
                this.characterControls.switchRunToggle();
            } else {
                this.keysPressed[event.code] = true;
                if (event.code === 'KeyF') {
                    this.toggleMode('fly');
                } else if (event.code === 'KeyG') {
                    this.toggleMode('walk');
                }
            }
        }, false);

        document.addEventListener('keyup', (event) => {
            this.keyDisplayQueue.up(event.key);
            console.log(`Key up: ${event.key} (code: ${event.code})`);
            this.keysPressed[event.code] = false;
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
        const fly = new THREE.Vector3();
        console.log(this.keysPressed['KeyW']);
        if (this.keysPressed['KeyW']) fly.z += 5000.0 * delta;
        if (this.keysPressed['KeyS']) fly.z -= 5000.0 * delta;
        if (this.keysPressed['KeyA']) fly.x += 5000.0 * delta;
        if (this.keysPressed['KeyD']) fly.x -= 5000.0 * delta;
        if (this.keysPressed['Space']) fly.y += 5000.0 * delta;
        if (this.keysPressed['Shift']) fly.y -= 5000 * delta;

        this.flyControls.getObject().translateX(fly.x * delta);
        this.flyControls.getObject().translateY(fly.y * delta);
        this.flyControls.getObject().translateZ(fly.z * delta);
    }
}
