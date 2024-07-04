import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { camera } from './Camera.js';
import { nightSkyboxTexture, scene, skyboxTexture } from './Scene.js';
import { Character } from '../generation/character.js';
import { Camp } from '../generation/camp.js';
import { generateTrees } from '../generation/tree.js';
import { Fence } from '../generation/Fence.js';
import { Grass, generateGrass } from '../generation/Grass.js';
import { Firefly, generateFireflyCluster } from '../generation/Firefly.js'; // Import Firefly
import { Light } from '../utils/lighting.js';
import { createGround } from '../generation/Ground.js'; // Import createGround
import { initEventListeners } from "../utils/eventlisteners.js";
import { Smoke } from "../generation/Smoke.js";

export class Environment {
    constructor() {
        this.world = {};
        this.world.BB = [];
        this.clock = new THREE.Clock();
        this.fireflyClusters = []; // Store fireflies

        this.scene = scene;
        this.camera = camera;

        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.setDayMode();
        this.scene.background = skyboxTexture;

        this.runGeneration();
        initEventListeners(this);
        this.animate();
    }

    runGeneration() {
        this.character = new Character(this.scene, this.camera, this.world);
        
        createGround(this.scene, this.world); // Use createGround function from Ground.js
        this.camp = new Camp(this.scene, this.world);

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

        generateTrees(this.scene, this.world, 1000, 1);
        generateGrass(this.scene, 400, 30);

        for (let i = 0; i < 5; i++) {
            const clusterPosition = new THREE.Vector3(
                Math.random() * 300 - 100,   // Random x position within a range
                Math.random() * 10,     // Random y position within a range
                Math.random() * 300 - 100    // Random z position within a range
            );
            const fireflyCluster = generateFireflyCluster(this.scene, 10, 0xffff00, clusterPosition);
            this.fireflyClusters.push(fireflyCluster);
        }



        this.smoke1 = new Smoke(this.scene, {x:3, y:3, z:3}, {x:-20, y:20, z:19}, 0.9);
        this.smoke2 = new Smoke(this.scene, {x:2.5, y:3, z:3}, {x:-23, y:30, z:21}, 0.7);
        this.smoke3 = new Smoke(this.scene, {x:2, y:3, z:3}, {x:-26, y:40, z:23}, 0.5);
        this.smoke4 = new Smoke(this.scene, {x:1, y:3, z:3}, {x:-22, y:50, z:22}, 0.3);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const delta = this.clock.getDelta();

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
        const controls = new PointerLockControls( camera, document.body );

        document.addEventListener('click', () => {
            controls.lock();
        });
    }

    setupLighting() {
        this.light = new Light(this.scene);
        this.light.createAmbientLight(0.8);
        this.light.createHemisphericLight(0x87CEEB, 0x444444, 0.6);
        this.light.createDirectionalLight({ x: 100, y: 200, z: 100 }, 1);
        this.scene.add(this.light.ambientLight);
        this.scene.add(this.light.hemisphericLight);
        this.scene.add(this.light.directionalLight);
    }

    setDayMode() {
        this.scene.fog = new THREE.Fog(0x87ceeb, 100, 1000);
        this.light.setAmbientLightIntensity(0.8);
        this.light.setHemisphericLightIntensity(0.6);
        this.light.setDirectionalLightIntensity(1);
        this.scene.background = skyboxTexture;

        // if (this.fireflyClusters && this.fireflyClusters.length > 0) {
        //     // Remove all firefly clusters from the scene
        //     this.fireflyClusters.forEach(cluster => {
        //         cluster.forEach(firefly => {
        //             // Ensure firefly has a mesh property and it's added to the scene
        //             if (firefly.mesh && firefly.mesh.parent === this.scene) {
        //                 this.scene.remove(firefly.circle); // Remove from scene
        //             }
        //         });
        //     });
        //     this.fireflyClusters = []; // Clear the array
        // }
    }


    setNightMode() {
        this.scene.background = nightSkyboxTexture;
        this.scene.fog = new THREE.Fog(0x000000, 100, 1000);
        this.light.setAmbientLightIntensity(0.1);
        this.light.setHemisphericLightIntensity(0.01);
        this.light.setDirectionalLightIntensity(0.2);

        // Generate Fireflies

        // this.light.setHemisphericLightIntensity(0.2);
        // this.light.setHemisphericLightColors(0x000000, 0x080808); //not working idk why
        // this.light.setDirectionalLightIntensity(0.5);
    }
}