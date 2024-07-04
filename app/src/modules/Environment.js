import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { physicsWorld, setupPhysicalWorld } from './Physics.js';
import { camera } from './Camera.js';
import {nightSkyboxTexture, scene, skyboxTexture} from './Scene.js';
import { KeyDisplay } from '../utils/utils.js';
import { Character } from '../generation/character.js';
import { Platform } from '../generation/Platform.js';
import { Camp } from '../generation/camp.js';
import { generateTrees } from '../generation/tree.js';
import { Wall } from '../generation/Wall.js';
import { Fence } from '../generation/Fence.js';
import { Grass, generateGrass } from '../generation/Grass.js';
import { Firefly, generateFireflyCluster } from '../generation/Firefly.js'; // Import Firefly
import { Light } from '../utils/lighting.js';
import { Fire } from '../generation/Fire.js';
import { createGround } from '../generation/Ground.js'; // Import createGround
import {createButtons} from "../utils/buttons.js";
import {initEventListeners} from "../utils/eventlisteners.js";
import {toggleMode} from "../utils/togglemode.js";
import {handleFlyControls} from "../utils/flycontrolhandler.js";
import { Smoke } from "../generation/Smoke.js";

export class Environment {
    constructor() {
        this.world = {};
        this.world.BB = [];
        this.keysPressed = {};
        // this.keyDisplayQueue = new KeyDisplay();
        this.characterControls = null;
        this.isFlying = false;
        this.flyControls = null;
        this.clock = new THREE.Clock();
        this.fireflyClusters = []; // Store fireflies

        this.scene = scene;
        this.camera = camera;
        // setupPhysicalWorld();
        // this.physicsWorld = physicsWorld;

        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setDayMode();
        this.scene.background = skyboxTexture;
        // createButtons(this);

        this.runGeneration();
        initEventListeners(this);
        this.animate();
    }

    runGeneration() {
        createGround(this.scene, this.world); // Use createGround function from Ground.js
        this.character = new Character(this.scene, this.camera, this.world);
        // this.character.characterControlsPromise.then((controls) => {
        //     this.characterControls = controls;
        //     console.log('CharacterControls initialized', this.characterControls);
        // }).catch((error) => {
        //     console.error('Failed to initialize character controls:', error);
        // });
        this.camp = new Camp(this.scene, this.world);
        // this.platform = new Wall(this.scene, this.physicsWorld, { x: 5000, y: 3, z: 5000 }, { x: 0, y: -4.505, z: 0 });
        // this.wall1 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 1000 }, { x: 14, y: 5, z: -620 });
        // this.wall2 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 1000 }, { x: -70, y: 5, z: -620 });
        // this.wall3 = new Wall(this.scene, this.physicsWorld, { x:70, y:30, z:5}, {x:-100, y:5, z:-120});
        // this.wall4 = new Wall(this.scene, this.physicsWorld, { x:90, y:30, z:5}, {x:60, y:5, z:-120});
        // this.wall5 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 200 }, { x: -135, y: 5, z: -20 });
        // this.wall6 = new Wall(this.scene, this.physicsWorld, { x: 5, y: 30, z: 200 }, { x: 100, y: 5, z: -20 });
        // this.wall6 = new Wall(this.scene, this.physicsWorld, {x:250, y:30, z:5}, {x:-20, y:5, z:80});
        // this.campWall = new Wall(this.scene, this.physicsWorld, {x:120, y:100, z:110}, {x:15, y:0, z:-10});


        this.fence1 = new Fence(this.scene, this.world, {x:30, y:-3, z:-140}, 20, Math.PI/4);
        this.fence2 = new Fence(this.scene, this.world, {x:80, y:-3, z:-130}, 20, Math.PI/2 + 0.05);
        this.fence3 = new Fence(this.scene, this.world, {x:110, y:-3, z:-100}, 20, Math.PI/12);
        this.fence4 = new Fence(this.scene, this.world, {x:110, y:-3, z:-40}, 20, Math.PI/12 -0.2);
        this.fence5 = new Fence(this.scene, this.world, {x:110, y:-3, z:20}, 20, Math.PI/12 -0.5);
        this.fence6 = new Fence(this.scene, this.world, {x:110, y:-3, z:80}, 20, Math.PI - 0.3);
        this.fence7 = new Fence(this.scene, this.world, {x:50, y:-3, z:90}, 20, Math.PI/2 + 0.1);
        this.fence8 = new Fence(this.scene, this.world, {x:-20, y:-3, z:90}, 20, Math.PI/2 - 0.05);
        this.fence9 = new Fence(this.scene, this.world, {x:-80, y:-3, z:90}, 20, Math.PI/2 - 0.1);
        this.fence10 = new Fence(this.scene, this.world, {x:-140, y:-3, z:80}, 20, Math.PI/4);
        this.fence10 = new Fence(this.scene, this.world, {x:-140, y:-3, z:30}, 20, -Math.PI/12);
        this.fence10 = new Fence(this.scene, this.world, {x:-140, y:-3, z:-40}, 20, Math.PI/24);
        this.fence11 = new Fence(this.scene, this.world, {x:-140, y:-3, z:-100}, 20, -Math.PI/24);
        this.fence12 = new Fence(this.scene, this.world, {x:-100, y:-3, z:-140}, 20, -Math.PI/4);

        // Harusnya 5000, tapi biar render e ga lama
        // generateTrees(this.scene, this.world, 1000, 1);
        generateTrees(this.scene, this.world, 1000, 1);
        generateGrass(this.scene, 400, 30);

        for (let i = 0; i < 5; i++) {
            const clusterPosition = new THREE.Vector3(
                Math.random() * 300 - 100,   // Random x position within a range
                Math.random() * 10,     // Random y position within a range
                Math.random() * 300 - 100    // Random z position within a range
            );
            const fireflyCluster = generateFireflyCluster(this.scene, 10, 0xffff00, clusterPosition);
            // console.log("Fireflies generated at position:", clusterPosition);
            this.fireflyClusters.push(fireflyCluster);
        }



        this.smoke1 = new Smoke(this.scene, {x:3, y:3, z:3}, {x:-20, y:20, z:19}, 0.9);
        this.smoke2 = new Smoke(this.scene, {x:2.5, y:3, z:3}, {x:-23, y:30, z:21}, 0.7);
        this.smoke3 = new Smoke(this.scene, {x:2, y:3, z:3}, {x:-26, y:40, z:23}, 0.5);
        this.smoke4 = new Smoke(this.scene, {x:1, y:3, z:3}, {x:-22, y:50, z:22}, 0.3);
        // this.fire = new Fire(this.scene, {x:0, y:5, z:60}, 5, 5, 1000);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();


        // this.keysPressed = {
        //     KeyW: this.character.input.forward,
        //     KeyS: this.character.input.backward,
        //     KeyA: this.character.input.left,
        //     KeyD: this.character.input.right,
        // };

        if (this.physicsWorld) {
            // this.physicsWorld.stepSimulation(delta, 10);
        }

        // if (this.isFlying) {
        //     this.handleFlyControls(delta);
        // } else {
        //     if (this.characterControls) {
        //         this.characterControls.update(delta, this.keysPressed);
        //     }
        //     this.orbitControls.update();
        // }

        this.character.update(delta);

        // Update all fireflies
        if (this.fireflyClusters) {
            this.fireflyClusters.forEach(cluster => {
                cluster.forEach(firefly => {
                    firefly.update();
                });
            });
        }

        // this.fire.update(delta);

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
        const controls = new PointerLockControls( camera, document.body );

        document.addEventListener('click', () => {
            controls.lock();
        });

        // this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.orbitControls.enableDamping = true;
        // this.orbitControls.dampingFactor = 0.05;
        // this.orbitControls.minDistance = 10;
        // this.orbitControls.maxDistance = 20;
        // this.orbitControls.enablePan = false;
        // this.orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
        // this.orbitControls.minPolarAngle = Math.PI / 6;
        // this.orbitControls.update();

        // this.flyControls = new PointerLockControls(this.camera, document.body);

        // document.addEventListener('click', () => {
        //     this.flyControls.lock();
        // });
    }

    setupLighting() {
        this.light = new Light(this.scene);
        this.light.createAmbientLight(0.8);
        this.light.createHemisphericLight(0x87CEEB, 0x444444, 0.6);
        this.light.createDirectionalLight({ x: 100, y: 200, z: 100 }, 1);
        this.scene.add(this.light.ambientLight);
        this.scene.add(this.light.hemisphericLight);
        this.scene.add(this.light.directionalLight);

        // const helper = new THREE.DirectionalLightHelper(this.light.directionalLight, 10);
        // this.scene.add(helper);

        // const shadowCameraHelper = new THREE.CameraHelper(this.light.directionalLight.shadow.camera);
        // this.scene.add(shadowCameraHelper);
    }


    toggleMode(mode) {
        toggleMode(this, mode);
    }

    handleFlyControls(delta) {
        // handleFlyControls(this, delta);
    }

    setDayMode() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);
        this.light.setAmbientLightIntensity(0.8);
        // this.light.setHemisphericLightIntensity(0.6);
        // this.light.setHemisphericLightColors(0x87CEEB, 0x444444);
        this.scene.background = skyboxTexture;

        if (this.fireflyClusters && this.fireflyClusters.length > 0) {
            // Remove all firefly clusters from the scene
            this.fireflyClusters.forEach(cluster => {
                cluster.forEach(firefly => {
                    // Ensure firefly has a mesh property and it's added to the scene
                    if (firefly.mesh && firefly.mesh.parent === this.scene) {
                        this.scene.remove(firefly.circle); // Remove from scene
                    }
                });
            });
            this.fireflyClusters = []; // Clear the array
        }
        this.light.setDirectionalLightIntensity(1);
    }


    setNightMode() {
        // this.scene.background = new THREE.Color(0x000000);
        this.scene.background = nightSkyboxTexture;
        this.scene.fog = new THREE.Fog(0x000000, 100, 1000);
        this.light.setAmbientLightIntensity(0.1);
        this.light.setHemisphericLightIntensity(0.001);
        this.light.setHemisphericLightColors(0x000000, 0x080808);

        // Generate Fireflies


        this.light.setDirectionalLightIntensity(0.01);
        this.light.setHemisphericLightIntensity(0.2);
        // this.light.setHemisphericLightColors(0x000000, 0x080808); //not working idk why
        this.light.setDirectionalLightIntensity(0.5);
    }

}
