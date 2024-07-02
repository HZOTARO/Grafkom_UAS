

import * as THREE from 'three';
import Ammo from 'ammo.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Fence {
    constructor(scene, position, scale, rotation) {
        this.scene = scene;
        this.position = position;
        this.scale = scale;
        this.rotation = rotation

        const loader = new GLTFLoader();
        loader.load('../../asset/model/Fence/Fence.glb', (gltf) => {
            this.model = gltf.scene;
            this.model.traverse((object) => {
                if (object.isMesh) object.castShadow = true;
            });
            this.model.scale.set(scale, scale, scale);
            this.model.position.set(position.x, position.y, position.z);
            this.model.rotation.y = this.rotation;
        
            this.scene.add(this.model);
        
            // const gltfAnimations = gltf.animations;
            // const mixer = new THREE.AnimationMixer(this.model);
            // const animationsMap = new Map();
            // gltfAnimations.filter(a => a.name !== 'A-Pose').forEach((a) => {
            //     animationsMap.set(a.name, mixer.clipAction(a));
            // });
        
            // if (!this.orbitControls) {
            //     console.error('OrbitControls is undefined');
            //     reject('OrbitControls is undefined');
            //     return;
            // }
        
            // this.characterControls = new CharacterControls(this.model, mixer, animationsMap, this.orbitControls, this.camera, 'Poses');
        }, undefined, (error) => {
            console.error('An error occurred loading the character model:', error);
            reject(error);
        });


    }

    update(delta) {
        // Add any updates to the platform here if needed
    }
}