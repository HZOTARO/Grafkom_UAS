import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterControls } from '../controls/characterControls';
import { Light } from '../utils/lighting.js';

export class Character {
    constructor(scene, camera, orbitControls, physicalWorld, scale = 5, position = { x: 10, y: -2, z: 50 }, rotationY = Math.PI) {
        this.scene = scene;
        this.camera = camera;
        this.orbitControls = orbitControls;

        // Initialize lights
        this.light = new Light(scene);
        this.light.createDirectionalLight({ x: 0, y: 10, z: 10 }, 0.5);
        // this.light.createSpotLight({ x: 10, y: 40, z: 10 }, 1, Math.PI / 4);

        this.characterControlsPromise = new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load('../../asset/model/Character/Lumberjack.glb', (gltf) => {
                const model = gltf.scene;
                model.traverse((object) => {
                    if (object.isMesh) object.castShadow = true;
                });
                model.scale.set(scale, scale, scale);
                model.position.set(position.x, position.y, position.z);
                model.rotation.y = rotationY;

                // Attach lights to the model
                // const spotLight = this.light.spotLight.clone();
                // spotLight.position.set(0, 3, 0); // Example position relative to the model
                // model.add(spotLight);

                model.add(this.light.directionalLight);
                model.add(this.light.directionalLight.target);

                // const directionalLightHelper = new THREE.DirectionalLightHelper(this.light.directionalLight, 5);
                // model.add(directionalLightHelper);
                // this.scene.add(new THREE.CameraHelper(this.light.directionalLight.shadow.camera));
                // this.scene.add(new THREE.CameraHelper(this.light.spotLight.shadow.camera));
                // this.scene.add(new THREE.SpotLightHelper(this.light.spotLight))
                // model.add(this.light.spotLight);
                // model.add(this.light.spotLight.target);

                this.scene.add(model);

                const gltfAnimations = gltf.animations;
                const mixer = new THREE.AnimationMixer(model);
                const animationsMap = new Map();
                gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
                    animationsMap.set(a.name, mixer.clipAction(a));
                });

                if (!this.orbitControls) {
                    console.error('OrbitControls is undefined');
                    reject('OrbitControls is undefined');
                    return;
                }

                const characterControls = new CharacterControls(model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
                console.log('CharacterControls initialized', characterControls);
                resolve(characterControls);
            }, undefined, (error) => {
                console.error('An error occurred loading the character model:', error);
                reject(error);
            });
        });

    }
}
